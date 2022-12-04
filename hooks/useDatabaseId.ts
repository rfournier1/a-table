import useSWR from 'swr';
import { fetcher } from '../helpers/fetcher';
import { swrOptions } from '../helpers/swrOptions';
import { useDatabaseIdProperties } from '../types';

export const useDatabaseId = ({ name }: useDatabaseIdProperties) => {
  const { data, error } = useSWR(
    () => (!name ? null : `/api/data/database?name=${name}`),
    fetcher,
    swrOptions
  );
  return {
    id: data?.databaseId,
    isLoading: !error && !data,
    isError: error,
  };
};
