import { Client } from '@notionhq/client';
import { getShoppingListPageId } from './getShoppingListPageId';

export async function getListDates(client: Client) {
  const shoppingListPageId = await getShoppingListPageId(client);
  if (!shoppingListPageId) return null;
  const pageBlocks = await client.blocks.children.list({
    block_id: shoppingListPageId,
  });

  const dates = pageBlocks.results
    // @ts-expect-error also works with PartialBlockObjectRespons
    .flatMap((block) => block.paragraph?.rich_text)
    .find((text) => text?.type === 'mention' && text?.mention?.type === 'date')
    ?.mention?.date;

  return {
    startDate: new Date(dates?.start),
    endDate: new Date(dates?.end),
  };
}
