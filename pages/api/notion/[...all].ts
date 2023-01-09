import { NextApiRequest, NextApiResponse } from 'next';
import { type } from 'os';

export default async function notionProxy(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { query, method, body, headers } = req;

  const path = query.all
    ? typeof query.all === 'string'
      ? query.all
      : query.all.join('/')
    : '';

  const response = await fetch(`https://api.notion.com/${path}`, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      authorization: headers.authorization ?? '',
      'content-type': headers['content-type'] ?? '',
      'notion-version':
        headers['notion-version'] &&
        typeof headers['notion-version'] === 'string'
          ? headers['notion-version']
          : '',
    },
  });
  const data = await response.json();
  res.status(response.status).json(data);

  return;
}
