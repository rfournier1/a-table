import useSWR from 'swr';
import { fetcher } from '../helpers/fetcher';
import { swrOptions } from '../helpers/swrOptions';
import { DailyMeal, useDailyMealsProperties } from '../types';

export const useDailyMeals = ({
  date,
  mealDatabaseId,
  reciepeIngredientsRelationDatabaseId,
}: useDailyMealsProperties) => {
  const { data, error, mutate } = useSWR<DailyMeal[]>(
    () =>
      !(reciepeIngredientsRelationDatabaseId && mealDatabaseId && date)
        ? null
        : `/api/data/daily?date=${
            date.toISOString().split('T')[0]
          }&mealdbid=${mealDatabaseId}&reciepeingredientsrelationdbid=${reciepeIngredientsRelationDatabaseId}`,
    fetcher,
    swrOptions
  );
  return {
    meals: data,
    isLoading: !error && !data,
    isError: error,
    refresh: () => mutate(undefined),
  };
};
