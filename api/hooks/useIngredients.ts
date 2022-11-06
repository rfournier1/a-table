import useSWR from 'swr';
import { fetcher } from '../../helpers/fetcher';

export const useIngredients = () => {
  const { data, error, mutate } = useSWR('/api/ingredients', fetcher);
  return {
    ingredients: data?.ingredients,
    isLoading: !error && !data,
    isError: error,
    refresh: () => mutate(undefined),
  };
};
