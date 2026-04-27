import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance } from "axios";

@Injectable()
export class TravelportBookingService {
  private readonly logger = new Logger(TravelportBookingService.name);
  private readonly client: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(private readonly configService: ConfigService) {
    const baseURL = this.configService.get<string>(
      "TRAVELPORT_API_URL",
      "https://api.travelport.com",
    );
    this.client = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
  }

  private async ensureToken(): Promise<string> {
    const now = Date.now();
    if (this.accessToken && now < this.tokenExpiry) {
      return this.accessToken;
    }

    const clientId = this.configService.get<string>("TRAVELPORT_CLIENT_ID");
    const clientSecret = this.configService.get<string>(
      "TRAVELPORT_CLIENT_SECRET",
    );

    if (!clientId || !clientSecret) {
      throw new InternalServerErrorException(
        "Travelport credentials (CLIENT_ID/SECRET) are missing in environment variables",
      );
    }

    try {
      const response = await axios.post(
        `${this.client.defaults.baseURL}/v1/oauth/token`,
        new URLSearchParams({
          grant_type: "client_credentials",
          client_id: clientId!,
          client_secret: clientSecret!,
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = now + response.data.expires_in * 1000 - 60000; // 1 min buffer
      return this.accessToken!;
    } catch (error: any) {
      this.logger.error(
        "Failed to get Travelport access token",
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        "Failed to authenticate with Travelport",
      );
    }
  }

  async createWorkbench(): Promise<string> {
    const token = await this.ensureToken();
    try {
      const response = await this.client.post(
        "/v1/flights/booking/workbench",
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data.WorkbenchIdentifier.Identifier.value;
    } catch (error: any) {
      this.logger.error(
        "Failed to create workbench",
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        "Travelport: Failed to create booking session",
      );
    }
  }

  async addOffer(workbenchId: string, offerId: string): Promise<any> {
    const token = await this.ensureToken();
    const payload = {
      OfferIdentifier: {
        Identifier: {
          value: offerId,
        },
      },
    };

    try {
      const response = await this.client.post(
        `/v1/flights/booking/workbench/${workbenchId}/offer`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Failed to add offer ${offerId} to workbench ${workbenchId}`,
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        "Travelport: Failed to add flight offer",
      );
    }
  }

  async addTravelers(workbenchId: string, passengers: any[]): Promise<any> {
    const token = await this.ensureToken();
    const payload = {
      Traveler: passengers.map((p, index) => ({
        "@type": "Traveler",
        id: `traveler_${index + 1}`,
        PersonName: {
          "@type": "PersonName",
          Given: p.fullName?.split(" ")[0] || "Unknown",
          Surname: p.fullName?.split(" ").slice(1).join(" ") || "Unknown",
        },
        DateOfBirth: p.dob,
        Gender: p.gender === "M" ? "Male" : "Female",
        // Add more traveler details as per Travelport spec
      })),
    };

    try {
      const response = await this.client.post(
        `/v1/flights/booking/workbench/${workbenchId}/traveler`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Failed to add travelers to workbench ${workbenchId}`,
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        "Travelport: Failed to add traveler information",
      );
    }
  }

  async commitWorkbench(workbenchId: string): Promise<any> {
    const token = await this.ensureToken();
    try {
      const response = await this.client.post(
        `/v1/flights/booking/workbench/${workbenchId}/commit`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      // The commit response returns the reservation locator (PNR)
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Failed to commit workbench ${workbenchId}`,
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        "Travelport: Failed to finalize booking hold",
      );
    }
  }

  async postCommitWorkbench(locator: string): Promise<string> {
    const token = await this.ensureToken();
    try {
      const response = await this.client.post(
        "/v1/flights/booking/workbench",
        { ReservationIdentifier: { Identifier: { value: locator } } },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data.WorkbenchIdentifier.Identifier.value;
    } catch (error: any) {
      this.logger.error(
        `Failed to create post-commit workbench for ${locator}`,
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        "Travelport: Failed to re-open booking for ticketing",
      );
    }
  }
}
