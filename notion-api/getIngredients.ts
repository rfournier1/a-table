import { GetPageResponse } from '@notionhq/client/build/src/api-endpoints';
import queryAllPaginatedAPI from '../helpers/queryAllPaginatedAPI';
import { getClient } from './getClient';

const client = getClient();

export const getIngredients = async () => {
  const ingredientsDatabaseId = process.env.NOTION_INGREDIENTS_DATABASE_ID;
  if (ingredientsDatabaseId === undefined) {
    throw new Error('NOTION_INGREDIENTS_DATABASE_ID is not defined');
  }

  const ingredients: Record<string, GetPageResponse> = Object.assign(
    {},
    ...(
      await queryAllPaginatedAPI(client.databases.query, {
        database_id: ingredientsDatabaseId,
      })
    ).map((ingredient) => ({ [ingredient.id]: ingredient }))
  );

  return { ingredients };
};
