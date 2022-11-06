import { useState } from 'react';
import useSWR from 'swr';
import { fetcher } from '../helpers/fetcher';
import { useMealsProperties } from '../types';

export const useMeals = ({ firstDate, lastDate }: useMealsProperties) => {
  const { data, error } = useSWR(
    `/api/data/meals?firstDate=${
      firstDate.toISOString().split('T')[0]
    }&lastDate=${lastDate.toISOString().split('T')[0]}`,
    fetcher
  );

  return {
    meals: data?.meals,
    additonnalIngredients: data?.additonnalIngredients,
    isLoading: !error && !data,
    isError: error,
  };
};
