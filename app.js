let currentStep=1;
let postcard={message:"",name:"",image:null};

const $=id=>document.getElementById(id);
const steps=[...document.querySelectorAll(".step")];

function go(step){
  currentStep=step;
  document.querySelectorAll(".panel").forEach(x=>x.classList.remove("active"));
  $("panel"+step).classList.add("active");
  steps.forEach((s,i)=>{s.classList.toggle("active",i===step-1);s.classList.toggle("done",i<step-1)});
  window.scrollTo({top:0,behavior:"smooth"});
}

function updatePreview(){
  postcard.message=$("message").value;
  postcard.name=$("fromName").value;
  $("charCount").textContent=postcard.message.length+" / 500";
  $("backMessage").textContent=postcard.message||"Your message will appear here...";
  $("backFrom").textContent=postcard.name?"— From "+postcard.name+" 💛":"— From you, with love 💛";
}

function setImage(src){
  postcard.image=src;
  ["frontImg","bigFrontImg"].forEach(id=>{const im=$(id);im.src=src;im.style.display="block"});
  ["defaultArt","bigDefaultArt"].forEach(id=>$(id).style.display="none");
  $("uploadArea").classList.add("has-photo");
  $("thumbPreview").src=src;
  $("thumbPreview").classList.add("visible");
  $("removeImgBtn").classList.add("visible");
}

$("message").addEventListener("input",updatePreview);
$("fromName").addEventListener("input",updatePreview);

$("imageUpload").addEventListener("change",e=>{
  const f=e.target.files[0]; if(!f)return;
  if(f.size>5*1024*1024){alert("Please choose a photo under 5MB 📸");return}
  const r=new FileReader();r.onload=()=>setImage(r.result);r.readAsDataURL(f);
});
$("uploadArea").addEventListener("dragover",e=>{e.preventDefault();$("uploadArea").classList.add("dragover")});
$("uploadArea").addEventListener("dragleave",()=>$("uploadArea").classList.remove("dragover"));
$("uploadArea").addEventListener("drop",e=>{
  e.preventDefault();$("uploadArea").classList.remove("dragover");
  const f=e.dataTransfer.files[0];if(!f||!f.type.startsWith("image/"))return;
  const r=new FileReader();r.onload=()=>setImage(r.result);r.readAsDataURL(f);
});
$("removeImgBtn").addEventListener("click",e=>{
  e.preventDefault();e.stopPropagation();postcard.image=null;$("imageUpload").value="";
  $("uploadArea").classList.remove("has-photo");$("thumbPreview").src="";
  $("removeImgBtn").classList.remove("visible");
  ["frontImg","bigFrontImg"].forEach(id=>$(id).style.display="none");
  ["defaultArt","bigDefaultArt"].forEach(id=>$(id).style.display="block");
});

$("toPreviewBtn").onclick=()=>{updatePreview();go(2)};
$("backToEdit").onclick=()=>go(1);
$("toShareBtn").onclick=()=>{updatePreview();makeShareLink();go(3)};
$("newBtn").onclick=()=>location.href=location.pathname;

$("frontSideBtn").onclick=()=>{
  $("bigPostcard").classList.remove("back");$("bigPostcard").classList.add("front");
  $("backContent").style.display="none";$("frontSideBtn").classList.add("active");$("backSideBtn").classList.remove("active");
};
$("backSideBtn").onclick=()=>{
  $("bigPostcard").classList.remove("front");$("bigPostcard").classList.add("back");
  $("backContent").style.display="block";$("frontSideBtn").classList.remove("active");$("backSideBtn").classList.add("active");
};

function encodeData(){
  const data={m:postcard.message,n:postcard.name};
  // Images are intentionally kept out of the URL. Large base64 photos make URLs unreliable.
  return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}
function makeShareLink(){
  const url=location.origin+location.pathname+"#postcard="+encodeData();
  $("shareLink").value=url;
  $("shareNote").textContent=postcard.image
    ?"The share link contains your message and name. The photo stays with this browser, so use Download or Share for a photo-inclusive copy."
    :"The link contains the postcard message and name.";
  history.replaceState(null,"",url);
}
async function copyText(text){
  try{await navigator.clipboard.writeText(text);return true}catch{
    const t=document.createElement("textarea");t.value=text;document.body.appendChild(t);t.select();document.execCommand("copy");t.remove();return true;
  }
}
$("copyBtn").onclick=async()=>{makeShareLink();await copyText($("shareLink").value);$("shareNote").textContent="Copied! Paste the link into a message, text, or social post."};
$("copyLinkAgain").onclick=async()=>{await copyText($("shareLink").value);$("shareNote").textContent="Copied!"};

$("emailBtn").onclick=()=>{
  makeShareLink();
  const subject=encodeURIComponent((postcard.name?postcard.name+" sent you a postcard 💌":"A little postcard for you 💌"));
  const body=encodeURIComponent("I made you a virtual postcard on PostaCard 💌\n\n"+$("shareLink").value);
  location.href=`mailto:?subject=${subject}&body=${body}`;
};

$("nativeShareBtn").onclick=async()=>{
  makeShareLink();
  const data={title:"A virtual postcard 💌",text:"I made you a virtual postcard on PostaCard.",url:$("shareLink").value};
  if(navigator.share){try{await navigator.share(data)}catch(e){}}
  else{await copyText($("shareLink").value);alert("Sharing isn't available here, so the link was copied instead.")}
};

$("downloadBtn").onclick=async()=>{
  if(!window.html2canvas){alert("Download library is still loading. Please try again.");return}
  const el=$("bigPostcard");
  const old=el.className;el.classList.remove("back");el.classList.add("front");
  $("backContent").style.display="none";
  const canvas=await html2canvas(el,{scale:2,useCORS:true,backgroundColor:"#ffffff"});
  el.className=old;
  const a=document.createElement("a");a.download="postacard.png";a.href=canvas.toDataURL("image/png");a.click();
};

$("aboutBtn").onclick=()=>$("aboutModal").classList.add("show");
$("closeAbout").onclick=()=>$("aboutModal").classList.remove("show");
$("aboutModal").onclick=e=>{if(e.target.id==="aboutModal")e.currentTarget.classList.remove("show")};

(function loadShared(){
  const match=location.hash.match(/postcard=([^&]+)/); if(!match)return;
  try{
    const data=JSON.parse(decodeURIComponent(escape(atob(match[1]))));
    $("message").value=data.m||"";$("fromName").value=data.n||"";updatePreview();
  }catch(e){}
})();
