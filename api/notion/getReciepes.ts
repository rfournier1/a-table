import { GetPageResponse } from '@notionhq/client/build/src/api-endpoints';
import queryAllPaginatedAPI from '../../helpers/queryAllPaginatedAPI';
import { getClient } from './getClient';

const client = getClient();

export const getReciepes = async () => {
  const reciepeDatabaseId = process.env.NOTION_RECIEPE_DATABASE_ID;
  if (reciepeDatabaseId === undefined) {
    throw new Error('NOTION_RECIEPE_DATABASE_ID is not defined');
  }

  const reciepes: Record<string, GetPageResponse> = Object.assign(
    {},
    ...(
      await queryAllPaginatedAPI(client.databases.query, {
        database_id: reciepeDatabaseId,
      })
    ).map((reciepe) => ({ [reciepe.id]: reciepe }))
  );

  return { reciepes };
};
