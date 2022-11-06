import { Client, isFullPage } from '@notionhq/client';
import { hasProperty } from '../helpers/typeGuards';

//v1 of the api return the properties values in database query whereas v2 does not
const notionv1Client = new Client({
  auth: process.env.NOTION_ITEGRATION_TOKEN,
  notionVersion: '2022-02-22',
});

interface GetDailyMealsInformationProps {
  date: Date;
}

interface DishIngredient {
  name: string;
  quantity: number;
  unit: string;
}

interface Dish {
  title: string;
  ingredients: DishIngredient[];
}

export interface DailyMeal {
  dishes: Dish[];
  numberOfAttendingPersons: number;
  title: string;
}

export const getDailyMealsInformation = async ({
  date,
}: GetDailyMealsInformationProps): Promise<DailyMeal[]> => {
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

  const meals = await notionv1Client.databases.query({
    database_id: mealDatabaseId,
    filter: {
      and: [
        {
          date: {
            equals: date.toISOString(),
          },
          property: 'Date',
        },
      ],
    },
  });

  const reciepesId = meals.results
    .map((result) => {
      if (isFullPage(result) && hasProperty(result.properties, 'Plat')) {
        const mealsReciepesRelationProperty = result.properties.Plat;
        if (
          hasProperty(mealsReciepesRelationProperty, 'relation') &&
          Array.isArray(mealsReciepesRelationProperty.relation)
        ) {
          return mealsReciepesRelationProperty.relation.map(
            (relation) => relation.id
          );
        }
        return [];
      }
    })
    .flat();

  const reciepeIngredientsRelations = await notionv1Client.databases.query({
    database_id: reciepeIngredientsRelationDatabaseId,
    filter: {
      or: reciepesId.map((id) => ({
        property: 'Plats',
        relation: {
          contains: id,
        },
      })),
    },
  });

  //You have all the data you need thanks to rollup on qtt and rolup on name

  const menu = meals.results.map((meal) => {
    let title = '';
    let numberOfAttendingPersons = 0;
    const dishes: Dish[] = [];
    if (isFullPage(meal)) {
      if (hasProperty(meal.properties, 'Nom')) {
        const mealNameProperty = meal.properties.Nom;
        if (
          hasProperty(mealNameProperty, 'title') &&
          Array.isArray(mealNameProperty.title)
        ) {
          title = mealNameProperty.title[0].plain_text;
        }
      }
      if (hasProperty(meal.properties, 'Invités')) {
        const numberOfAttendingPersonsProperty = meal.properties['Invités'];
        if (
          hasProperty(numberOfAttendingPersonsProperty, 'number') &&
          typeof numberOfAttendingPersonsProperty.number === 'number'
        ) {
          numberOfAttendingPersons += numberOfAttendingPersonsProperty.number;
        }
      }
      if (hasProperty(meal.properties, 'Qui est présent ?')) {
        const attendingPersonsProperty = meal.properties['Qui est présent ?'];
        if (
          hasProperty(attendingPersonsProperty, 'people') &&
          Array.isArray(attendingPersonsProperty.people)
        ) {
          numberOfAttendingPersons += attendingPersonsProperty.people.length;
        }
      }
      const mealDishesId = [];
      if (hasProperty(meal.properties, 'Plat')) {
        const mealDishesProperty = meal.properties.Plat;
        if (
          hasProperty(mealDishesProperty, 'relation') &&
          Array.isArray(mealDishesProperty.relation)
        ) {
          mealDishesId.push(
            ...mealDishesProperty.relation.map((relation) => relation.id)
          );
        }
      }
      for (let mealDishId of mealDishesId) {
        let mealDish: Dish = {
          title: '',
          ingredients: [],
        };
        const ingredientsRelations = reciepeIngredientsRelations.results.filter(
          (ingredientRelation) => {
            if (
              isFullPage(ingredientRelation) &&
              hasProperty(ingredientRelation.properties, 'Plats')
            ) {
              const ingredientRelationPlatsProperty =
                ingredientRelation.properties.Plats;
              if (
                hasProperty(ingredientRelationPlatsProperty, 'relation') &&
                Array.isArray(ingredientRelationPlatsProperty.relation)
              ) {
                return ingredientRelationPlatsProperty.relation.some(
                  (relation) => relation.id === mealDishId
                );
              }
            }
            return false;
          }
        );
        for (let ingredientRelation of ingredientsRelations) {
          const ingredient = {
            name: '',
            quantity: 0,
            unit: '',
          };
          if (isFullPage(ingredientRelation)) {
            if (hasProperty(ingredientRelation.properties, 'Quantité/pers')) {
              const ingredientQuantityProperty =
                ingredientRelation.properties['Quantité/pers'];
              if (
                hasProperty(ingredientQuantityProperty, 'number') &&
                typeof ingredientQuantityProperty.number === 'number'
              ) {
                ingredient.quantity =
                  ingredientQuantityProperty.number * numberOfAttendingPersons;
              }
            }
            if (hasProperty(ingredientRelation.properties, 'Unité')) {
              const ingredientUnitProperty =
                ingredientRelation.properties['Unité'];
              if (hasProperty(ingredientUnitProperty, 'rollup')) {
                if (
                  hasProperty(ingredientUnitProperty.rollup, 'array') &&
                  Array.isArray(ingredientUnitProperty.rollup.array)
                ) {
                  const ingredientUnitPropertyItem =
                    ingredientUnitProperty.rollup.array[0];
                  if (hasProperty(ingredientUnitPropertyItem, 'select')) {
                    const ingredientUnitPropertyItemSelect =
                      ingredientUnitPropertyItem.select;
                    if (
                      hasProperty(ingredientUnitPropertyItemSelect, 'name') &&
                      typeof ingredientUnitPropertyItemSelect.name === 'string'
                    ) {
                      ingredient.unit = ingredientUnitPropertyItemSelect.name;
                    }
                  }
                }
              }
            }
            if (hasProperty(ingredientRelation.properties, 'Nom ingrédient')) {
              const ingredientNameProperty =
                ingredientRelation.properties['Nom ingrédient'];
              if (hasProperty(ingredientNameProperty, 'rollup')) {
                if (
                  hasProperty(ingredientNameProperty.rollup, 'array') &&
                  Array.isArray(ingredientNameProperty.rollup.array)
                ) {
                  const ingredientNamePropertyItem =
                    ingredientNameProperty.rollup.array[0];
                  if (
                    hasProperty(ingredientNamePropertyItem, 'title') &&
                    Array.isArray(ingredientNamePropertyItem.title)
                  ) {
                    ingredient.name =
                      ingredientNamePropertyItem.title[0].plain_text;
                  }
                }
              }
            }
            if (hasProperty(ingredientRelation.properties, 'Nom plat')) {
              const ingredientDishNameProperty =
                ingredientRelation.properties['Nom plat'];
              if (hasProperty(ingredientDishNameProperty, 'rollup')) {
                if (
                  hasProperty(ingredientDishNameProperty.rollup, 'array') &&
                  Array.isArray(ingredientDishNameProperty.rollup.array)
                ) {
                  const ingredientDishNamePropertyItem =
                    ingredientDishNameProperty.rollup.array[0];
                  if (
                    hasProperty(ingredientDishNamePropertyItem, 'title') &&
                    Array.isArray(ingredientDishNamePropertyItem.title)
                  ) {
                    mealDish.title =
                      ingredientDishNamePropertyItem.title[0].plain_text;
                  }
                }
              }
            }
          }
          mealDish.ingredients.push(ingredient);
        }
        dishes.push(mealDish);
      }
    }
    return { title, numberOfAttendingPersons, dishes };
  });
  return menu;
};
