"use client";
import { supabase } from "utils/supabase/client";
import { Forecast, Recommendation, Stock, Technical } from "./types";
import { sendNotification } from "./notification";

export const StockTechnicalStatusTranslate = {
  [Technical.NEUTRAL]: "محايد",
  [Technical.BUY]: "شراء",
  [Technical.SELL]: "بيع",
  [Technical.STRONG_BUY]: "شراء قوي",
  [Technical.STRONG_SELL]: "بيع قوي",
};

export const stockAttributes = [
  { label: "اسم الشركة", value: (stock: Stock) => stock.Name, key: "Name" },
  { label: "الرمز", value: (stock: Stock) => stock.Symbol, key: "Symbol" },
  { label: "اعلى سعر", value: (stock: Stock) => stock.High, key: "High" },
  { label: "اقل سعر", value: (stock: Stock) => stock.Low, key: "Low" },
  { label: "آخر سعر", value: (stock: Stock) => stock.Last, key: "Last" },
  {
    label: "AI",

    value: (stock: Stock) => {
      return (
        <span
          style={{
            color: stock.AIRecommend?.includes(Recommendation.Buy)
              ? "green"
              : stock.AIRecommend?.includes(Recommendation.SEll)
              ? "red"
              : "black",
          }}
        >
          {stock.AIRecommend || "-"}
          {stock.AIRecommend?.includes(Recommendation.Buy)
            ? "↑"
            : stock.AIRecommend?.includes(Recommendation.SEll)
            ? "↓"
            : ""}
        </span>
      );
    },
    key: "AIRecommend",
  },

  {
    label: "AI Forcast for 3 days",
    value: (stock: Stock) => {
      return (
        <span
          style={{
            color: stock.Forecast?.includes(Forecast.Up)
              ? "green"
              : stock.Forecast?.includes(Forecast.Down)
              ? "red"
              : "black",
          }}
        >
          {stock.Forecast || "-"}
          {stock.Forecast?.includes(Forecast.Up)
            ? "↑"
            : stock.Forecast?.includes(Forecast.Down)
            ? "↓"
            : ""}
        </span>
      );
    },
    key: "Forecast",
  },
  {
    label: "AI Confidence",
    value: (stock: Stock) => {
      return <span>{stock.Confidence || "-"}</span>;
    },
    key: "Confidence",
  },

  {
    label: "AI Expected Profit",
    value: (stock: Stock) => {
      return (
        <span
          style={{
            color: Number(stock.ExpectedProfit || 0) > 0 ? "green" : "red",
          }}
        >
          {stock.ExpectedProfit || 0}
        </span>
      );
    },
    key: "ExpectedProfit",
  },
  {
    label: "اسهمي",
    value: (stock: Stock) => stock.amount || "-",
    key: "amount",
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
    value: (stock: Stock, onRefresh: () => void) => (
      <button
        className={`bg-${
          stock.key ? "red" : "green"
        }-500 text-white px-5 py-3 rounded`}
        onClick={async () => {
          try {
            if (stock.key) {
              const result = await supabase
                .from("stocks")
                .delete()
                .eq("key", stock.key);
              if (result.status === 204) {
                sendNotification(
                  stock,
                  stock.currentRecommend,
                  "تم البيع بنجاح"
                );
                onRefresh?.();
              }
            } else {
              const stocksAmount = Number(prompt("عدد الاسهم"));
              if (!stocksAmount && isNaN(stock.amount)) return;
              const newStock = { ...stock };
              newStock.amount = stocksAmount;
              newStock.key = new Date().getTime();
              newStock.purchasePrice = newStock.Last;
              const recommend = newStock.AIRecommend;
              newStock.prevRecommend = recommend;
              newStock.currentRecommend = recommend;
              const result = await supabase.from("stocks").insert(newStock);
              console.log("🚀 ~ onClick={ ~ result:", result);
              if (result.status === 201)
                sendNotification(newStock, recommend, "تم الشراء بنجاح");
            }
          } catch (e) {
            console.log("🚀 ~ onClick={ ~ e:", e);
          }
        }}
      >
        {stock.amount ? "بيع" : "شراء"}
      </button>
    ),
    key: "save",
  },
];
