import { getStore } from '@netlify/blobs';

export default async (request) => {
  if (request.method !== 'POST') return new Response('Method not allowed',{status:405});
  try {
    const body = await request.json();
    const message = typeof body?.message === 'string' ? body.message.slice(0,500) : '';
    const name = typeof body?.name === 'string' ? body.name.slice(0,100) : '';
    const imageId = typeof body?.imageId === 'string' ? body.imageId : null;
    if (!message && !imageId) return Response.json({error:'Postcard is empty.'},{status:400});
    const store = getStore({ name:'postacard-postcards', consistency:'strong' });
    const id = crypto.randomUUID();
    await store.setJSON(id, {message,name,imageId,createdAt:new Date().toISOString()});
    const origin = new URL(request.url).origin;
    return Response.json({id,url:`${origin}/p/${encodeURIComponent(id)}`});
  } catch (e) { console.error(e); return Response.json({error:'Could not create postcard.'},{status:500}); }
};
