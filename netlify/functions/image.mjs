import { getStore } from '@netlify/blobs';

export default async (request, context) => {
  const id = context.params.id;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return new Response('Not found',{status:404});
  try {
    const store = getStore({ name:'postacard-images', consistency:'strong' });
    const result = await store.getWithMetadata(id, { type:'arrayBuffer' });
    if (!result?.data) return new Response('Not found',{status:404});
    return new Response(result.data, { headers:{'Content-Type':result.metadata?.contentType || 'image/jpeg','Cache-Control':'public, max-age=31536000, immutable'} });
  } catch (e) { console.error(e); return new Response('Not found',{status:404}); }
};
