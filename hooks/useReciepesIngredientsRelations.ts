import useSWR from 'swr';
import { fetcher } from '../helpers/fetcher';

export const useReciepeIngredientsRelations = () => {
  const { data, error } = useSWR(
    '/api/data/reciepeIngredientsRelations',
    fetcher
  );
  return {
    reciepeIngredientsRelations: data?.reciepeIngredientsRelations,
    isLoading: !error && !data,
    isError: error,
  };
};
