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
  },
  "abu-dhabi": {
    id: "abu-dhabi",
    name: "Abu Dhabi",
    country: "United Arab Emirates",
    visa: {
      type: "Visa on Arrival / e-Visa",
      description: "Free 30-day visa on arrival for many nationalities. e-Visa required for others.",
      validity: "30-90 Days"
    },
    health: {
      vaccinations: ["Routine vaccines recommended", "Hepatitis A/B potentially recommended"],
      advisories: "Generally safe. Dress conservatively in heritage areas.",
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
        embassy: "+971-2-XXXXXXX"
      }
    },
    costs: {
      meals: "AED 80 - 250 / day",
      accommodation: "AED 300 - 1200 / night",
      transport: "AED 25 - 80 / day",
      dailyTotal: "AED 500 - 1600",
      tipping: "10-15% expected in restaurants."
    },
    climate: [
      { month: "Jan", temp: 18, rainfall: 10, crowd: "High" },
      { month: "Mar", temp: 22, rainfall: 15, crowd: "High" },
      { month: "May", temp: 30, rainfall: 0, crowd: "Medium" },
      { month: "Jul", temp: 35, rainfall: 0, crowd: "Low" },
      { month: "Sep", temp: 32, rainfall: 0, crowd: "Low" },
      { month: "Nov", temp: 24, rainfall: 5, crowd: "High" },
    ]
  },
  "paris": {
    id: "paris",
    name: "Paris",
    country: "France",
    visa: {
      type: "Schengen Visa",
      description: "Many nationalities qualify for 90-day visa-free entry. Others require a Schengen Visa prior to arrival.",
      validity: "90 Days"
    },
    health: {
      vaccinations: ["Routine vaccines recommended"],
      advisories: "Stay alert for pickpocketing in crowded tourist areas and metro stations.",
      alert: "Heavy tourism traffic expected; pre-book all museum passes."
    },
    practical: {
      currency: "Euro (EUR)",
      exchangeRate: "1 USD = 0.92 EUR",
      language: "French (Official)",
      religion: "Christianity (Predominant)",
      connectivity: "5G widely available. High-speed Orange/SFR SIM cards available locally.",
      simCost: "Starting from €20 (~$22)",
      emergency: {
        police: "17 (or 112)",
        medical: "15 (or 112)",
        embassy: "+33-1-XXXXXXX"
      }
    },
    costs: {
      meals: "€40 - €120 / day",
      accommodation: "€100 - €350 / night",
      transport: "€8 - €25 / day (Metro/RER)",
      dailyTotal: "€180 - €600",
      tipping: "Service is included (service compris); rounding up by a few Euros is customary for good service."
    },
    climate: [
      { month: "Jan", temp: 6, rainfall: 50, crowd: "Low" },
      { month: "Mar", temp: 10, rainfall: 45, crowd: "Medium" },
      { month: "May", temp: 16, rainfall: 60, crowd: "High" },
      { month: "Jul", temp: 21, rainfall: 55, crowd: "High" },
      { month: "Sep", temp: 17, rainfall: 50, crowd: "High" },
      { month: "Nov", temp: 9, rainfall: 55, crowd: "Low" },
    ]
  },
  "lyon": {
    id: "lyon",
    name: "Lyon",
    country: "France",
    visa: {
      type: "Schengen Visa",
      description: "Standard Schengen zone entry requirements match other parts of France.",
      validity: "90 Days"
    },
    health: {
      vaccinations: ["Routine vaccines recommended"],
      advisories: "Very safe destination. Keep standard precautions in public transit hubs.",
      alert: "Warm summer peak temperatures in July/August."
    },
    practical: {
      currency: "Euro (EUR)",
      exchangeRate: "1 USD = 0.92 EUR",
      language: "French (Official)",
      religion: "Christianity (Predominant)",
      connectivity: "Excellent 5G coverage across town.",
      simCost: "Starting from €20 (~$22)",
      emergency: {
        police: "17 (or 112)",
        medical: "15 (or 112)",
        embassy: "+33-4-XXXXXXX"
      }
    },
    costs: {
      meals: "€30 - €90 / day",
      accommodation: "€80 - €220 / night",
      transport: "€6 - €18 / day (TCL metro/trams)",
      dailyTotal: "€130 - €400",
      tipping: "Included in service. Rounding up slightly is appreciated."
    },
    climate: [
      { month: "Jan", temp: 4, rainfall: 50, crowd: "Low" },
      { month: "Mar", temp: 9, rainfall: 50, crowd: "Medium" },
      { month: "May", temp: 15, rainfall: 75, crowd: "Medium" },
      { month: "Jul", temp: 22, rainfall: 60, crowd: "High" },
      { month: "Sep", temp: 17, rainfall: 70, crowd: "Medium" },
      { month: "Nov", temp: 7, rainfall: 65, crowd: "Low" },
    ]
  },
  "bangkok": {
    id: "bangkok",
    name: "Bangkok",
    country: "Thailand",
    visa: {
      type: "Visa-Free / Visa on Arrival",
      description: "60-day visa exemption for citizens of over 90 countries. Visa on arrival available for others.",
      validity: "30-60 Days"
    },
    health: {
      vaccinations: ["Routine vaccines", "Hepatitis A/B recommended", "Typhoid recommended"],
      advisories: "Only drink bottled water. Use insect repellent to guard against dengue.",
      alert: "Monsoon season brings heavy tropical rain from June to October."
    },
    practical: {
      currency: "Thai Baht (THB)",
      exchangeRate: "1 USD = 36.5 THB",
      language: "Thai (Official), English (Tourist areas)",
      religion: "Buddhism (Predominant)",
      connectivity: "High-speed 5G. Highly affordable tourist SIMs available at AIS/TrueMove kiosks.",
      simCost: "Starting from 299 THB (~$8)",
      emergency: {
        police: "191 (Tourist Police: 1155)",
        medical: "1669",
        embassy: "+66-2-XXXXXXX"
      }
    },
    costs: {
      meals: "300 THB - 1200 THB / day",
      accommodation: "800 THB - 4000 THB / night",
      transport: "150 THB - 400 THB / day (BTS SkyTrain/Taxis/Tuk-tuks)",
      dailyTotal: "1500 THB - 6000 THB",
      tipping: "Not traditional, but leaving small change or 10% in tourist spots is welcome."
    },
    climate: [
      { month: "Jan", temp: 27, rainfall: 10, crowd: "High" },
      { month: "Mar", temp: 30, rainfall: 30, crowd: "Medium" },
      { month: "May", temp: 30, rainfall: 180, crowd: "Low" },
      { month: "Jul", temp: 29, rainfall: 170, crowd: "Low" },
      { month: "Sep", temp: 28, rainfall: 330, crowd: "Low" },
      { month: "Nov", temp: 27, rainfall: 50, crowd: "High" },
    ]
  },
  "phuket": {
    id: "phuket",
    name: "Phuket",
    country: "Thailand",
    visa: {
      type: "Visa-Free / Visa on Arrival",
      description: "60-day visa exemption matches other entry ports in Thailand.",
      validity: "30-60 Days"
    },
    health: {
      vaccinations: ["Routine vaccines", "Hepatitis A/B recommended"],
      advisories: "Observe beach warning flags (Red flags mean no swimming). Drink bottled water.",
      alert: "Monsoon sea swells from May to October."
    },
    practical: {
      currency: "Thai Baht (THB)",
      exchangeRate: "1 USD = 36.5 THB",
      language: "Thai (Official), English (Widely spoken)",
      religion: "Buddhism (Predominant)",
      connectivity: "5G widely coverage. AIS/True tourist SIM cards easily found.",
      simCost: "Starting from 299 THB (~$8)",
      emergency: {
        police: "191 (Tourist Police: 1155)",
        medical: "1669",
        embassy: "+66-76-XXXXXXX"
      }
    },
    costs: {
      meals: "400 THB - 1500 THB / day",
      accommodation: "1200 THB - 6000 THB / night",
      transport: "200 THB - 600 THB / day (Taxis/Local buses)",
      dailyTotal: "2000 THB - 9000 THB",
      tipping: "10% is customary in mid-to-high scale restaurants."
    },
    climate: [
      { month: "Jan", temp: 28, rainfall: 30, crowd: "High" },
      { month: "Mar", temp: 29, rainfall: 75, crowd: "Medium" },
      { month: "May", temp: 29, rainfall: 320, crowd: "Low" },
      { month: "Jul", temp: 28, rainfall: 280, crowd: "Low" },
      { month: "Sep", temp: 27, rainfall: 400, crowd: "Low" },
      { month: "Nov", temp: 27, rainfall: 200, crowd: "High" },
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
