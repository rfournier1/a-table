import { Client } from '@notionhq/client';
import { GetPageResponse } from '@notionhq/client/build/src/api-endpoints';
import queryAllPaginatedAPI from '../helpers/queryAllPaginatedAPI';
import { useReciepeIngredientsRelationsProperties } from '../types';

export const getReciepeIngredientsRelations = async (
  {
    reciepeIngredientsRelationDatabaseId,
  }: useReciepeIngredientsRelationsProperties,
  client: Client
): Promise<Record<string, GetPageResponse>> => {
  return Object.assign(
    {},
    ...(
      await queryAllPaginatedAPI(client.databases.query, {
        database_id: reciepeIngredientsRelationDatabaseId,
      })
    ).map((ingredient) => ({ [ingredient.id]: ingredient }))
  );
};
