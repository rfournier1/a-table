import { Client } from '@notionhq/client';
import { GetPageResponse } from '@notionhq/client/build/src/api-endpoints';
import queryAllPaginatedAPI from '../helpers/queryAllPaginatedAPI';
import { useIngredientsProperties } from '../types';

export const getIngredients = async (
  { ingredientsDatabaseId }: useIngredientsProperties,
  client: Client
): Promise<Record<string, GetPageResponse>> => {
  return Object.assign(
    {},
    ...(
      await queryAllPaginatedAPI(client.databases.query, {
        database_id: ingredientsDatabaseId,
      })
    ).map((ingredient) => ({ [ingredient.id]: ingredient }))
  );
};
