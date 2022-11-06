// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { mutateIngredientCheckedProperty } from '../../notion-api/mutateIngredientCheckedProperty';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<boolean | string>
) {
  const { id, checked } = req.query;
  if (
    !id ||
    !checked ||
    typeof id !== 'string' ||
    typeof checked !== 'string'
  ) {
    res.status(400).send('Invalid parameters in URL');
    return;
  }
  try {
    const newChecked = await mutateIngredientCheckedProperty({
      id,
      checked: checked === 'true',
    });
    res.status(200).json(newChecked);
  } catch (error) {
    console.log(error);
    res.status(500).send('Oops');
  }
}
