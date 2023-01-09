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

export const getDatabaseIdWithName = async (
  databaseName: string,
  client: Client
) => {
  const id = await getDatabaseId(databaseName, client);
  return { name: databaseName, id };
};

export const getDatabasesIds = async (
  databasesNames: string[],
  client: Client
): Promise<Record<string, string>> => {
  return (
    await Promise.all(
      databasesNames.map((dbName) => getDatabaseIdWithName(dbName, client))
    )
  ).reduce((acc, curr) => ({ ...acc, [curr.name]: curr.id }), {});
};
