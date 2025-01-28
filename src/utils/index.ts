import { Stock } from "app/stocks/types";

export function getTopStocksToBuy(data: Stock[]): Stock[] {
  const sortedStocks = data.sort(
    (a, b) => (b.ExpectedProfit || 0) - (a.ExpectedProfit || 0)
  );
  const lastIndexOfTop = data.findLastIndex(
    (a) => a.ExpectedProfit == sortedStocks[0].ExpectedProfit
  );
  return sortedStocks.slice(0, lastIndexOfTop + 1);
}

export function getTopStocksToSell(data: Stock[]): Stock[] {
  return data.filter((a) => a.Low < a.purchasePrice);
}
