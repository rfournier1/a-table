import { NextApiRequest, NextApiResponse } from 'next';
import { hasProperty } from '../../helpers/typeGuards';
import { NOTION_TOKEN_API } from '../../notion-api/keys';

export default async function getNotionToken(
  req: NextApiRequest,
  res: NextApiResponse<{ token: string } | { error: string }>
) {
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
    const notionToken = notionTokenResponse.access_token;
    if (!notionToken) {
      throw new Error('No token provided');
    }
    res.json({ token: notionToken });
  } catch (err) {
    return res
      .status(
        hasProperty(err, 'code') && typeof err.code === 'number'
          ? err.code
          : 500
      )
      .send({
        error:
          hasProperty(err, 'message') && typeof err.message === 'string'
            ? err.message
            : typeof err === 'string'
            ? err
            : 'unknown error',
      });
  }
}
