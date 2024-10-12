import { Stock } from "./types";

// Fetch Egyptian stock data
export const getEGXAllStockData = async (): Promise<Stock[]> => {
  const url =
    "https://api.investing.com/api/financialdata/assets/equitiesByCountry/default?fields-list=id,name,symbol,isCFD,high,low,last,lastPairDecimal,change,changePercent,volume,time,isOpen,url,flag,countryNameTranslated,exchangeId,performanceDay,performanceWeek,performanceMonth,performanceYtd,performanceYear,performance3Year,technicalHour,technicalDay,technicalWeek,technicalMonth,avgVolume,fundamentalMarketCap,fundamentalRevenue,fundamentalRatio,fundamentalBeta,pairType&country-id=59&filter-domain=&include-additional-indices=false&include-major-indices=false&include-other-indices=false&include-primary-sectors=false&include-market-overview=false";
  const headers = {
    accept: "*/*",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/json",
    "domain-id": "sa",
    priority: "u=1, i",
    "sec-ch-ua":
      '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    "ses-id":
      "MX83dmBvMzs,BemlvYTA4PjVjM241OjM1NDZuZDI3NCIzJzI8YTY0cj4xaiRiYTklN2IxMDQxZ2c1YGZpO28yNjFiN2dgNTM8Pm1pM2FmODI1MTM8NWQzMTQ1bmwyMTQ2M2EyMmEyNGI,BPWozYj85ZjclMS00cGd2NWdmNjt6MnUxPjd2YDAzaD5oaWdhZjhoNWQzPjUzMzU0Zm45MmA0LDN4",
    Referer: "https://sa.investing.com/",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  };

  const data = await fetch(url, { headers }).then((res) => res.json());

  return data.data;
};
