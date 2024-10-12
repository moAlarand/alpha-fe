"use client";
import { useEffect, useState } from "react";
import alphaLogo from "./images/alpha.webp";
import { Stock } from "./types";
import Image from "next/image";
import { stockAttributes } from "./stockAttributes";
import { getEGXAllStockData } from "./api";

export default function Home() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Function to fetch stock data
  const fetchStockData = async () => {
    const data: Stock[] = await getEGXAllStockData();
    setStocks(data);
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

  // Reset filter and sorting
  const handleReset = () => {
    setSearch("");
    setSortBy(null);
    setSortDirection("asc");
    setFilteredStocks(stocks); // Reset filtered stocks to the full list
  };

  return (
    <div
      className="container mx-auto p-4 bg-white border text-black  overflow-x-auto"
      dir="rtl"
    >
      <div className="flex justify-center ">
        <div className="flex justify-center">
          <h3 className="text-4xl font-bold text-right">السوق المصري </h3>
        </div>
        <Image src={alphaLogo} alt="Alpha Logo" className="h-40 w-40" />
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
                key={attr.label}
                onClick={() => handleSort(attr.key as keyof Stock)}
                className={`py-2 px-4 border-b text-gray-700 text-right cursor-pointer ${
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
            <tr key={stock.Id} className="hover:bg-gray-100">
              {stockAttributes.map((attr) => (
                <td
                  key={attr.label}
                  className={`py-2 px-4 border-b text-black font-bold text-right ${
                    attr.isChange
                      ? Number(attr.value(stock)) < 0
                        ? "text-red-500"
                        : Number(attr.value(stock)) > 0
                        ? "text-green-500"
                        : ""
                      : ""
                  }`}
                >
                  {attr.isChange ? (attr.isPercentage ? " % " : " ج ") : ""}
                  {attr.value(stock)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
