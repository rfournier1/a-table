// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { getDailyMealsInformation } from '../../../notion-api/getDailyMealsInformation';
import { getIngredients } from '../../../notion-api/getIngredients';
import { getMeals } from '../../../notion-api/getMeals';
import { getReciepeIngredientsRelations } from '../../../notion-api/getReciepeIngredientsRelations';
import { getReciepes } from '../../../notion-api/getReciepes';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { data } = req.query;
  console.log(data);
  try {
    switch (data) {
      case 'meals':
        const { firstDate, lastDate } = req.query;
        if (
          !firstDate ||
          !lastDate ||
          typeof firstDate !== 'string' ||
          typeof lastDate !== 'string'
        ) {
          res.status(400).send('Invalid date in URL');
          break;
        }
        const meals = await getMeals({
          firstDate: new Date(firstDate),
          lastDate: new Date(lastDate),
        });
        res.status(200).json(meals);
        break;

      case 'ingredients':
        const ingredients = await getIngredients();
        res.status(200).json(ingredients);
        break;

      case 'reciepes':
        const reciepe = await getReciepes();
        res.status(200).json(reciepe);
        break;

      case 'reciepeIngredientsRelations':
        const reciepeIngredientsRelations =
          await getReciepeIngredientsRelations();
        res.status(200).json(reciepeIngredientsRelations);
        break;

      case 'daily':
        const { date } = req.query;
        if (!date || typeof date !== 'string') {
          res.status(400).send('Invalid date in URL');
          break;
        }
        const menus = await getDailyMealsInformation({
          date: new Date(date),
        });
        res.status(200).json(menus);

        break;

      default:
        res.status(404).send('Not Found');
    }
  } catch (error) {
    res.status(500).send('Oops');
  }
}
