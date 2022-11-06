// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { getIngredients } from '../../api/notion/getIngredients';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Awaited<ReturnType<typeof getIngredients>> | string>
) {
  try {
    const ingredients = await getIngredients();
    res.status(200).json(ingredients);
  } catch (error) {
    res.status(500).send('Oops');
  }
}
