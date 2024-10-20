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
        <div className="flex flex-row items-center space-y-2">
          <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-green-500 text-green-500" />
          شراء
        </div>
      );
    case Technical.STRONG_BUY:
      return (
        <div className="flex flex-row items-center space-y-2">
          <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-green-500" />
          <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-green-500" />
          شراء
        </div>
      );

    case Technical.SELL:
      return (
        <div className="flex flex-row items-center space-y-2">
          <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-red-500 text-red-500" />
          بيع
        </div>
      );
    case Technical.STRONG_SELL:
      return (
        <div className="flex flex-row items-center space-y-2">
          <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-red-500" />
          <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-red-500" />
          بيع
        </div>
      );
    default:
      return "-";
  }
};
