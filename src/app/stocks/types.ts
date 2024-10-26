export enum Recommendation {
  SEll = "sell",
  Buy = "Buy",
  Both = "Both",
  NONE = "NONE",
}

export enum Technical {
  NEUTRAL = "neutral",
  STRONG_SELL = "strong_sell",
  SELL = "sell",
  STRONG_BUY = "strong_buy",
  BUY = "buy",
}

export interface Stock {
  AvgVolume: number; //31929;
  Chg: number; //0;
  ChgPct: number; // 0;
  CountryNameTranslated: "مصر";
  ExchangeId: string; // '33';
  Flag: string; // 'EG';
  FundamentalBeta: number; // -0.145;
  FundamentalMarketCap: number; // 579080000;
  FundamentalRatio: number; //-44.95;
  FundamentalRevenue: string; // '26.60M';
  High: number; // 31.8;
  Id: string; //'12949';
  IsCFD: string; //'false';
  IsOpen: string; //'0';
  Last: number; // 33.45;
  LastPairDecimal: 2;
  Low: number; // 31.78;
  Name: string; //'رواد';
  PairType: string; // 'Equities';
  Performance3Year: number; //-38.95;
  PerformanceDay: number; //0;
  PerformanceMonth: number; // 0;
  PerformanceWeek: number; // 0;
  PerformanceYear: number; //111.57;
  PerformanceYtd: number; // 10.51;
  Symbol: number; //'ROTO';
  TechnicalDay: Technical;
  TechnicalHour: Technical;
  TechnicalMonth: Technical;
  TechnicalWeek: Technical;
  Time: string; //'1728386219';
  Url: string; //'/equities/rowad-tourism';
  Volume: number; //1047;

  // amount of purchased stocks
  amount: number;
  // unique key
  key: number;
  // prev price
  purchasePrice: number;
}
