import { Client } from '@notionhq/client';
import queryAllPaginatedAPI from '../helpers/queryAllPaginatedAPI';
import { useMealsProperties } from '../types';

export const getMeals = async (
  { firstDate, lastDate, mealDatabaseId }: useMealsProperties,
  client: Client
) => {
  //TO DO: handle pagination as max limit per page is 100
  return client.databases.query({
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
};
