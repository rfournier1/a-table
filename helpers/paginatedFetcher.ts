/**
 * Fetches all pages of a paginated API endpoint.
 * @param input
 * @param init
 * @returns
 */

export const paginatedFetcher = async (
  input: RequestInfo | URL,
  init?: RequestInit | undefined
) => {
  let next_cursor = undefined;
  let first_loop = true;
  const responses = [];
  while (first_loop || next_cursor) {
    first_loop = false;
    const paginatedInput: string = `${input.toString()}${
      next_cursor
        ? (input.toString().includes('?') ? '&' : '?') +
          'start_cursor=' +
          next_cursor
        : ''
    }`;

    const response = await fetch(paginatedInput, init).then((res) =>
      res.json()
    );

    responses.push(...response.results);
    next_cursor = response.next_cursor;
  }
  return responses;
};
