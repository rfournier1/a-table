import { Client, isFullPage } from '@notionhq/client';
import queryAllPaginatedAPI from '../../helpers/queryAllPaginatedAPI';
import { GetPageResponse } from '@notionhq/client/build/src/api-endpoints';
import { ShoppingList } from '../../types';
import { hasProperty } from '../../helpers/typeGuards';

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
  const additionnalIngredientsDatabaseId =
    process.env.NOTION_ADDITIONNAL_INGREDIENTS_DATABASE_ID;
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
  if (additionnalIngredientsDatabaseId === undefined) {
    throw new Error(
      'NOTION_ADDITIONNAL_INGREDIENTS_DATABASE_ID is not defined'
    );
  }

  const meals = //TO DO: handle pagination as max limit per page is 100
    await notionv1Client.databases.query({
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

  const additonnalIngredients = await queryAllPaginatedAPI(
    notionv1Client.databases.query,
    {
      database_id: additionnalIngredientsDatabaseId,
    }
  );

  //TO DO: exctract each relation logic into separate functions
  const ingredientsQuantities: Record<string, number> = {};
  for (let meal of meals.results) {
    if (isFullPage(meal)) {
      const attendingPeopleProperty = meal.properties['Qui est présent ?'];
      if (
        hasProperty(attendingPeopleProperty, 'people') &&
        Array.isArray(attendingPeopleProperty.people) &&
        attendingPeopleProperty.people.length > 0
      ) {
        const numberOfAttendingPersons = attendingPeopleProperty.people.length;

        const mealReciepesRelationsProperty = meal.properties['Plat'];
        if (
          hasProperty(mealReciepesRelationsProperty, 'relation') &&
          Array.isArray(mealReciepesRelationsProperty.relation)
        ) {
          const mealReciepes = mealReciepesRelationsProperty.relation.map(
            (mealReciepeRelation) => {
              return reciepes[mealReciepeRelation.id];
            }
          );

          for (let mealReciepe of mealReciepes) {
            if (mealReciepe !== undefined && isFullPage(mealReciepe)) {
              const mealReciepeIngredientsToReciepeRelationsProperty =
                mealReciepe.properties['Id Ingredients'];
              if (
                hasProperty(
                  mealReciepeIngredientsToReciepeRelationsProperty,
                  'relation'
                ) &&
                Array.isArray(
                  mealReciepeIngredientsToReciepeRelationsProperty.relation
                )
              ) {
                const mealReciepeIngredients =
                  mealReciepeIngredientsToReciepeRelationsProperty.relation.map(
                    (mealReciepeIngredientsToReciepeRelations) => {
                      return reciepeIngredientsRelations[
                        mealReciepeIngredientsToReciepeRelations.id
                      ];
                    }
                  );
                for (let mealReciepeIngredient of mealReciepeIngredients) {
                  if (
                    mealReciepeIngredient !== undefined &&
                    isFullPage(mealReciepeIngredient)
                  ) {
                    const mealReciepeIngredientQuantityProperty =
                      mealReciepeIngredient.properties['Quantité/pers'];
                    if (
                      hasProperty(
                        mealReciepeIngredientQuantityProperty,
                        'number'
                      )
                    ) {
                      const mealReciepeIngredientQuantity =
                        typeof mealReciepeIngredientQuantityProperty.number ===
                        'number'
                          ? mealReciepeIngredientQuantityProperty.number
                          : 0;
                      const ingredientRelationProperty =
                        mealReciepeIngredient.properties['Ingredient'];
                      if (
                        hasProperty(ingredientRelationProperty, 'relation') &&
                        Array.isArray(ingredientRelationProperty.relation)
                      ) {
                        const ingredientId =
                          ingredientRelationProperty.relation[0]?.id;
                        if (ingredientId) {
                          if (
                            ingredientsQuantities[ingredientId] === undefined
                          ) {
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
      }
    }
  }

  //add additionnal ingredients
  for (let additionnalIngredient of additonnalIngredients) {
    console.log(additionnalIngredient);
    if (isFullPage(additionnalIngredient)) {
      const additionnalIngredientQuantityProperty =
        additionnalIngredient.properties['Quantité'];
      if (
        hasProperty(additionnalIngredientQuantityProperty, 'number') &&
        typeof additionnalIngredientQuantityProperty.number === 'number'
      ) {
        const additionnalIngredientIngrediantProperty =
          additionnalIngredient.properties['Article'];
        if (
          hasProperty(additionnalIngredientIngrediantProperty, 'relation') &&
          Array.isArray(additionnalIngredientIngrediantProperty.relation)
        ) {
          const ingredientId =
            additionnalIngredientIngrediantProperty.relation[0]?.id;
          if (ingredientId) {
            if (ingredientsQuantities[ingredientId] === undefined) {
              ingredientsQuantities[ingredientId] =
                additionnalIngredientQuantityProperty.number;
            } else {
              ingredientsQuantities[ingredientId] +=
                additionnalIngredientQuantityProperty.number;
            }
          }
        }
      }
    }
  }
  return Promise.all(
    Object.keys(ingredientsQuantities).map(async (ingredientId) => {
      let name = '';
      let unit = '';
      const ingredient = ingredients[ingredientId];
      if (isFullPage(ingredient)) {
        const ingredientNameProperty = ingredient.properties['Nom'];
        if (
          hasProperty(ingredientNameProperty, 'title') &&
          Array.isArray(ingredientNameProperty.title) &&
          typeof ingredientNameProperty.title[0]?.plain_text === 'string'
        ) {
          name = ingredientNameProperty.title[0]?.plain_text ?? '';
        }
        const ingredientUnitProperty = ingredient.properties['Unité'];
        if (hasProperty(ingredientUnitProperty, 'select')) {
          const ingredientUnitPropertySelect = ingredientUnitProperty.select;
          if (
            hasProperty(ingredientUnitPropertySelect, 'name') &&
            typeof ingredientUnitPropertySelect.name === 'string'
          ) {
            unit = ingredientUnitPropertySelect.name ?? '';
          }
        }
      }
      return {
        id: ingredientId,
        name,
        quantity: ingredientsQuantities[ingredientId],
        unit,
      };
    })
  );
};
