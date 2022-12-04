import { Client } from '@notionhq/client';
import { GetPageResponse } from '@notionhq/client/build/src/api-endpoints';
import queryAllPaginatedAPI from '../helpers/queryAllPaginatedAPI';
import { useReciepeIngredientsRelationsProperties } from '../types';

export const getReciepeIngredientsRelations = async (
  {
    reciepeIngredientsRelationDatabaseId,
    start_cursor,
  }: useReciepeIngredientsRelationsProperties & { start_cursor?: string },
  client: Client
) => {
  const response = await client.databases.query({
    database_id: reciepeIngredientsRelationDatabaseId,
    start_cursor,
  });
  return {
    has_more: response.has_more,
    next_cursor: response.next_cursor,
    results: response.results.map((reciepeIngredientsRelation) => ({
      [reciepeIngredientsRelation.id]: reciepeIngredientsRelation,
    })),
  };
};
