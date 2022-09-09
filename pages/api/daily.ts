// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  DailyMeal,
  getDailyMealsInformation,
} from '../../api/notion/getDailyMealsInformation';
import { ShoppingList } from '../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DailyMeal[] | string>
) {
  const { date } = req.query;
  if (!date || typeof date !== 'string') {
    res.status(400).send('Invalid date in URL');
    return;
  }
  try {
    const menus = await getDailyMealsInformation({
      date: new Date(date),
    });
    res.status(200).json(menus);
  } catch (error) {
    res.status(500).send('Oops');
  }
}
