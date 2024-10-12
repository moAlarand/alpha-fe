import moment from "moment";
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
      moment(Number(stock.Time) * 1000).format("hh:mm:ss  MM/DD/YYYY"),
    key: "Time",
  },
];
