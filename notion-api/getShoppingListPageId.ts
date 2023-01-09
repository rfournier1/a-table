import { Client } from '@notionhq/client';
import {
  PageObjectResponse,
  SearchParameters,
} from '@notionhq/client/build/src/api-endpoints';

export async function getShoppingListPageId(client: Client) {
  const query = 'Shopping List';
  const filter: SearchParameters['filter'] = {
    property: 'object',
    value: 'page',
  };
  const response = await client.search({
    query,
    filter,
  });
  const shoppingListPage = response.results.find(
    (result) =>
      (
        (result as PageObjectResponse).properties.title as {
          id: string;
          title: { plain_text: string }[];
        }
      ).title[0]?.plain_text === query
  );
  if (!shoppingListPage) return null;
  return shoppingListPage.id;
}
