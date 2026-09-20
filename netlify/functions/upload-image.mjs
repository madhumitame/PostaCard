import { getStore } from '@netlify/blobs';

export default async (request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  try {
    const body = await request.json();
    const image = body?.image;
    if (typeof image !== 'string' || !image.startsWith('data:image/')) return Response.json({error:'A valid image is required.'},{status:400});
    if (image.length > 8_000_000) return Response.json({error:'Image is too large. Please use a photo under 5 MB.'},{status:413});
    const match = image.match(/^data:(image\/(?:jpeg|jpg|png|webp|gif));base64,(.+)$/i);
    if (!match) return Response.json({error:'Unsupported image format.'},{status:400});
    const mime = match[1].toLowerCase().replace('jpg','jpeg');
    const bytes = Uint8Array.from(atob(match[2]), c => c.charCodeAt(0));
    const store = getStore({ name:'postacard-images', consistency:'strong' });
    const id = crypto.randomUUID();
    await store.set(id, bytes, { metadata:{ contentType:mime } });
    return Response.json({ id });
  } catch (e) {
    console.error(e);
    return Response.json({error:'Could not store the photo.'},{status:500});
  }
};
