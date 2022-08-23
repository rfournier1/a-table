import { Client, isFullPage, iteratePaginatedAPI } from '@notionhq/client';
import {
  isNumberPropertyItemObjectResponse,
  isPropertyItemListResponse,
  isRelationPropertyItemObjectResponse,
} from '../../helpers/typeGuards';
import queryAllPaginatedAPI from '../../helpers/queryAllPaginatedAPI';
import { GetPageResponse } from '@notionhq/client/build/src/api-endpoints';
import { ShoppingList } from '../../types';

//v1 of the api return the properties values in database query whereas v2 does not
const notionv1Client = new Client({
  auth: process.env.NOTION_ITEGRATION_TOKEN,
  notionVersion: '2022-02-22',
});

interface getShoppingListFromMealsProps {
  firstDate: Date;
  lastDate: Date;
}
export const getShoppingListFromMeals = async ({
  firstDate,
  lastDate,
}: getShoppingListFromMealsProps): Promise<ShoppingList> => {
  const mealDatabaseId = process.env.NOTION_MEAL_DATABASE_ID;
  const reciepeDatabaseId = process.env.NOTION_RECIEPE_DATABASE_ID;
  const ingredientsDatabaseId = process.env.NOTION_INGREDIENTS_DATABASE_ID;
  const reciepeIngredientsRelationDatabaseId =
    process.env.NOTION_RECIEPE_INGREDIENTS_RELATION_DATABASE_ID;
  if (mealDatabaseId === undefined) {
    throw new Error('NOTION_MEAL_DATABASE_ID is not defined');
  }
  if (reciepeDatabaseId === undefined) {
    throw new Error('NOTION_RECIEPE_DATABASE_ID is not defined');
  }
  if (ingredientsDatabaseId === undefined) {
    throw new Error('NOTION_INGREDIENTS_DATABASE_ID is not defined');
  }
  if (reciepeIngredientsRelationDatabaseId === undefined) {
    throw new Error(
      'NOTION_RECIEPE_INGREDIENTS_RELATION_DATABASE_ID is not defined'
    );
  }

  //TO DO: handle pagination as max limit per page is 100
  const meals = await notionv1Client.databases.query({
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

  const reciepes: Record<string, GetPageResponse> = Object.assign(
    {},
    ...(
      await queryAllPaginatedAPI(notionv1Client.databases.query, {
        database_id: reciepeDatabaseId,
      })
    ).map((reciepe) => ({ [reciepe.id]: reciepe }))
  );

  const reciepeIngredientsRelations: Record<string, GetPageResponse> =
    Object.assign(
      {},
      ...(
        await queryAllPaginatedAPI(notionv1Client.databases.query, {
          database_id: reciepeIngredientsRelationDatabaseId,
        })
      ).map((reciepeIngredientsRelation) => ({
        [reciepeIngredientsRelation.id]: reciepeIngredientsRelation,
      }))
    );

  const ingredients: Record<string, GetPageResponse> = Object.assign(
    {},
    ...(
      await queryAllPaginatedAPI(notionv1Client.databases.query, {
        database_id: ingredientsDatabaseId,
      })
    ).map((ingredient) => ({ [ingredient.id]: ingredient }))
  );

  //TO DO: exctract each relation logic into separate functions
  const ingredientsQuantities: Record<string, number> = {};
  for (let meal of meals.results) {
    if (isFullPage(meal)) {
      const mealAttendingPersons = meal.properties['Qui est présent ?']?.people;
      if (mealAttendingPersons && mealAttendingPersons.length > 0) {
        const numberOfAttendingPersons = mealAttendingPersons.length;
        const mealReciepesRelations = meal.properties['Plat']?.relation;
        console.log('meal');
        if (mealReciepesRelations !== undefined) {
          const mealReciepes = mealReciepesRelations.map(
            (mealReciepeRelation) => {
              return reciepes[mealReciepeRelation.id];
            }
          );

          for (let mealReciepe of mealReciepes) {
            if (mealReciepe !== undefined) {
              const mealReciepeIngredientsToReciepeRelationsIds =
                mealReciepe.properties['Id Ingredients']?.relation;
              if (
                mealReciepeIngredientsToReciepeRelationsIds &&
                mealReciepeIngredientsToReciepeRelationsIds.length > 0
              ) {
                const mealReciepeIngredients =
                  mealReciepeIngredientsToReciepeRelationsIds.map(
                    (mealReciepeIngredientsToReciepeRelationsId) => {
                      return reciepeIngredientsRelations[
                        mealReciepeIngredientsToReciepeRelationsId.id
                      ];
                    }
                  );
                for (let mealReciepeIngredient of mealReciepeIngredients) {
                  const mealReciepeIngredientQuantity =
                    mealReciepeIngredient.properties['Quantité']?.number ?? 0;

                  const ingredientId =
                    mealReciepeIngredient.properties['Ingredient']?.relation[0]
                      ?.id;
                  if (ingredientId) {
                    if (ingredientsQuantities[ingredientId] === undefined) {
                      ingredientsQuantities[ingredientId] =
                        mealReciepeIngredientQuantity *
                        numberOfAttendingPersons;
                    } else {
                      ingredientsQuantities[ingredientId] +=
                        mealReciepeIngredientQuantity *
                        numberOfAttendingPersons;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return Promise.all(
    Object.keys(ingredientsQuantities).map(async (ingredientId) => {
      const name =
        ingredients[ingredientId].properties['Nom']?.title[0].plain_text ?? '';
      const unit =
        ingredients[ingredientId].properties['Unité']?.select.name ?? '';

      return {
        id: ingredientId,
        name,
        quantity: ingredientsQuantities[ingredientId],
        unit,
      };
    })
  );
};
