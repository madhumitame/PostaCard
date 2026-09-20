const postcard = { message:'', name:'', image:null, imageId:null };
const $ = id => document.getElementById(id);

function go(step){
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  $('panel'+step)?.classList.add('active');
  document.querySelectorAll('.step').forEach(s=>s.classList.toggle('active',Number(s.dataset.step)<=step));
  window.scrollTo({top:0,behavior:'smooth'});
}
function updatePreview(){
  $('charCount').textContent=`${postcard.message.length} / 500`;
  $('backMessage').textContent=postcard.message || 'Your message will appear here...';
  $('backFrom').textContent=postcard.name ? `— From ${postcard.name}, with love 💛` : '— From you, with love 💛';
  ['frontImg','bigFrontImg'].forEach(id=>{const img=$(id); if(postcard.image){img.src=postcard.image;img.classList.add('visible')}else{img.removeAttribute('src');img.classList.remove('visible')}});
  ['defaultArt','bigDefaultArt'].forEach(id=>$(id)?.classList.toggle('hidden',!!postcard.image));
}
function setStatus(text){$('shareNote').textContent=text||''}
function showShareLink(link){$('shareLinkBox').classList.add('visible');$('shareLink').value=link}
async function copyText(text){
  if(navigator.clipboard && window.isSecureContext){await navigator.clipboard.writeText(text);return}
  const area=document.createElement('textarea'); area.value=text; area.style.position='fixed';area.style.opacity='0';document.body.appendChild(area);area.focus();area.select();
  if(!document.execCommand('copy')) throw new Error('copy failed'); area.remove();
}

$('message').addEventListener('input',e=>{postcard.message=e.target.value;updatePreview()});
$('fromName').addEventListener('input',e=>{postcard.name=e.target.value;updatePreview()});
$('imageUpload').addEventListener('change',e=>{
  const file=e.target.files?.[0]; if(!file)return;
  if(!file.type.startsWith('image/')){alert('Please choose an image.');return}
  if(file.size>5*1024*1024){alert('Please choose an image smaller than 5MB.');e.target.value='';return}
  const reader=new FileReader(); reader.onload=()=>{postcard.image=reader.result;postcard.imageId=null;$('thumbPreview').src=postcard.image;$('thumbPreview').classList.add('visible');$('uploadText').textContent=file.name;$('uploadSub').textContent='Photo added ✓';$('removeImgBtn').classList.add('visible');updatePreview()}; reader.readAsDataURL(file);
});
$('removeImgBtn').addEventListener('click',()=>{postcard.image=null;postcard.imageId=null;$('imageUpload').value='';$('thumbPreview').classList.remove('visible');$('uploadText').textContent='Tap to upload your photo';$('uploadSub').textContent='JPG, PNG, WEBP or GIF · max 5MB';$('removeImgBtn').classList.remove('visible');updatePreview()});
$('toPreviewBtn').addEventListener('click',()=>{updatePreview();go(2)});
$('backToEdit').addEventListener('click',()=>go(1));
$('toShareBtn').addEventListener('click',()=>go(3));
$('newBtn').addEventListener('click',()=>location.href=location.pathname);

async function uploadImage(){
  if(!postcard.image)return null;
  if(postcard.imageId)return postcard.imageId;
  const r=await fetch('/.netlify/functions/upload-image',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:postcard.image})});
  const data=await r.json().catch(()=>({})); if(!r.ok)throw new Error(data.error||'Photo upload failed.'); postcard.imageId=data.id; return data.id;
}
async function createPostcard(){
  setStatus('Preparing your postcard…');
  const imageId=await uploadImage();
  const r=await fetch('/.netlify/functions/create-postcard',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:postcard.message,name:postcard.name,imageId})});
  const data=await r.json().catch(()=>({})); if(!r.ok)throw new Error(data.error||'Could not create postcard.'); return data;
}
async function getShareLink(){if(window.__shareUrl)return window.__shareUrl;const result=await createPostcard();window.__shareUrl=result.url;return result.url}

$('copyBtn').addEventListener('click',async()=>{try{const link=await getShareLink();showShareLink(link);await copyText(link);setStatus('Photo-inclusive share link copied ✓')}catch(e){setStatus(e.message||'Could not create the share link.')}});
$('copyLinkAgain').addEventListener('click',async()=>{try{await copyText($('shareLink').value);setStatus('Copied ✓')}catch{$('shareLink').focus();$('shareLink').select();setStatus('Long-press the selected link to copy it.')}});
$('emailBtn').addEventListener('click',async()=>{try{const link=await getShareLink();showShareLink(link);const subject=encodeURIComponent('A little PostaCard for you 💌');const body=encodeURIComponent(`I made you a virtual postcard 💌\n\n${link}`);location.href=`mailto:?subject=${subject}&body=${body}`}catch(e){setStatus(e.message||'Could not create the postcard link.')}});
$('nativeShareBtn').addEventListener('click',async()=>{try{const link=await getShareLink();showShareLink(link);if(navigator.share){await navigator.share({title:'A little PostaCard for you 💌',text:postcard.message||'I made you a virtual postcard 💌',url:link});setStatus('Shared ✓')}else{await copyText(link);setStatus('Share link copied ✓')}}catch(e){if(e?.name!=='AbortError')setStatus(e.message||'Sharing was unavailable.')}});

async function captureSide(el){if(typeof html2canvas==='undefined')throw new Error('download library unavailable');return html2canvas(el,{scale:2,useCORS:true,backgroundColor:null})}
$('downloadBtn').addEventListener('click',async()=>{
  setStatus('Preparing both sides…');
  try{
    const front=await captureSide($('bigPostcardFront')), back=await captureSide($('bigPostcardBack')); const gap=30;
    const canvas=document.createElement('canvas');canvas.width=Math.max(front.width,back.width);canvas.height=front.height+back.height+gap;const ctx=canvas.getContext('2d');ctx.fillStyle='#fffaf6';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(front,0,0);ctx.drawImage(back,0,front.height+gap);
    const a=document.createElement('a');a.download='postacard-front-and-back.png';a.href=canvas.toDataURL('image/png');a.click();setStatus('Both sides downloaded ✓');
  }catch(e){setStatus('Download could not start. Try the Share option instead.')}
});
$('frontSideBtn').addEventListener('click',()=>{$('bigPostcard').classList.remove('show-back');$('frontSideBtn').classList.add('active');$('backSideBtn').classList.remove('active')});
$('backSideBtn').addEventListener('click',()=>{$('bigPostcard').classList.add('show-back');$('backSideBtn').classList.add('active');$('frontSideBtn').classList.remove('active')});
$('aboutBtn').addEventListener('click',()=>$('aboutModal').classList.add('open'));$('closeAbout').addEventListener('click',()=>$('aboutModal').classList.remove('open'));$('aboutModal').addEventListener('click',e=>{if(e.target===$('aboutModal'))$('aboutModal').classList.remove('open')});

async function restoreShared(id){
  try{
    const r=await fetch(`/.netlify/functions/postcard/${encodeURIComponent(id)}`);const data=await r.json();if(!r.ok)throw new Error();
    postcard.message=data.message||'';postcard.name=data.name||'';postcard.imageId=data.imageId||null;
    $('message').value=postcard.message;$('fromName').value=postcard.name;
    if(postcard.imageId){postcard.image=`/.netlify/functions/image/${encodeURIComponent(postcard.imageId)}`;$('bigFrontImg').src=postcard.image;$('frontImg').src=postcard.image;$('bigFrontImg').classList.add('visible');$('frontImg').classList.add('visible');$('bigDefaultArt').classList.add('hidden');$('defaultArt').classList.add('hidden')}
    updatePreview();go(2);setStatus('Shared postcard loaded 💌');
  }catch{setStatus('That postcard link could not be found.');}
}
updatePreview();
const id=new URLSearchParams(location.search).get('p');if(id)restoreShared(id);
