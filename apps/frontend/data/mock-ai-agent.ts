export type MessageType = "text" | "flight_card" | "budget_table" | "doc_alert" | "qa_card";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  type: MessageType;
  metadata?: any;
}

export const processAIPrompt = async (prompt: string, language: string = "English"): Promise<Message> => {
  const p = prompt.toLowerCase();
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  if (p.includes("london") || p.includes("flight")) {
    return {
      id: Math.random().toString(),
      role: "assistant",
      content: "I found a few great options for your return trip to London in December. The best value is with British Airways.",
      type: "flight_card",
      metadata: {
        airline: "British Airways",
        price: "2,850",
        currency: "AED",
        dates: "Dec 12 - Dec 19",
        route: "DXB -> LHR"
      }
    };
  }

  if (p.includes("hospital") || p.includes("bangkok")) {
    return {
      id: Math.random().toString(),
      role: "assistant",
      content: "The nearest highly-rated hospital to your current hotel in Bangkok is Bumrungrad International Hospital.",
      type: "qa_card",
      metadata: {
        name: "Bumrungrad International Hospital",
        distance: "1.2 km",
        rating: "4.8",
        phone: "+66 2 066 8888"
      }
    };
  }

  if (p.includes("budget") || p.includes("cost")) {
    return {
      id: Math.random().toString(),
      role: "assistant",
      content: "Here is a estimated budget breakdown for your 7-day trip to Paris.",
      type: "budget_table",
      metadata: {
        items: [
          { category: "Flights", cost: "3,200" },
          { category: "Accommodation", cost: "4,500" },
          { category: "Meals", cost: "2,100" },
          { category: "Attractions", cost: "1,200" },
          { category: "Total", cost: "11,000" }
        ],
        currency: "AED"
      }
    };
  }

  if (p.includes("passport") || p.includes("document")) {
    return {
      id: Math.random().toString(),
      role: "assistant",
      content: "I've reviewed your travel documents. Your passport is valid, but you should take note of the following:",
      type: "doc_alert",
      metadata: {
        title: "Passport Expiry Warning",
        message: "Your passport expires in less than 6 months. Some countries (like Thailand) may deny entry.",
        severity: "warning"
      }
    };
  }

  // Default response
  return {
    id: Math.random().toString(),
    role: "assistant",
    content: language === "Arabic" 
      ? "أنا مساعدك الذكي للسفر. كيف يمكنني مساعدتك اليوم؟" 
      : "I'm your AI Travel Agent. I can help you book flights, check documents, or plan your trip budget. What's on your mind?",
    type: "text"
  };
};
