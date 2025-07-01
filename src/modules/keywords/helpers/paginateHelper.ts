export function paginate(
  result: any[],
  lastKeywordPosition: number,
  itemsPerPage = 10,
  page?: number,
): {
  items: { position: number; url: string; keywordPosition: boolean }[];
  meta: {
    itemCount: number;
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
} {
  const totalItems = result.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  let currentPage = 1;

  if (page !== null) {
    currentPage = Math.max(1, Math.min(page, totalPages)); // Устанавливаем текущую страницу в пределах допустимого диапазона
  } else if (lastKeywordPosition !== 101) {
    for (let i = 0; i < totalItems; i += itemsPerPage) {
      const page = result.slice(i, i + itemsPerPage);
      if (page.some((item) => item.position === lastKeywordPosition)) {
        currentPage = Math.ceil((i + 1) / itemsPerPage);
        break;
      }
    }
  }

  // Если currentPage превышает totalPages, устанавливаем currentPage на 1
  if (currentPage > totalPages) {
    currentPage = 1;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const itemsOnPage = result.slice(startIndex, startIndex + itemsPerPage);

  const items = itemsOnPage.map((item) => ({
    position: item.position,
    url: item.link,
    keywordPosition: item.position === lastKeywordPosition,
  }));

  return {
    items,
    meta: {
      itemCount: items.length,
      totalItems,
      itemsPerPage,
      totalPages,
      currentPage,
    },
  };
}
