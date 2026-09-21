import { getStore } from '@netlify/blobs';

export default async (request) => {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const store = getStore({
      name: 'postacard-postcards',
      consistency: 'strong'
    });

    const data = await store.get(id, { type: 'json' });

    if (!data) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    return Response.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=60'
      }
    });

  } catch (e) {
    console.error('postcard function error:', e);
    return Response.json(
      { error: 'Could not load postcard' },
      { status: 500 }
    );
  }
};