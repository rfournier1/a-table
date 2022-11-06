// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { getReciepeIngredientsRelations } from '../../api/notion/getReciepeIngredientsRelations';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    Awaited<ReturnType<typeof getReciepeIngredientsRelations>> | string
  >
) {
  try {
    const reciepeIngredientsRelations = await getReciepeIngredientsRelations();
    res.status(200).json(reciepeIngredientsRelations);
  } catch (error) {
    res.status(500).send('Oops');
  }
}
