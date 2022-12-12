import { Client } from '@notionhq/client';
import {
  DatabaseObjectResponse,
  SearchParameters,
} from '@notionhq/client/build/src/api-endpoints';

export const getDatabaseId = async (databaseName: string, client: Client) => {
  const query = databaseName;
  const filter: SearchParameters['filter'] = {
    property: 'object',
    value: 'database',
  };
  const response = await client.search({
    query,
    filter,
  });
  const databaseId = response.results.find(
    (result) =>
      (result as DatabaseObjectResponse).title[0]?.plain_text === databaseName
  )?.id;

  return databaseId;
};
