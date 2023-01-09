import { Client } from '@notionhq/client';

//v1 of the api return the properties values in database query whereas v2 does not. Avoid a lot of calls
const getClient = (notionToken: string, version = '2022-02-22') => {
  return new Client({
    auth: notionToken,
    notionVersion: version,
    baseUrl: `${window.location.origin}/api/notion`,
  });
};

export { getClient };
