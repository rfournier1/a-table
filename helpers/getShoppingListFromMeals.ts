import { isFullPage } from '@notionhq/client';
import {
  GetPageResponse,
  QueryDatabaseResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { ShoppingList, ShoppingListItem } from '../types';
import { hasProperty } from './typeGuards';

interface getShoppingListFromMealsProps {
  meals: QueryDatabaseResponse;
  reciepes: Record<string, GetPageResponse>;
  ingredients: Record<string, GetPageResponse>;
  reciepeIngredientsRelations: Record<string, GetPageResponse>;
  additonnalIngredients: GetPageResponse[];
}
export const getShoppingListFromMeals = ({
  meals,
  reciepes,
  ingredients,
  reciepeIngredientsRelations,
  additonnalIngredients,
}: getShoppingListFromMealsProps): ShoppingList => {
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
        let numberOfAttendingPersons = attendingPeopleProperty.people.length;
        const guestsNumber = meal.properties['Invités'];
        if (
          hasProperty(guestsNumber, 'number') &&
          typeof guestsNumber.number === 'number'
        ) {
          numberOfAttendingPersons += guestsNumber.number;
        }

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
  return Object.keys(ingredientsQuantities).map(
    (ingredientId): ShoppingListItem => {
      let name = '';
      let unit = '';
      let area = '';
      let checked = false;
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
        const ingredientAreaProperty = ingredient.properties['Rayon'];
        if (hasProperty(ingredientAreaProperty, 'select')) {
          const ingredientAreaPropertySelect = ingredientAreaProperty.select;
          if (
            hasProperty(ingredientAreaPropertySelect, 'name') &&
            typeof ingredientAreaPropertySelect.name === 'string'
          ) {
            area = ingredientAreaPropertySelect.name ?? '';
          }
        }
        const ingredientCheckedProperty = ingredient.properties['OK'];
        if (
          hasProperty(ingredientCheckedProperty, 'checkbox') &&
          typeof ingredientCheckedProperty.checkbox === 'boolean'
        ) {
          checked = ingredientCheckedProperty.checkbox;
        }
      }
      return {
        id: ingredientId,
        name,
        quantity: ingredientsQuantities[ingredientId],
        unit,
        area,
        checked,
        checkedLoading: false,
      };
    }
  );
};