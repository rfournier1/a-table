// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { getMeals } from '../../api/notion/getMeals';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Awaited<ReturnType<typeof getMeals>> | string>
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
  try {
    const meals = await getMeals({
      firstDate: new Date(firstDate),
      lastDate: new Date(lastDate),
    });
    res.status(200).json(meals);
  } catch (error) {
    res.status(500).send('Oops');
  }
}
