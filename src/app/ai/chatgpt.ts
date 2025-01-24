import { Stock } from "app/stocks/types";
import { OpenAI } from "openai";

// Instantiate OpenAI with the API key
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY as string,
  dangerouslyAllowBrowser: true,
});

/**
 * Generates a recommendation prompt for stock data
 * @param {Stock[]} stocks - Array of stock data
 * @returns {string} - The generated prompt
 */
const generatePrompt = (stocksData: Stock[]): string => {
  const { header, stocks } = normalizeStocksForChatGPT(stocksData);

  return `
You are a highly skilled stock market analyst with extensive knowledge of the Egyptian stock market. Please analyze the following stock data and provide actionable insights.

Tasks:
1. Provide a recommendation for each stock: ("Strong Buy", "Buy", "Hold", "Sell", "Strong Sell").
2. Predict the stock's performance for the next 3 days: ("Up", "Down", "Stable").
3. Indicate your confidence level in your recommendation and forecast as a percentage (e.g., "85%").
4. Calculate the expected profit (or loss) for each stock over the next 3 days as a numeric value representing the change in price (e.g., 5 for an increase of 5 units, -3 for a decrease of 3 units).


Output Format:
- Please return the result as a JSON array formatted exactly as shown below:
\`\`\`json
[
  {
    "Id": "stock_id",
    "AIRecommend": "Strong Buy",
    "Forecast": "Up",
    "Confidence": "85%",
    "ExpectedProfit": 5
  }
]
\`\`\`

**Stock Data Input:**
- Header format:
[ ${JSON.stringify(header)} ]
- Stock values:
 ${JSON.stringify(stocks)}

Please return only the JSON array in your response—no additional explanations, text, or markdown.
`;
};

/**
 * Fetches stock recommendations from ChatGPT in chunks of 50 elements
 * @param {Stock[]} stocks - Array of stock data
 * @returns {Promise<Stock[] | undefined>} - The recommendations or undefined in case of error
 */
export async function getRecommendationFromChatGpt(
  stocks: Stock[]
): Promise<Stock[] | undefined> {
  try {
    // Utility function to interact with ChatGPT
    const _chat = async (prompt: string): Promise<Stock[]> => {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
      });

      const content = response.choices?.[0]?.message?.content?.trim();
      if (!content) throw new Error("Empty response from OpenAI.");

      const cleanedContent = content.replace(/```json|```/g, "").trim();
      const parsed: Stock[] = JSON.parse(cleanedContent);

      if (!Array.isArray(parsed)) {
        throw new Error("Invalid response format. Expected an array.");
      }

      return parsed;
    };

    // Process stocks in chunks of 50
    const chunkSize = 44;
    const chunks = [];
    for (let i = 0; i < stocks.length; i += chunkSize) {
      chunks.push(stocks.slice(i, i + chunkSize));
    }

    // Fetch recommendations for each chunk
    const recommendations: Stock[] = (
      await Promise.all(chunks.map((chunk) => _chat(generatePrompt(chunk))))
    ).flat();
    console.log("🚀 ~ recommendations:", recommendations?.length);

    // Update stocks with AI recommendations
    const updatedStocks = stocks.map((stock) => {
      const matchedRecommendation = recommendations.find(
        (rec) => rec.Id === stock.Id
      );
      return {
        ...stock,
        AIRecommend: matchedRecommendation?.AIRecommend || null,
        Forecast: matchedRecommendation?.Forecast || null,
        Confidence: matchedRecommendation?.Confidence || null,
        ExpectedProfit: matchedRecommendation?.ExpectedProfit || null,
      };
    }) as Stock[];

    // Save to localStorage
    localStorage.setItem("stockRecommendations", JSON.stringify(updatedStocks));

    return updatedStocks;
  } catch (error) {
    console.error("Error fetching recommendations:", error);
  }
}

export const getAIStoredRecommendations = (): Stock[] => {
  const storedRecommendations = localStorage.getItem("stockRecommendations");
  if (storedRecommendations) {
    const recommendations: Stock[] = JSON.parse(storedRecommendations);
    return recommendations;
  }
  return [];
};

// Example function to normalize stock data
function normalizeStocksForChatGPT(stocks: Stock[]) {
  // Extract headers (keys) for the first row
  const header: (keyof Stock)[] = [
    "Id",
    "Name",
    "Symbol",
    "Last",
    "High",
    "Low",
    "Volume",
    "AvgVolume",
    "PerformanceDay",
    "PerformanceWeek",
    "PerformanceMonth",
    "PerformanceYear",
    "PerformanceYtd",
    "FundamentalMarketCap",
    "FundamentalRevenue",
    "FundamentalBeta",
    "Chg",
    "ChgPct",
    "TechnicalDay",
    "TechnicalWeek",
    "TechnicalMonth",
    "TechnicalHour",
  ];

  // Map stocks to arrays based on headers
  const data = stocks.map((stock) => header.map((header) => stock[header]));
  return { header, stocks: data };
}
