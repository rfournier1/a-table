import { withIronSessionApiRoute } from 'iron-session/next';

export default withIronSessionApiRoute(
  async function logout(req, res) {
    if (!req.session.notionToken) {
      res.status(401).send('Unauthorized');
      return;
    }
    req.session.destroy();
    res.send({ ok: true });
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
