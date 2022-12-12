import useSWR from 'swr';
import { fetcher } from '../helpers/fetcher';
import { swrOptions } from '../helpers/swrOptions';
import { useIngredientsProperties } from '../types';

export const useIngredients = ({
  ingredientsDatabaseId,
}: useIngredientsProperties) => {
  const { data, error, mutate } = useSWR(
    () =>
      !ingredientsDatabaseId
        ? null
        : `/api/data/ingredients?dbid=${ingredientsDatabaseId}`,
    fetcher,
    swrOptions
  );
  return {
    ingredients: data?.ingredients,
    isLoading: !error && !data,
    isError: error,
    refresh: () => mutate(undefined),
  };
};
