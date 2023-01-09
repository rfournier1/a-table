import { Client } from '@notionhq/client';
import { ShoppingList } from '../types';
import { getDatabaseId } from './getDatabasesId';
import { getShoppingListPageId } from './getShoppingListPageId';
import queryAllPaginatedAPI from '../helpers/queryAllPaginatedAPI';
import { SHOPPING_LIST_DB_NAME } from './keys';

type updateShoppingListProps = {
  shoppingList: ShoppingList;
  firstDate: Date;
  lastDate: Date;
};
export async function updateShoppingList(
  { shoppingList, firstDate, lastDate }: updateShoppingListProps,
  client: Client
) {
  const shoppingListPageId = await getShoppingListPageId(client);
  if (!shoppingListPageId) return null;
  const pageBlocks = await client.blocks.children.list({
    block_id: shoppingListPageId,
  });
  const dateBlock = pageBlocks.results.find(
    // @ts-expect-error also works with PartialBlockObjectRespons
    (block) => block.type === 'heading_3'
  );
  if (dateBlock) {
    await client.blocks.update({
      block_id: dateBlock.id,
      heading_3: {
        rich_text: [
          {
            text: {
              content: `From ${firstDate.toLocaleDateString()} to ${lastDate.toDateString()} - generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
            },
          },
        ],
      },
    });
  }
  const shoppingListDatabaseId = await getDatabaseId(
    SHOPPING_LIST_DB_NAME,
    client
  );
  if (!shoppingListDatabaseId) return null;
  const listItemsToRemove = await queryAllPaginatedAPI(client.databases.query, {
    database_id: shoppingListDatabaseId,
  });
  //clear the database
  await Promise.all(
    listItemsToRemove.map((item) =>
      client.pages.update({
        page_id: item.id,
        archived: true,
      })
    )
  );
  //insert the new items
  await Promise.all(
    shoppingList.map((item) =>
      client.pages.create({
        parent: {
          database_id: shoppingListDatabaseId,
        },
        properties: {
          Name: {
            title: [
              {
                text: {
                  content: item.name,
                },
              },
            ],
          },
          Ingredient: {
            relation: [
              {
                id: item.id,
              },
            ],
          },
          Quantity: {
            number: item.quantity,
          },
          OK: {
            checkbox: false,
          },
        },
      })
    )
  );
}
