export type ClimateData = {
  month: string;
  temp: number;
  rainfall: number;
  crowd: "Low" | "Medium" | "High";
};

export type DestinationInsight = {
  id: string;
  name: string;
  country: string;
  visa: {
    type: string;
    description: string;
    validity: string;
  };
  health: {
    vaccinations: string[];
    advisories: string;
    alert?: string;
  };
  practical: {
    currency: string;
    exchangeRate: string;
    language: string;
    religion: string;
    connectivity: string;
    simCost: string;
    emergency: {
      police: string;
      medical: string;
      embassy: string;
    };
  };
  costs: {
    meals: string;
    accommodation: string;
    transport: string;
    dailyTotal: string;
    tipping: string;
  };
  climate: ClimateData[];
};

export const mockInsights: Record<string, DestinationInsight> = {
  "dubai": {
    id: "dubai",
    name: "Dubai",
    country: "United Arab Emirates",
    visa: {
      type: "Visa on Arrival / e-Visa",
      description: "Free 30-day visa on arrival for many nationalities. e-Visa required for others.",
      validity: "30-90 Days"
    },
    health: {
      vaccinations: ["Routine vaccines recommended", "Hepatitis A/B potentially recommended"],
      advisories: "Generally safe. Stay hydrated during peak summer months.",
      alert: "Extreme heat advisory from June to September."
    },
    practical: {
      currency: "UAE Dirham (AED)",
      exchangeRate: "1 USD = 3.67 AED",
      language: "Arabic (Official), English (Widely spoken)",
      religion: "Islam (Official)",
      connectivity: "5G widely available. Du/Etisalat tourist SIMs available at airport.",
      simCost: "Starting from 49 AED (~$13)",
      emergency: {
        police: "999",
        medical: "998",
        embassy: "+971-4-XXXXXXX"
      }
    },
    costs: {
      meals: "AED 100 - 300 / day",
      accommodation: "AED 400 - 1500 / night",
      transport: "AED 30 - 100 / day (Metro/Taxi)",
      dailyTotal: "AED 600 - 2000",
      tipping: "10-15% expected in restaurants if not included."
    },
    climate: [
      { month: "Jan", temp: 19, rainfall: 10, crowd: "High" },
      { month: "Mar", temp: 23, rainfall: 15, crowd: "High" },
      { month: "May", temp: 31, rainfall: 0, crowd: "Medium" },
      { month: "Jul", temp: 36, rainfall: 0, crowd: "Low" },
      { month: "Sep", temp: 33, rainfall: 0, crowd: "Low" },
      { month: "Nov", temp: 25, rainfall: 5, crowd: "High" },
    ]
  }
};

export const comparisonData = {
  params: [
    "Entry Ease", "Health Safety", "Cost of Living", "Connectivity", 
    "Transport Ease", "Nightlife", "Family Friendly", "Nature", 
    "Culture", "Weather (Current)"
  ],
  scores: {
    "Dubai": [9, 10, 4, 10, 9, 8, 9, 5, 7, 6],
    "Bali": [8, 7, 9, 7, 6, 9, 7, 10, 9, 8]
  }
};
