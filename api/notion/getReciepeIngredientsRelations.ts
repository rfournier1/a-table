import { GetPageResponse } from '@notionhq/client/build/src/api-endpoints';
import queryAllPaginatedAPI from '../../helpers/queryAllPaginatedAPI';
import { getClient } from './getClient';

const client = getClient();

export const getReciepeIngredientsRelations = async () => {
  const reciepeIngredientsRelationDatabaseId =
    process.env.NOTION_RECIEPE_INGREDIENTS_RELATION_DATABASE_ID;

  if (reciepeIngredientsRelationDatabaseId === undefined) {
    throw new Error(
      'NOTION_RECIEPE_INGREDIENTS_RELATION_DATABASE_ID is not defined'
    );
  }

  const reciepeIngredientsRelations: Record<string, GetPageResponse> =
    Object.assign(
      {},
      ...(
        await queryAllPaginatedAPI(client.databases.query, {
          database_id: reciepeIngredientsRelationDatabaseId,
        })
      ).map((reciepeIngredientsRelation) => ({
        [reciepeIngredientsRelation.id]: reciepeIngredientsRelation,
      }))
    );

  return { reciepeIngredientsRelations };
};
