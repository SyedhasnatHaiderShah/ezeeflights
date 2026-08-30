import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildDestinationInsightsPrompt } from "../prompts/destination-insights.prompt";
import { buildCityInsightsPrompt } from "../prompts/city-insights.prompt";

@Injectable()
export class GeminiService implements OnModuleInit {
  private readonly logger = new Logger(GeminiService.name);
  private genAI!: GoogleGenerativeAI;
  private model!: any;
  private initialized = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.initializeModel();
  }

  private async initializeModel() {
    const apiKey = this.configService.get<string>("GOOGLE_GEMINI_API_KEY");
    if (!apiKey) {
      this.logger.warn(
        "GOOGLE_GEMINI_API_KEY is missing. AI features disabled.",
      );
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);

      // Try to discover the best working model for this specific key
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      );
      const data = await response.json();

      let workingModelName = "gemini-1.5-flash"; // Default fallback

      if (data.models && data.models.length > 0) {
        // Prioritize 2.0 family as requested by the user
        const preferredModels = [
          "gemini-3.0-flash",
          "gemini-2.5-flash",
          "gemini-2.0-flash",
          "gemini-2.0-flash-exp",
          "gemini-2.0-flash-lite-preview",
          "gemini-1.5-flash",
          "gemini-1.5-pro",
          "gemini-pro",
        ];

        let discoveredModel = null;
        for (const name of preferredModels) {
          discoveredModel = data.models.find((m: any) => m.name.includes(name));
          if (discoveredModel) break;
        }

        if (discoveredModel) {
          workingModelName = discoveredModel.name.split("/").pop();
          this.logger.log(`Discovered best model: ${workingModelName}`);
        }
      } else {
        this.logger.warn(
          "No models discovered via API. Using hardcoded fallback.",
        );
      }

      this.model = this.genAI.getGenerativeModel({ model: workingModelName });
      this.initialized = true;
      this.logger.log(
        `Gemini Service initialized with model: ${workingModelName}`,
      );
    } catch (err: any) {
      this.logger.error(
        `Model discovery failed: ${err.message}. Falling back to default.`,
      );
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      this.initialized = true;
    }
  }

  async extractBookingData(prompt: string): Promise<any> {
    if (!this.initialized || !this.model) {
      return {
        status: "incomplete",
        question:
          "Gemini AI is still initializing or API key is invalid. Please check backend logs.",
        data: {},
        _debug_error: "Gemini service not initialized",
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
      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error("No JSON found in AI response");
    } catch (error: any) {
      this.logger.error(`Gemini Error: ${error.message}`);

      // Handle 503 (Overloaded) or 429 (Rate Limit) or 404 (Not Found)
      const isRetryable =
        error.message.includes("503") ||
        error.message.includes("429") ||
        error.message.includes("404");

      if (isRetryable && !prompt.includes("RETRY_ATTEMPT")) {
        const fallbackModel = "gemini-2.0-flash";
        this.logger.warn(
          `Primary model failed (${error.message}). Retrying with ${fallbackModel}...`,
        );
        this.model = this.genAI.getGenerativeModel({ model: fallbackModel });
        return this.extractBookingData(prompt + " [RETRY_ATTEMPT]");
      }

      // Friendly short message for the UI
      let friendlyMessage = "AI assistant is temporarily busy. Please try again in a moment.";
      if (error.message.includes("API key")) {
        friendlyMessage = "AI service configuration error. Please contact support.";
      }

      return {
        status: "incomplete",
        question: friendlyMessage,
        data: {},
        _debug_error: error.message, // Viewable in Chrome Network tab for debugging
      };
    }
  }

  async getDestinationInsights(destination: string): Promise<any> {
    if (!this.initialized || !this.model) {
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

    return this.generateJsonWithModelFallback(systemPrompt, `destination insights for ${destination}`);
  }

  async getCityInsights(cityName: string): Promise<any> {
    if (!this.initialized || !this.genAI) {
      return null;
    }

    const today = new Date().toISOString().split("T")[0];
    const prompt = buildCityInsightsPrompt(cityName, today);
    return this.generateJsonWithModelFallback(prompt, `city insights for ${cityName}`);
  }

  private async generateJsonWithModelFallback(
    prompt: string,
    context: string,
  ): Promise<any> {
    // 1. Try the discovered / initialized model first
    if (this.initialized && this.model) {
      try {
        const result = await this.model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (error: any) {
        this.logger.warn(
          `Gemini ${context} via default model failed: ${error.message}`,
        );
        const msg = error.message || "";
        const isQuotaOrAuthError =
          msg.includes("429") ||
          msg.includes("quota") ||
          msg.includes("exhausted") ||
          msg.includes("API key");
        if (isQuotaOrAuthError) {
          return null; // Return null immediately to fall back to OpenAI
        }
      }
    }

    // 2. Fall back to other valid models if default model fails or is not initialized
    const fallbackModels = [
      "gemini-2.0-flash",
      "gemini-1.5-flash",
    ];

    for (const modelName of fallbackModels) {
      try {
        const model = this.genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error("No JSON found in AI response");
      } catch (error: any) {
        const msg = error.message || "";
        const isQuotaOrAuthError =
          msg.includes("429") ||
          msg.includes("quota") ||
          msg.includes("exhausted") ||
          msg.includes("API key");
        if (isQuotaOrAuthError) {
          return null; // Return null immediately to fall back to OpenAI
        }

        const isRetryable =
          msg.includes("503") ||
          msg.includes("404");

        this.logger.warn(
          `Gemini ${context} via fallback ${modelName} failed: ${error.message}`,
        );

        if (!isRetryable) {
          break;
        }
      }
    }

    this.logger.error(`Gemini ${context}: all model attempts failed`);
    return null;
  }
}
