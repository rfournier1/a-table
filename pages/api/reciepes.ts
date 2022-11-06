// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { getReciepes } from '../../api/notion/getReciepes';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Awaited<ReturnType<typeof getReciepes>> | string>
) {
  try {
    const reciepe = await getReciepes();
    res.status(200).json(reciepe);
  } catch (error) {
    res.status(500).send('Oops');
  }
}
