export default async function processPromisesBatch(items, fn, batchSize=5) {
  let results = [];
  for (let start = 0; start < items.length; start += batchSize) {
    const end = start + batchSize > items.length ? items.length : start + batchSize;

    const slicedResults = await Promise.all(items.slice(start, end).map(fn));

    results = [
      ...results,
      ...slicedResults,
    ]
  }

  return results;
}
