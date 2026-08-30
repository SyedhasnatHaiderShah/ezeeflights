import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { buildDestinationInsightsPrompt } from "../prompts/destination-insights.prompt";
import { buildCityInsightsPrompt } from "../prompts/city-insights.prompt";

@Injectable()
export class OpenaiService {
  private readonly logger = new Logger(OpenaiService.name);

  constructor(private configService: ConfigService) {}

  private get openAiKey(): string | undefined {
    let key = this.configService.get<string>("OPENAI_API_KEY") || process.env.OPENAI_API_KEY;
    
    // Fallback: Manually extract from .env if dotenv fails on Windows
    if (!key) {
      try {
        const fs = require('fs');
        const envContent = fs.readFileSync(process.cwd() + '/.env', 'utf8');
        const match = envContent.match(/^OPENAI_API_KEY=([^\r\n]+)/m);
        if (match && match[1]) {
          key = match[1].trim();
        }
      } catch (e) {
        // Ignore
      }
    }
    
    return key;
  }

  isConfigured(): boolean {
    return !!this.openAiKey;
  }

  async extractBookingData(prompt: string): Promise<any> {
    if (!this.isConfigured()) {
      return {
        status: "incomplete",
        question: "OpenAI API key is not configured on the server. Please check your environment variables.",
        data: {},
        _debug_error: "OPENAI_API_KEY is missing",
      };
    }

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const dayName = now.toLocaleDateString("en-US", { weekday: "long" });

    const systemPrompt = `
      You are an expert travel assistant for EzeeFlights.
      Extract booking information from: "${prompt}"
      Determine if the user is looking for a FLIGHT or a HOTEL.
      Current Date: ${today} (${dayName})

      CRITICAL: Use 3-letter IATA codes for airports/cities (e.g., 'LHE' for Lahore, 'DXB' for Dubai, 'LHR' for London).
      If the user says a city name, you MUST convert it to its main IATA code.

      JSON Fields for FLIGHTS:
      - searchType: "flight"
      - from: Departure IATA code (3 letters)
      - to: Destination IATA code (3 letters)
      - departureDate: YYYY-MM-DD
      - returnDate: YYYY-MM-DD (or null)
      - adults: number (default 1)
      - children: number (default 0)
      - infants: number (default 0)
      - cabinClass: "Economy" | "Business" | "First"
      - tripType: "oneway" | "roundtrip"

      JSON Fields for HOTELS:
      - searchType: "hotel"
      - destination: Destination IATA code (3 letters)
      - checkInDate: YYYY-MM-DD
      - checkOutDate: YYYY-MM-DD
      - guests: number (default 1)
      - rooms: number (default 1)

      Rules:
      - For flights: If 'from' or 'to' is missing, set "status": "incomplete" and ask a follow-up question. If 'departureDate' is missing or not specified, calculate and set 'departureDate' to 7 days from Current Date (YYYY-MM-DD) and set "status": "complete".
      - For hotels: If 'destination' is missing, set "status": "incomplete" and ask a follow-up question. If 'checkInDate' is missing, set 'checkInDate' to 7 days from Current Date and 'checkOutDate' to 8 days from Current Date, and set "status": "complete".
      - Otherwise, set "status": "complete".
      - Return ONLY raw JSON.
    `;

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.openAiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: prompt },
            ],
            response_format: { type: "json_object" },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `OpenAI API failed: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      return JSON.parse(content);
    } catch (error: any) {
      this.logger.error(`OpenAI Error: ${error.message}`);
      return {
        status: "incomplete",
        question:
          "AI assistant is temporarily busy. Please try again in a moment.",
        data: {},
        _debug_error: `OpenAI: ${error.message}`,
      };
    }
  }

  async getDestinationInsights(destination: string): Promise<any> {
    if (!this.isConfigured()) {
      return null;
    }

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const monthName = now.toLocaleString("en-US", { month: "long" });

    const systemPrompt = buildDestinationInsightsPrompt(
      destination,
      today,
      monthName,
    );

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.openAiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `Generate insights for ${destination}` },
            ],
            response_format: { type: "json_object" },
            max_tokens: 900,
            temperature: 0.4,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `OpenAI API failed: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      return JSON.parse(content);
    } catch (error: any) {
      this.logger.error(
        `OpenAI Insights Error for ${destination}: ${error.message}`,
      );
      return null;
    }
  }

  async getCityInsights(cityName: string): Promise<any> {
    if (!this.isConfigured()) {
      return null;
    }

    const today = new Date().toISOString().split("T")[0];
    const systemPrompt = buildCityInsightsPrompt(cityName, today);

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.openAiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `Generate city insights for ${cityName}` },
            ],
            response_format: { type: "json_object" },
            max_tokens: 2500,
            temperature: 0.4,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `OpenAI API failed: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      return JSON.parse(content);
    } catch (error: any) {
      this.logger.error(
        `OpenAI City Insights Error for ${cityName}: ${error.message}`,
      );
      return null;
    }
  }
}
