import { Client } from '@notionhq/client';
import { GetPageResponse } from '@notionhq/client/build/src/api-endpoints';
import queryAllPaginatedAPI from '../helpers/queryAllPaginatedAPI';
import { useReciepesProperties } from '../types';

export const getReciepes = async (
  { reciepesDatabaseId }: useReciepesProperties,
  client: Client
): Promise<Record<string, GetPageResponse>> => {
  return Object.assign(
    {},
    ...(
      await queryAllPaginatedAPI(client.databases.query, {
        database_id: reciepesDatabaseId,
      })
    ).map((reciepe) => ({ [reciepe.id]: reciepe }))
  );
};
