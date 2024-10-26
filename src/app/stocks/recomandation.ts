import { Stock, Technical } from "./types";

export const getStrongRecommendation = (stock: Stock): Technical => {
  const {
    TechnicalDay,
    TechnicalWeek,
    TechnicalMonth,
    PerformanceDay,
    PerformanceMonth,
    FundamentalBeta,
    Last,
    High,
    Low,
    AvgVolume,
    ChgPct,
    Chg,
  } = stock;

  // 1. Strong Buy Conditions
  const isStrongBuy =
    Chg !== 0 &&
    ChgPct !== 0 &&
    ((TechnicalDay === Technical.STRONG_BUY &&
      TechnicalWeek === Technical.STRONG_BUY &&
      TechnicalMonth === Technical.STRONG_BUY) ||
      (PerformanceDay > 5 &&
        PerformanceMonth > 10 &&
        Last < High * 0.95 &&
        AvgVolume > 10000) || // High performance, undervalued, and good volume
      (FundamentalBeta < 0 && ChgPct > 2)); // Low risk and good change percentage

  if (isStrongBuy) {
    return Technical.STRONG_BUY;
  }

  // 2. Strong Sell Conditions
  const isStrongSell =
    Chg !== 0 &&
    ChgPct !== 0 &&
    ((TechnicalDay === Technical.STRONG_SELL &&
      TechnicalWeek === Technical.STRONG_SELL &&
      TechnicalMonth === Technical.STRONG_SELL) ||
      (PerformanceDay < -5 &&
        PerformanceMonth < -10 &&
        Last > Low * 1.05 &&
        AvgVolume > 10000) || // Negative performance, overvalued, and good volume
      (FundamentalBeta > 1 && ChgPct < -2)); // High risk and negative change percentage

  if (isStrongSell) {
    return Technical.STRONG_SELL;
  }

  // 3. Buy Conditions
  const isBuy =
    Chg !== 0 &&
    ChgPct !== 0 &&
    (TechnicalDay === Technical.BUY ||
      TechnicalWeek === Technical.BUY ||
      TechnicalMonth === Technical.BUY ||
      (PerformanceDay > 0 && PerformanceMonth > 0 && Last < High)); // Positive performance and undervalued

  if (isBuy) {
    return Technical.BUY;
  }

  // 4. Sell Conditions
  const isSell =
    Chg !== 0 &&
    ChgPct !== 0 &&
    (TechnicalDay === Technical.SELL ||
      TechnicalWeek === Technical.SELL ||
      TechnicalMonth === Technical.SELL ||
      (PerformanceDay < 0 && PerformanceMonth < 0 && Last > Low)); // Negative performance and overvalued

  if (isSell) {
    return Technical.SELL;
  }

  // Default recommendation
  return Technical.NEUTRAL; // Indicates no strong action is recommended
};
