import { Client } from '@notionhq/client';
import { GetPageResponse } from '@notionhq/client/build/src/api-endpoints';
import queryAllPaginatedAPI from '../helpers/queryAllPaginatedAPI';
import { useAdditionalIngredientsProperties } from '../types';

export async function getAdditionalIngredients(
  { additionalIngredientsDatabaseId }: useAdditionalIngredientsProperties,
  client: Client
): Promise<GetPageResponse[]> {
  return queryAllPaginatedAPI(client.databases.query, {
    database_id: additionalIngredientsDatabaseId,
  });
}
