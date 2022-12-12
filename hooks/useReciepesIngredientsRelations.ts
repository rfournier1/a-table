import { useState } from 'react';
import useSWR from 'swr';
import { fetcher } from '../helpers/fetcher';
import { paginatedFetcher } from '../helpers/paginatedFetcher';
import { swrOptions } from '../helpers/swrOptions';
import { useReciepeIngredientsRelationsProperties } from '../types';

export const useReciepeIngredientsRelations = ({
  reciepeIngredientsRelationDatabaseId,
}: useReciepeIngredientsRelationsProperties) => {
  const { data, error } = useSWR(
    () =>
      !reciepeIngredientsRelationDatabaseId
        ? null
        : `/api/data/reciepeIngredientsRelations?dbid=${reciepeIngredientsRelationDatabaseId}`,
    paginatedFetcher,
    swrOptions
  );
  return {
    reciepeIngredientsRelations: data,
    isLoading: !error && !data,
    isError: error,
  };
};
