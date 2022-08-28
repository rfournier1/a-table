// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { mutateIngredientCheckedProperty } from '../../api/notion/mutateIngredientCheckedProperty';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<boolean | string>
) {
  const { ids } = req.query;
  if (!ids || typeof ids !== 'string') {
    res.status(400).send('Invalid parameters in URL');
    return;
  }
  const idsArray = JSON.parse(ids);
  if (!Array.isArray(idsArray)) {
    res.status(400).send('Invalid parameters in URL');
    return;
  }
  try {
    await Promise.all(
      idsArray.map((id: string) => {
        mutateIngredientCheckedProperty({ id: id, checked: false });
      })
    );
    res.status(200).json(true);
  } catch (error) {
    console.log(error);
    res.status(500).send('Oops');
  }
}
