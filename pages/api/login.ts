import { withIronSessionApiRoute } from 'iron-session/next';
import { hasProperty } from '../../helpers/typeGuards';
import { NOTION_TOKEN_API } from '../../notion-api/keys';

export default withIronSessionApiRoute(
  async function login(req, res) {
    const code = req.query.code;
    if (!code) {
      return res.status(400).json({ error: 'No code provided' });
    }
    try {
      const authorization = Buffer.from(
        `${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_ITEGRATION_SECRET}`
      );
      const notionTokenResponse = await fetch(NOTION_TOKEN_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${authorization.toString('base64')}`,
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code,
          redirect_uri: process.env.NOTION_REDIRECT_URL,
        }),
      }).then((response) => response.json());
      if (notionTokenResponse.error) {
        throw new Error(notionTokenResponse.error);
      }
      req.session.notionToken = notionTokenResponse.access_token;
      await req.session.save();
      res.send({ ok: true });
    } catch (err) {
      return res
        .status(
          hasProperty(err, 'code') && typeof err.code === 'number'
            ? err.code
            : 500
        )
        .json({
          error:
            hasProperty(err, 'message') && typeof err.message === 'string'
              ? err.message
              : err,
        });
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
