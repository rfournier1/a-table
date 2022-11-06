import queryAllPaginatedAPI from '../helpers/queryAllPaginatedAPI';
import { useMealsProperties } from '../types';
import { getClient } from './getClient';

const client = getClient();

export const getMeals = async ({ firstDate, lastDate }: useMealsProperties) => {
  const mealDatabaseId = process.env.NOTION_MEAL_DATABASE_ID;

  if (mealDatabaseId === undefined) {
    throw new Error('NOTION_MEAL_DATABASE_ID is not defined');
  }
  const additionnalIngredientsDatabaseId =
    process.env.NOTION_ADDITIONNAL_INGREDIENTS_DATABASE_ID;
  if (additionnalIngredientsDatabaseId === undefined) {
    throw new Error(
      'NOTION_ADDITIONNAL_INGREDIENTS_DATABASE_ID is not defined'
    );
  }
  const meals = //TO DO: handle pagination as max limit per page is 100
    await client.databases.query({
      database_id: mealDatabaseId,
      filter: {
        and: [
          {
            date: {
              on_or_before: lastDate.toISOString(),
            },
            property: 'Date',
          },
          {
            date: {
              on_or_after: firstDate.toISOString(),
            },
            property: 'Date',
          },
        ],
      },
    });

  const additonnalIngredients = await queryAllPaginatedAPI(
    client.databases.query,
    {
      database_id: additionnalIngredientsDatabaseId,
    }
  );

  return { meals, additonnalIngredients };
};
