export const PAGE_SIZE = 20;

export function parsePage(value: string | undefined) {
  if (!value || !/^\d+$/.test(value)) return 1;
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export function pageBounds(total: number, requestedPage: number) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, requestedPage), pages);
  return { page, pages, offset: (page - 1) * PAGE_SIZE };
}
