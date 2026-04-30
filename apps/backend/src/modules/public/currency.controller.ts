import { Controller, Get, Ip, Req, Logger } from "@nestjs/common";
import { CurrencyService } from "./currency.service";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

@ApiTags("Public")
@Controller("public/currency")
export class CurrencyController {
  private readonly logger = new Logger(CurrencyController.name);

  constructor(private readonly currencyService: CurrencyService) {}

  @Get("rates")
  @ApiOperation({ summary: "Get latest exchange rates relative to USD" })
  async getRates() {
    return this.currencyService.getRates();
  }

  @Get("detect")
  @ApiOperation({ summary: "Detect currency based on user IP" })
  async detect(@Req() req: any) {
    // Try to get real IP from headers if behind proxy
    const forwarded = req.headers["x-forwarded-for"];
    const ip =
      typeof forwarded === "string"
        ? forwarded.split(",")[0]
        : req.socket.remoteAddress;

    this.logger.log(`Detected request IP: ${ip}`);
    return this.currencyService.detectCurrency(ip);
  }
}
