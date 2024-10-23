import moment from "moment";

import { getStrongRecommendation } from "./recomandation";
import { Stock, Technical } from "./types";

const StockTechnicalStatusTranslate = {
  [Technical.NEUTRAL]: "محايد",
  [Technical.BUY]: "شراء",
  [Technical.SELL]: "بيع",
  [Technical.STRONG_BUY]: "شراء قوي",
  [Technical.STRONG_SELL]: "بيع قوي",
};

// Define the stock attributes and their Arabic labels
export const stockAttributes = [
  { label: "اسم الشركة", value: (stock: Stock) => stock.Name, key: "Name" },
  { label: "الرمز", value: (stock: Stock) => stock.Symbol, key: "Symbol" },
  { label: "آخر سعر", value: (stock: Stock) => stock.Last, key: "Last" },
  {
    label: " مضاربه في خلال ساعه ",
    value: (stock: Stock) => StockTechnicalStatusTranslate[stock.TechnicalHour],
    key: "TechnicalHour",
  },
  {
    label: " مضاربه يوميه ",
    value: (stock: Stock) => StockTechnicalStatusTranslate[stock.TechnicalDay],
    key: "TechnicalDay",
  },
  {
    label: " مضاربه اسبوعيه",
    value: (stock: Stock) => StockTechnicalStatusTranslate[stock.TechnicalWeek],
    key: "TechnicalWeek",
  },
  {
    label: "مضاربه شهريه ",
    value: (stock: Stock) =>
      StockTechnicalStatusTranslate[stock.TechnicalMonth],
    key: "TechnicalMonth",
  },
  { label: "اعلى سعر", value: (stock: Stock) => stock.High, key: "High" },
  { label: "اقل سعر", value: (stock: Stock) => stock.Low, key: "Low" },
  {
    label: "التغير",
    value: (stock: Stock) => stock.Chg,
    isChange: true,
    key: "Chg",
  },
  {
    label: "نسبة التغير%",
    value: (stock: Stock) => stock.ChgPct,
    isChange: true,
    isPercentage: true,
    key: "ChgPct",
  },
  { label: "الكمية", value: (stock: Stock) => stock.Volume, key: "Volume" },
  {
    label: "الوقت",
    value: (stock: Stock) =>
      moment(Number(stock.Time) * 1000).format("hh:mm:ss  DD/MM/YYYY"),
    key: "Time",
  },
  {
    label: "التوصيات",
    value: (stock: Stock) => (
      <GetRecommendationIcon recommendation={getStrongRecommendation(stock)} />
    ),
    key: "Recommendation",
  },
  {
    label: "اسهمي",
    value: (stock: Stock) => stock.amount || "-",
    key: "myAmount",
  },

  {
    label: "الربح والخسارة",
    value: (stock: Stock) => {
      const profitLoss = (stock.Last - stock.purchasePrice) * stock.amount;
      const formattedProfitLoss = isNaN(profitLoss)
        ? "-"
        : profitLoss.toFixed(2);

      if (isNaN(profitLoss)) {
        return "-";
      }

      const isProfit = profitLoss > 0;
      const color = isProfit ? "green" : "red";
      const arrow = isProfit ? "↑" : "↓";

      return (
        <span style={{ color }}>
          {formattedProfitLoss} {arrow}
        </span>
      );
    },
    key: "profitLoss",
  },
  {
    label: "العمليه",
    value: (stock: Stock, refresh: () => void) => (
      <button
        className={`bg-${
          stock.key ? "red" : "green"
        }-500 text-white px-5 py-3 rounded`}
        onClick={() => {
          let stocks: Stock[] = [];
          const stocksString = localStorage.getItem("stocks");
          if (stocksString) {
            stocks = JSON.parse(stocksString);
          }
          if (stock.key) {
            stocks = stocks.filter((s) => s.key !== stock.key);
          } else {
            stock.amount = Number(prompt("عدد الاسهم"));
            stock.key = new Date().getMilliseconds();
            stock.purchasePrice = stock.Last;
            stocks.push(stock);
          }
          localStorage.setItem("stocks", JSON.stringify(stocks));
          if (refresh) refresh();
        }}
      >
        {stock.amount ? "بيع" : "شراء"}
      </button>
    ),
    key: "save",
  },
];

// Function to get recommendation icon and color based on recommendation
const GetRecommendationIcon = ({
  recommendation,
}: {
  recommendation: Technical;
}) => {
  switch (recommendation) {
    case Technical.BUY:
      return (
        <div className="flex flex-row items-center space-y-2 text-green-500">
          <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-green-500 text-green-500" />
          شراء
        </div>
      );
    case Technical.STRONG_BUY:
      return (
        <div className="flex flex-row items-center space-y-2 text-green-500">
          <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-green-500" />
          <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-green-500" />
          شراء
        </div>
      );

    case Technical.SELL:
      return (
        <div className="flex flex-row items-center space-y-2 text-red-500">
          <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-red-500 text-red-500" />
          بيع
        </div>
      );
    case Technical.STRONG_SELL:
      return (
        <div className="flex flex-row items-center space-y-2 text-red-500">
          <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-red-500" />
          <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-red-500" />
          بيع
        </div>
      );
    default:
      return "-";
  }
};
