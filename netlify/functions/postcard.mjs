import { getStore } from '@netlify/blobs';

export default async (request, context) => {
  const id = context.params.id;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return Response.json({error:'Not found'},{status:404});
  try {
    const store = getStore({ name:'postacard-postcards', consistency:'strong' });
    const data = await store.get(id,{type:'json'});
    if (!data) return Response.json({error:'Not found'},{status:404});
    return Response.json(data,{headers:{'Cache-Control':'public, max-age=60'}});
  } catch (e) { console.error(e); return Response.json({error:'Not found'},{status:404}); }
};
