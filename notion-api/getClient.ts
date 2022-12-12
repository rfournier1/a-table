import { Client } from '@notionhq/client';

//v1 of the api return the properties values in database query whereas v2 does not. Avoid a lot of calls
const getClient = (notionToken: string) => {
  return new Client({
    auth: notionToken,
    notionVersion: '2022-02-22',
  });
};

export { getClient };
