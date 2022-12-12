// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { withIronSessionApiRoute } from 'iron-session/next';
import type { NextApiRequest, NextApiResponse } from 'next';
import { hasProperty } from '../../../helpers/typeGuards';
import { getClient } from '../../../notion-api/getClient';
import { getDailyMealsInformation } from '../../../notion-api/getDailyMealsInformation';
import { getDatabaseId } from '../../../notion-api/getDatabasesId';
import { getIngredients } from '../../../notion-api/getIngredients';
import { getMeals } from '../../../notion-api/getMeals';
import { getReciepeIngredientsRelations } from '../../../notion-api/getReciepeIngredientsRelations';
import { getReciepes } from '../../../notion-api/getReciepes';

export default withIronSessionApiRoute(
  async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { data } = req.query;
    if (!req.session.notionToken) {
      res.status(401).send('Unauthorized');
      return;
    }
    try {
      const client = getClient(req.session.notionToken);
      switch (data) {
        case 'database':
          const { name } = req.query;
          if (!name || typeof name !== 'string') {
            return res.status(400).send('No database name provided');
          }
          const databaseId = await getDatabaseId(name, client);
          res.status(200).json({ databaseId });
          break;
        case 'meals':
          const { firstDate, lastDate, mealdbid, additionalingredientsdbid } =
            req.query;
          if (
            !firstDate ||
            !lastDate ||
            typeof firstDate !== 'string' ||
            typeof lastDate !== 'string'
          ) {
            res.status(400).send('Invalid date in URL');
            break;
          }
          if (!mealdbid || typeof mealdbid !== 'string') {
            return res.status(400).send('No meal database id provided');
          }
          if (
            !additionalingredientsdbid ||
            typeof additionalingredientsdbid !== 'string'
          ) {
            return res
              .status(400)
              .send('No additional ingredients database id provided');
          }
          const meals = await getMeals(
            {
              firstDate: new Date(firstDate),
              lastDate: new Date(lastDate),
              mealDatabaseId: mealdbid,
              additionalIngredientsDatabaseId: additionalingredientsdbid,
            },
            client
          );
          res.status(200).json(meals);
          break;

        case 'ingredients':
          const { dbid: ingredientsDatabaseId } = req.query;
          if (
            !ingredientsDatabaseId ||
            typeof ingredientsDatabaseId !== 'string'
          ) {
            return res.status(400).send('No ingredients database id provided');
          }
          const ingredients = await getIngredients(
            { ingredientsDatabaseId },
            client
          );
          res.status(200).json(ingredients);
          break;

        case 'reciepes':
          const { dbid: reciepesDatabaseId } = req.query;
          if (!reciepesDatabaseId || typeof reciepesDatabaseId !== 'string') {
            return res.status(400).send('No ingredients database id provided');
          }
          const reciepe = await getReciepes({ reciepesDatabaseId }, client);
          res.status(200).json(reciepe);
          break;

        case 'reciepeIngredientsRelations':
          const { dbid: reciepeIngredientsRelationDatabaseId, start_cursor } =
            req.query;
          if (
            !reciepeIngredientsRelationDatabaseId ||
            typeof reciepeIngredientsRelationDatabaseId !== 'string'
          ) {
            return res
              .status(400)
              .send('No reciepe-ingredients relation database id provided');
          }
          if (start_cursor && typeof start_cursor !== 'string') {
            return res.status(400).send('Invalid start_cursor');
          }
          const reciepeIngredientsRelations =
            await getReciepeIngredientsRelations(
              { reciepeIngredientsRelationDatabaseId, start_cursor },
              client
            );
          res.status(200).json(reciepeIngredientsRelations);
          break;

        case 'daily':
          const {
            date,
            mealdbid: mealdbidDayly,
            reciepeingredientsrelationdbid,
          } = req.query;
          if (!date || typeof date !== 'string') {
            res.status(400).send('Invalid date in URL');
            break;
          }
          if (!mealdbidDayly || typeof mealdbidDayly !== 'string') {
            return res.status(400).send('No meal database id provided');
          }
          if (
            !reciepeingredientsrelationdbid ||
            typeof reciepeingredientsrelationdbid !== 'string'
          ) {
            return res
              .status(400)
              .send('No reciepe-ingredients relation database id provided');
          }
          const menus = await getDailyMealsInformation(
            {
              date: new Date(date),
              mealDatabaseId: mealdbidDayly,
              reciepeIngredientsRelationDatabaseId:
                reciepeingredientsrelationdbid,
            },
            client
          );
          res.status(200).json(menus);

          break;

        default:
          res.status(404).send('Not Found');
      }
    } catch (error) {
      res.status(500).send(error);
    }
  },
  {
    cookieName: process.env.IRON_SESSION_COOKIE_NAME || '',
    password: process.env.IRON_SESSION_PASSWORD || '',
    // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
    },
  }
);
