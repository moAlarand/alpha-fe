import { StockTechnicalStatusTranslate } from "./stockAttributes";
import { Stock, Technical } from "./types";

export const sendNotification = async (
  stock: Stock,
  newRecommend: Technical
) => {
  await Notification.requestPermission().then((result) => {
    if (result === "granted") {
      const notification = new Notification("تنبيه هااااام", {
        body: `السهم: ${stock.Name}\n الرمز: ${stock.Symbol} -- العدد: ${stock.amount}\n المقترح: ${StockTechnicalStatusTranslate[newRecommend]} -- \n`,
        icon: "../images/alpha.webp",
      });
      // Add a click event listener to the notification
      notification.onclick = async () => {
        await navigator.clipboard.writeText(`${stock.Symbol}`);
        // Open your app's URL or desired route when the notification is clicked
        window.open("https://web.thndr.app/ar/invest", "_blank"); // Change to your app's URL
      };
    }
  });
};
