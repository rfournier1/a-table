import { Client } from '@notionhq/client';

//v1 of the api return the properties values in database query whereas v2 does not
const notionv1Client = new Client({
  auth: process.env.NOTION_ITEGRATION_TOKEN,
  notionVersion: '2022-02-22',
});

export const getClient = () => notionv1Client;
