import { Module, OnModuleInit, Logger } from "@nestjs/common";
import { PublicAirlinesController } from "./public-airlines.controller";
import { CurrencyController } from "./currency.controller";
import { PublicAirlinesService } from "./public-airlines.service";
import { CurrencyService } from "./currency.service";
import { HomeController } from "./home.controller";
import { HomeService } from "./home.service";

@Module({
  imports: [],
  controllers: [PublicAirlinesController, CurrencyController, HomeController],
  providers: [PublicAirlinesService, CurrencyService, HomeService],
  exports: [CurrencyService],
})
export class PublicModule implements OnModuleInit {
  onModuleInit() {
    Logger.log("PublicModule initialized", "PublicModule");
  }
}
