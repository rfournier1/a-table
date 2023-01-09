// use all the helpers to generate the shopping list
// return status for every data fetching and for the list generation

import { useCallback, useEffect, useState } from 'react';
import { getShoppingListAndMealsIngredients } from '../helpers/getShoppingListAndMealsIngredients';
import { getAdditionalIngredients } from '../notion-api/getAdditionnalIngredients';
import { getClient } from '../notion-api/getClient';
import {
  getDatabaseIdWithName,
  getDatabasesIds,
} from '../notion-api/getDatabasesId';
import { getIngredients } from '../notion-api/getIngredients';
import { getListDates } from '../notion-api/getListDates';
import { getMeals } from '../notion-api/getMeals';
import { getReciepeIngredientsRelations } from '../notion-api/getReciepeIngredientsRelations';
import { getReciepes } from '../notion-api/getReciepes';
import {
  INGREDIENT_DB_NAME,
  MEAL_DB_NAME,
  RECIEPE_INGREDIENTS_RELATIONS_DB_NAME,
  RECIEPE_DB_NAME,
  ADDITIONAL_INGREDIENTS_DB_NAME,
} from '../notion-api/keys';
import { updateMealsCards } from '../notion-api/updateMealsCards';
import { updateShoppingList } from '../notion-api/updateShoppingList';

type useGenerateShoppingListProps = {
  accessToken: string | string[] | undefined;
};

export enum AsyncState {
  NONE = 'NONE',
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  DONE = 'DONE',
}

export function useShoppingListGenerator({
  accessToken,
}: useGenerateShoppingListProps) {
  const [datesProgress, setDateProgress] = useState<AsyncState>(
    AsyncState.NONE
  );
  const [idsProgress, setIdsProgress] = useState<AsyncState>(AsyncState.NONE);
  const [mealsProgress, setMealsProgress] = useState<AsyncState>(
    AsyncState.NONE
  );
  const [additionalIngredientsProgress, setAdditionalIngredientsProgress] =
    useState<AsyncState>(AsyncState.NONE);
  const [ingredientsProgress, setIngredientsProgress] = useState<AsyncState>(
    AsyncState.NONE
  );
  const [reciepesProgress, setReciepesProgress] = useState<AsyncState>(
    AsyncState.NONE
  );
  const [listComputationProgress, setListComputationProgress] =
    useState<AsyncState>(AsyncState.NONE);
  const [
    reciepeIngredientsRelationsProgress,
    setReciepeIngredientsRelationsProgress,
  ] = useState<AsyncState>(AsyncState.NONE);
  const [mealsCardsUpdateProgress, setMealsCardsUpdateProgress] =
    useState<AsyncState>(AsyncState.NONE);
  const [listUpdateProgress, setListUpdateProgress] = useState<AsyncState>(
    AsyncState.NONE
  );

  const generateList = useCallback(async () => {
    if (!accessToken || typeof accessToken !== 'string') return;
    const client = getClient(accessToken);
    setDateProgress(AsyncState.LOADING);
    setIdsProgress(AsyncState.LOADING);
    setMealsProgress(AsyncState.IDLE);
    setAdditionalIngredientsProgress(AsyncState.IDLE);
    setReciepeIngredientsRelationsProgress(AsyncState.IDLE);
    setReciepesProgress(AsyncState.IDLE);
    setIngredientsProgress(AsyncState.IDLE);
    setListComputationProgress(AsyncState.IDLE);
    setMealsCardsUpdateProgress(AsyncState.IDLE);
    setListUpdateProgress(AsyncState.IDLE);
    const [databasesIds, dates] = await Promise.all([
      getDatabasesIds(
        [
          INGREDIENT_DB_NAME,
          MEAL_DB_NAME,
          ADDITIONAL_INGREDIENTS_DB_NAME,
          RECIEPE_DB_NAME,
          RECIEPE_INGREDIENTS_RELATIONS_DB_NAME,
        ],
        client
      ).then((response) => {
        setIdsProgress(AsyncState.DONE);
        return response;
      }),
      getListDates(client).then((response) => {
        setDateProgress(AsyncState.DONE);
        return response;
      }),
    ]);
    if (!dates?.endDate || !dates?.startDate) return;
    setMealsProgress(AsyncState.LOADING);
    setAdditionalIngredientsProgress(AsyncState.LOADING);
    setReciepeIngredientsRelationsProgress(AsyncState.LOADING);
    setReciepesProgress(AsyncState.LOADING);
    setIngredientsProgress(AsyncState.LOADING);
    const [
      meals,
      additonalIngredients,
      reciepes,
      reciepeIngredientsRelations,
      ingredients,
    ] = await Promise.all([
      getMeals(
        {
          firstDate: dates.startDate,
          lastDate: dates.endDate,
          mealDatabaseId: databasesIds[MEAL_DB_NAME],
        },
        client
      ).then((response) => {
        setMealsProgress(AsyncState.DONE);
        return response;
      }),
      getAdditionalIngredients(
        {
          additionalIngredientsDatabaseId:
            databasesIds[ADDITIONAL_INGREDIENTS_DB_NAME],
        },
        client
      ).then((response) => {
        setAdditionalIngredientsProgress(AsyncState.DONE);
        return response;
      }),
      getReciepes(
        { reciepesDatabaseId: databasesIds[RECIEPE_DB_NAME] },
        client
      ).then((response) => {
        setReciepesProgress(AsyncState.DONE);
        return response;
      }),
      getReciepeIngredientsRelations(
        {
          reciepeIngredientsRelationDatabaseId:
            databasesIds[RECIEPE_INGREDIENTS_RELATIONS_DB_NAME],
        },
        client
      ).then((response) => {
        setReciepeIngredientsRelationsProgress(AsyncState.DONE);
        return response;
      }),
      getIngredients(
        { ingredientsDatabaseId: databasesIds[INGREDIENT_DB_NAME] },
        client
      ).then((response) => {
        setIngredientsProgress(AsyncState.DONE);
        return response;
      }),
    ]);
    setListComputationProgress(AsyncState.LOADING);
    const { shoppingList, mealsIngredients } =
      getShoppingListAndMealsIngredients({
        meals,
        additonalIngredients,
        reciepes,
        reciepeIngredientsRelations,
        ingredients,
      });

    setListComputationProgress(AsyncState.DONE);
    setMealsCardsUpdateProgress(AsyncState.LOADING);
    await updateMealsCards(
      {
        mealsIngredients,
      },
      client
    );
    setMealsCardsUpdateProgress(AsyncState.DONE);
    setListUpdateProgress(AsyncState.LOADING);
    await updateShoppingList(
      {
        shoppingList,
        firstDate: dates.startDate,
        lastDate: dates.endDate,
      },
      client
    );
    setListUpdateProgress(AsyncState.DONE);
  }, [accessToken]);

  return {
    progress: {
      datesProgress,
      idsProgress,
      mealsProgress,
      additionalIngredientsProgress,
      reciepeIngredientsRelationsProgress,
      reciepesProgress,
      ingredientsProgress,
      listComputationProgress,
      mealsCardsUpdateProgress,
      listUpdateProgress,
    },
    generateList,
  };
}
