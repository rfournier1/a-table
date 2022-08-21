import { Client, isFullPage, iteratePaginatedAPI } from '@notionhq/client';
import {
  isNumberPropertyItemObjectResponse,
  isPropertyItemListResponse,
  isRelationPropertyItemObjectResponse,
  isRichTextPropertyItemObjectResponse,
  isSelectPropertyItemObjectResponse,
  isTitlePropertyItemObjectResponse,
} from '../../helpers/typeGuards';
import queryAllPaginatedAPI from '../../helpers/queryAllPaginatedAPI';
import { GetPageResponse } from '@notionhq/client/build/src/api-endpoints';
import { ShoppingList } from '../../types';

// Initializing a client
const notion = new Client({
  auth: process.env.NOTION_ITEGRATION_TOKEN,
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
  const meals = await notion.databases.query({
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
      await queryAllPaginatedAPI(notion.databases.query, {
        database_id: reciepeDatabaseId,
      })
    ).map((reciepe) => ({ [reciepe.id]: reciepe }))
  );

  const reciepeIngredientsRelations: Record<string, GetPageResponse> =
    Object.assign(
      {},
      ...(
        await queryAllPaginatedAPI(notion.databases.query, {
          database_id: reciepeIngredientsRelationDatabaseId,
        })
      ).map((reciepeIngredientsRelation) => ({
        [reciepeIngredientsRelation.id]: reciepeIngredientsRelation,
      }))
    );

  const ingredients: Record<string, GetPageResponse> = Object.assign(
    {},
    ...(
      await queryAllPaginatedAPI(notion.databases.query, {
        database_id: ingredientsDatabaseId,
      })
    ).map((ingredient) => ({ [ingredient.id]: ingredient }))
  );

  const mealsDatabase = await notion.databases.retrieve({
    database_id: mealDatabaseId,
  });
  const mealToReciepeRelationPropertyId = mealsDatabase.properties['Plat'].id;
  const mealToAttendingPersonsRelationPropertyId =
    mealsDatabase.properties['Qui est présent ?'].id;
  const reciepeDatabase = await notion.databases.retrieve({
    database_id: reciepeDatabaseId,
  });
  const reciepeToReciepeIngredientsRelationRelationPropertyId =
    reciepeDatabase.properties['Id Ingredients'].id;
  const reciepeIngredientsRelationDatabase = await notion.databases.retrieve({
    database_id: reciepeIngredientsRelationDatabaseId,
  });

  const reciepeIngredientQuantityPropertyId =
    reciepeIngredientsRelationDatabase.properties['Quantité'].id;
  const reciepeIngredientToIngredientRelationPropertyId =
    reciepeIngredientsRelationDatabase.properties['Ingredient'].id;

  const ingredientsDatabase = await notion.databases.retrieve({
    database_id: ingredientsDatabaseId,
  });
  const ingredientTitlePropertyId = ingredientsDatabase.properties['Nom'].id;
  const ingredientUnitPropertyId = ingredientsDatabase.properties['Unité'].id;

  //TO DO: exctract each relation logic into separate functions
  const ingredientsQuantities: Record<string, number> = {};
  for (let meal of meals.results) {
    if (isFullPage(meal)) {
      const mealAttendingPersons = await notion.pages.properties.retrieve({
        page_id: meal.id,
        property_id: mealToAttendingPersonsRelationPropertyId,
      });
      if (
        isPropertyItemListResponse(mealAttendingPersons) &&
        mealAttendingPersons.results.length > 0
      ) {
        const numberOfAttendingPersons = mealAttendingPersons.results.length;
        const mealReciepesRelations = await notion.pages.properties.retrieve({
          page_id: meal.id,
          property_id: mealToReciepeRelationPropertyId,
        });
        console.log('meal');
        if (isPropertyItemListResponse(mealReciepesRelations)) {
          const mealReciepes = mealReciepesRelations.results.map(
            (mealReciepeRelation) => {
              if (!isRelationPropertyItemObjectResponse(mealReciepeRelation)) {
                return undefined;
              }
              return reciepes[mealReciepeRelation.relation.id];
            }
          );

          for (let mealReciepe of mealReciepes) {
            if (mealReciepe !== undefined) {
              const mealReciepeIngredientsToReciepeRelationsIds =
                await notion.pages.properties.retrieve({
                  page_id: mealReciepe.id,
                  property_id:
                    reciepeToReciepeIngredientsRelationRelationPropertyId,
                });
              if (
                isPropertyItemListResponse(
                  mealReciepeIngredientsToReciepeRelationsIds
                )
              ) {
                const mealReciepeIngredients =
                  mealReciepeIngredientsToReciepeRelationsIds.results.map(
                    (mealReciepeIngredientsToReciepeRelationsId) => {
                      if (
                        !isRelationPropertyItemObjectResponse(
                          mealReciepeIngredientsToReciepeRelationsId
                        )
                      ) {
                        return undefined;
                      }
                      return reciepeIngredientsRelations[
                        mealReciepeIngredientsToReciepeRelationsId.relation.id
                      ];
                    }
                  );
                for (let mealReciepeIngredient of mealReciepeIngredients) {
                  if (mealReciepeIngredient !== undefined) {
                    const mealReciepeIngredientQuantity =
                      await notion.pages.properties.retrieve({
                        page_id: mealReciepeIngredient.id,
                        property_id: reciepeIngredientQuantityPropertyId,
                      });
                    const mealReciepeIngredientToIngredientRelations =
                      await notion.pages.properties.retrieve({
                        page_id: mealReciepeIngredient.id,
                        property_id:
                          reciepeIngredientToIngredientRelationPropertyId,
                      });
                    if (
                      isPropertyItemListResponse(
                        mealReciepeIngredientToIngredientRelations
                      )
                    ) {
                      if (
                        isRelationPropertyItemObjectResponse(
                          mealReciepeIngredientToIngredientRelations.results[0]
                        ) &&
                        isNumberPropertyItemObjectResponse(
                          mealReciepeIngredientQuantity
                        )
                      ) {
                        const ingredientId =
                          mealReciepeIngredientToIngredientRelations.results[0]
                            .relation.id;
                        if (ingredientsQuantities[ingredientId] === undefined) {
                          ingredientsQuantities[ingredientId] =
                            (mealReciepeIngredientQuantity.number ?? 0) *
                            numberOfAttendingPersons;
                        } else {
                          ingredientsQuantities[ingredientId] +=
                            (mealReciepeIngredientQuantity.number ?? 0) *
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

  return Promise.all(
    Object.keys(ingredientsQuantities).map(async (ingredientId) => {
      const ingredientName = await notion.pages.properties.retrieve({
        page_id: ingredientId,
        property_id: ingredientTitlePropertyId,
      });
      const name =
        isPropertyItemListResponse(ingredientName) &&
        isTitlePropertyItemObjectResponse(ingredientName.results[0])
          ? ingredientName.results[0].title.plain_text
          : '';

      const ingredientUnit = await notion.pages.properties.retrieve({
        page_id: ingredientId,
        property_id: ingredientUnitPropertyId,
      });
      const unit =
        isSelectPropertyItemObjectResponse(ingredientUnit) &&
        ingredientUnit.select !== null
          ? ingredientUnit.select.name
          : '';

      return {
        id: ingredientId,
        name,
        quantity: ingredientsQuantities[ingredientId],
        unit,
      };
    })
  );
};
