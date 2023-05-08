import { Client } from '@notionhq/client';

//v1 of the api return the properties values in database query whereas v2 does not. Avoid a lot of calls
const getClient = (notionToken: string, version = '2022-02-22') => {
  return new Client({
    auth: notionToken,
    notionVersion: version,
    baseUrl: `${window.location.origin}/api/notion`,
    fetch: fetchWithRetry,
  });
};

const fetchWithRetry: typeof fetch = async (input, init) => {
  const results = await fetch(input, init);
  if (Number(results.status) === 504) {
    return await fetchWithRetry(input, init);
  }
  if (Number(results.status === 400) && init?.method === 'PATCH') {
    // Ignore for now, sometimes pages are archived even if we recieved a 504 earlier
    return new Response();
  }
  return results;
};

export { getClient };
