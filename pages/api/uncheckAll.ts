// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { withIronSessionApiRoute } from 'iron-session/next';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getClient } from '../../notion-api/getClient';
import { mutateIngredientCheckedProperty } from '../../notion-api/mutateIngredientCheckedProperty';

export default withIronSessionApiRoute(
  async function handler(
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
    if (!req.session.notionToken) {
      res.status(401).send('Unauthorized');
      return;
    }
    try {
      const client = getClient(req.session.notionToken);
      await Promise.all(
        idsArray.map((id: string) => {
          mutateIngredientCheckedProperty({ id: id, checked: false }, client);
        })
      );
      res.status(200).json(true);
    } catch (error) {
      console.error(error);
      res.status(500).send('Oops');
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
