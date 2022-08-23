// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { getShoppingListFromMeals } from '../../api/notion/getShoppingListFromMeals';
import { ShoppingList } from '../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ShoppingList | string>
) {
  const { firstDate, lastDate } = req.query;
  if (
    !firstDate ||
    !lastDate ||
    typeof firstDate !== 'string' ||
    typeof lastDate !== 'string'
  ) {
    res.status(400).send('Invalid date in URL');
    return;
  }
  const mealsShoppingList = await getShoppingListFromMeals({
    firstDate: new Date(firstDate),
    lastDate: new Date(lastDate),
  });
  res.status(200).json(mealsShoppingList);
}
