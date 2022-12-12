// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { withIronSessionApiRoute } from 'iron-session/next';
import type { NextApiRequest, NextApiResponse } from 'next';
import { hasProperty } from '../../helpers/typeGuards';
import { getClient } from '../../notion-api/getClient';
import { mutateIngredientCheckedProperty } from '../../notion-api/mutateIngredientCheckedProperty';

export default withIronSessionApiRoute(
  async function handler(
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
    if (!req.session.notionToken) {
      res.status(401).send('Unauthorized');
      return;
    }
    try {
      const client = getClient(req.session.notionToken);
      const newChecked = await mutateIngredientCheckedProperty(
        {
          id,
          checked: checked === 'true',
        },
        client
      );
      res.status(200).json(newChecked);
    } catch (err) {
      return res
        .status(
          hasProperty(err, 'code') && typeof err.code === 'number'
            ? err.code
            : 500
        )
        .json(
          hasProperty(err, 'message') && typeof err.message === 'string'
            ? err.message
            : 'error'
        );
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
