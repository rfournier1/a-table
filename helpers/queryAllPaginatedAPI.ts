import {
  GetPageResponse,
  QueryDatabaseParameters,
  QueryDatabaseResponse,
} from '@notionhq/client/build/src/api-endpoints';

export default async function queryAllPaginatedAPI(
  listFn: (args: QueryDatabaseParameters) => Promise<QueryDatabaseResponse>,
  args: QueryDatabaseParameters
): Promise<GetPageResponse[]> {
  const results: GetPageResponse[] = [];
  let currentPage = await listFn(args);
  results.push(...currentPage.results);
  while (currentPage.next_cursor !== null) {
    args.start_cursor = currentPage.next_cursor;
    currentPage = await listFn(args);
    results.push(...currentPage.results);
  }
  return results;
}
