import { useState } from 'react';
import useSWR from 'swr';
import { fetcher } from '../helpers/fetcher';
import { swrOptions } from '../helpers/swrOptions';
import { useMealsProperties } from '../types';

export const useMeals = ({
  mealDatabaseId,
  additionalIngredientsDatabaseId,
  firstDate,
  lastDate,
}: useMealsProperties) => {
  const { data, error } = useSWR(
    () =>
      !(
        mealDatabaseId &&
        additionalIngredientsDatabaseId &&
        firstDate &&
        lastDate
      )
        ? null
        : `/api/data/meals?firstDate=${
            firstDate.toISOString().split('T')[0]
          }&lastDate=${
            lastDate.toISOString().split('T')[0]
          }&mealdbid=${mealDatabaseId}&additionalingredientsdbid=${additionalIngredientsDatabaseId}`,
    fetcher,
    swrOptions
  );

  return {
    meals: data?.meals,
    additonnalIngredients: data?.additonnalIngredients,
    isLoading: !error && !data,
    isError: error,
  };
};
