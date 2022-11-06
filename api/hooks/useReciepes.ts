import useSWR from 'swr';
import { fetcher } from '../../helpers/fetcher';

export const useReciepes = () => {
  const { data, error } = useSWR('/api/reciepes', fetcher);
  return {
    reciepes: data?.reciepes,
    isLoading: !error && !data,
    isError: error,
  };
};
