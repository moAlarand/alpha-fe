"use client";
import { useEffect, useState } from "react";
import alphaLogo from "../images/alpha.webp";
import { Stock } from "./types";
import Image from "next/image";
import { stockAttributes } from "./stockAttributes";
import { getEGXAllStockData } from "../api";
import { updateCurrentRecommend } from "./recomandation";
import Link from "next/link";
import { supabase } from "../../utils/supabase/client";
import Avatar from "app/account/avatar";
// import { sendNotification } from "./notification";
import {
  getAIStoredRecommendations,
  getRecommendationFromChatGpt,
} from "app/ai/chatgpt";
import { getTopStocksToBuy, getTopStocksToSell } from "utils";
// import { useTrainAndUpdateModel } from "app/ai/aiModel";

export default function Home() {
  const [profile, setProfile] = useState<{
    full_name: string;
    id: string;
    avatar_url: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isMyOwnStocks, setIsMyOwnStocks] = useState(false);
  // useTrainAndUpdateModel(stocks);
  // Function to fetch stock data
  const fetchStockData = async () => {
    try {
      const data: Stock[] = await getEGXAllStockData();
      setStocks(data);
      // ai stocks from storage getAIStoredRecommendations
      const aiStocks = getAIStoredRecommendations();
      console.log("🚀 ~ fetchStockData ~ aiStocks:", aiStocks?.length);
      // Fetch stocks with currentRecommend from the database
      const { data: dbStocks, error: dbError } = await supabase
        .from("stocks")
        .select("*");
      console.log("🚀 ~ fetchStockData ~ dbStocks:", dbStocks);

      if (dbError) throw dbError;

      // Update each stock's recommendation if there's a change
      data.forEach((stock) => {
        const aiStock = aiStocks?.find((s) => s.Id === stock.Id); // ai stock
        stock.AIRecommend = aiStock?.AIRecommend;
        stock.Forecast = aiStock?.Forecast;
        stock.Confidence = aiStock?.Confidence;
        stock.ExpectedProfit = aiStock?.ExpectedProfit;
        const dbStock = dbStocks?.find((s) => s.Id === stock.Id);
        const recommendation = stock.AIRecommend; // Get new recommendation
        if (dbStock && dbStock.currentRecommend !== recommendation) {
          updateCurrentRecommend(stock.Id, recommendation); // Only update if recommendation has changed
          // sendNotification(dbStock, recommendation);
        }
      });

      setStocks(data); // Update local state with latest fetched data
    } catch (error) {
      console.error("Error fetching or updating stock data:", error);
    }
  };

  // my stock
  const getUserStocks = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: myStocks } = await supabase
      .from("stocks")
      .select("*")
      .eq("user_id", user?.id);
    setIsMyOwnStocks(!!myStocks?.length);
    setFilteredStocks(
      (myStocks as Stock[]).map((s) => {
        const nS = stocks.find((fs) => s.Id === fs.Id);
        return { ...s, ...nS };
      })
    );
  };
  // refresh
  // Initial fetch and refresh every 10 seconds
  useEffect(() => {
    fetchStockData(); // Initial fetch
    const inter = setInterval(() => {
      fetchStockData(); // Refresh every 10 seconds
    }, 10000);
    return () => clearInterval(inter); // Cleanup
  }, []);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data } = await supabase
        .from("profiles")
        .select(`id,full_name, username, avatar_url`)
        .eq("id", user?.id)
        .single();
      setProfile(data);
    })();
  }, []);

  // Filtering stocks
  useEffect(() => {
    if (stocks?.length)
      setFilteredStocks((fsks) =>
        fsks?.length
          ? fsks.map((s) => {
              const nS = stocks.find((fs) => s.Id === fs.Id);
              return { ...s, ...nS };
            })
          : stocks
      );
  }, [stocks]); // Dependencies include both stocks and filteredStocks

  // Filter stocks based on search input
  useEffect(() => {
    setFilteredStocks((fsks) =>
      fsks.filter(
        (stock) =>
          stock.Name.toLowerCase().includes(search.toLowerCase()) ||
          String(stock.Symbol).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search]);

  // Sort stocks based on selected attribute and direction
  const handleSort = (key: keyof Stock) => {
    // Sorting for other attributes
    const direction =
      sortBy === key && sortDirection === "asc" ? "desc" : "asc";
    setSortBy(key);
    setSortDirection(direction);

    // Sort by numerical or string attributes
    const sorted = [...filteredStocks].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];

      if (typeof aValue === "number" && typeof bValue === "number") {
        return direction === "asc" ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });

    setFilteredStocks(sorted);
  };

  const _getAiRecomandation = async () => {
    setLoading(true);
    await getRecommendationFromChatGpt(stocks);
    await fetchStockData();
    setLoading(false);
  };
  // Reset filter and sorting
  const handleReset = () => {
    setSearch("");
    setSortBy(null);
    setSortDirection("asc");
    setIsMyOwnStocks(false);
    setFilteredStocks(stocks); // Reset filtered stocks to the full list
  };

  const handleRecommendedToBuy = async () => {
    setSearch("");
    setSortBy(null);
    setSortDirection("asc");
    await _getAiRecomandation();
    setFilteredStocks(getTopStocksToBuy(stocks));
  };

  const handleRecommendedToSell = () => {
    setSearch("");
    setSortBy(null);
    setSortDirection("asc");
    setFilteredStocks(getTopStocksToSell(filteredStocks));
  };

  return (
    <div
      className="container mx-auto p-4 bg-white border text-black  overflow-x-auto"
      dir="rtl"
    >
      {/* Overlay Loading */}
      {loading && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="animate-spin border-t-4 border-white w-16 h-16 rounded-full"></div>
        </div>
      )}
      <div className="flex">
        <div className="flex">
          <Link href={"/account"}>
            <Avatar
              uid={profile?.id ?? null}
              url={profile?.avatar_url ?? null}
              size={60}
            />
          </Link>
          <div className="flex justify-center">
            <div className="flex justify-center">
              <Image src={alphaLogo} alt="Alpha Logo" className="h-20 w-20" />
              <div>
                <h3 className="text-4xl font-bold text-right">السوق المصري </h3>

                <h1 className="text-1xl font-bold mb-4 text-right">
                  ثبات نسبي في السوق من (من 12:00 ظهرًا إلى 1:30 مساءً)
                </h1>
                <h1 className="text-1xl font-bold mb-2 text-right">
                  تقلب (من 10:00 صباحًا إلى 11:00 صباحًا)و(من 2:30 إلى 3:00
                  مساءً)
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-4 text-right">بيانات الأسهم</h1>

      {/* Search input */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          className="p-2 border rounded w-1/2 text-right"
          placeholder="ابحث عن الأسهم بالاسم أو الرمز"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={loading ? undefined : _getAiRecomandation}
        >
          {loading ? "loading..." : "AI Start"}
        </button>

        {!isMyOwnStocks && (
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={handleRecommendedToBuy}
          >
            توصيات بالشراء
          </button>
        )}
        {isMyOwnStocks && (
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={handleRecommendedToSell}
          >
            توصيات بالبيع
          </button>
        )}
        <button
          className="bg-yellow-500 text-white px-4 py-2 rounded"
          onClick={getUserStocks}
        >
          اسهمي
        </button>
        {/* Reset button */}
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={handleReset}
        >
          إعادة تعيين
        </button>
      </div>

      {/* // stocks table */}
      <table className="min-w-full bg-white border border-gray-200 shadow scroll-m-1">
        <thead>
          <tr className="bg-slate-100">
            {stockAttributes.map((attr) => (
              <th
                key={attr.label + attr.key}
                onClick={() => handleSort(attr.key as keyof Stock)}
                className={`py-2 px-4 border-b text-gray-700 text-center cursor-pointer ${
                  sortBy === attr.key
                    ? sortDirection === "asc"
                      ? "bg-blue-100"
                      : "bg-red-100"
                    : ""
                }`}
              >
                {attr.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredStocks.map((stock) => (
            <tr
              key={stock.Id + stock.key + stock.Name}
              className="hover:bg-gray-100"
            >
              {stockAttributes.map((attr) => (
                <td
                  key={attr.label + attr.key}
                  className={`py-2 px-4 border-b text-black font-bold text-right`}
                  //   ${
                  //   attr.isChange
                  //     ? Number(attr.value(stock)) < 0
                  //       ? "text-red-500"
                  //       : Number(attr.value(stock)) > 0
                  //       ? "text-green-500"
                  //       : ""
                  //     : ""
                  // }`}
                >
                  {/* {attr.isChange ? (attr.isPercentage ? " % " : " ج ") : ""} */}
                  {attr.value(stock, getUserStocks)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
