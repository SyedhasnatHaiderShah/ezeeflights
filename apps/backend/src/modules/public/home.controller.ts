import { Controller, Get, Query } from "@nestjs/common";
import { HomeService } from "./home.service";

@Controller("home")
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get("top-destinations")
  getTopDestinations(@Query("limit") limit?: string) {
    return this.homeService.getTopDestinations(limit ? parseInt(limit, 10) : 10);
  }

  @Get("flight-deals")
  getFlightDeals(@Query("limit") limit?: string) {
    return this.homeService.getFlightDeals(limit ? parseInt(limit, 10) : 8);
  }

  @Get("popular-packages")
  getPopularPackages(@Query("limit") limit?: string) {
    return this.homeService.getPopularPackages(limit ? parseInt(limit, 10) : 4);
  }
}
