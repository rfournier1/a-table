import useSWR from 'swr';
import { fetcher } from '../helpers/fetcher';
import { swrOptions } from '../helpers/swrOptions';
import { useReciepesProperties } from '../types';

export const useReciepes = ({ reciepesDatabaseId }: useReciepesProperties) => {
  const { data, error } = useSWR(
    () =>
      !reciepesDatabaseId
        ? null
        : `/api/data/reciepes?dbid=${reciepesDatabaseId}`,
    fetcher,
    swrOptions
  );
  return {
    reciepes: data?.reciepes,
    isLoading: !error && !data,
    isError: error,
  };
};
