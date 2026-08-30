import { loadBackendEnv } from "./config/load-env";
loadBackendEnv();
// Sentry MUST be imported after env load — required for v10+ auto-instrumentation
import "./instrument";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { Logger } from "nestjs-pino";
import * as cookieParser from "cookie-parser";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  // On AWS ALB/Nginx: trust exactly 1 hop so X-Forwarded-For is read correctly
  // but cannot be spoofed by arbitrary clients setting extra hops.
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set("trust proxy", 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );
  app.use(cookieParser());

  app.use((req: any, _res: any, next: any) => {
    const origin =
      req.headers["origin"] ||
      req.headers["x-frontend-origin"] ||
      "no-origin (server/crawler)";
    const referer = req.headers["referer"] || "none";
    const userAgent = (req.headers["user-agent"] || "").toLowerCase();

    // Check if the request is related to search, flights, jetcost, or metasearch headers/agents
    const isSearchOrMetasearch =
      req.url.toLowerCase().includes("/api/flights/search") ||
      req.url.toLowerCase().includes("search") ||
      req.url.toLowerCase().includes("flight") ||
      req.url.toLowerCase().includes("jetcost") ||
      req.url.toLowerCase().includes("deeplink") ||
      userAgent.includes("jetcost") ||
      userAgent.includes("crawler") ||
      userAgent.includes("guzzle") ||
      req.headers["jetcost"] !== undefined;

    if (isSearchOrMetasearch) {
      console.log(
        `[Network Trace 👁️] ${req.method} ${req.url} | Origin: "${origin}" | Referer: "${referer}" | User-Agent: "${req.headers["user-agent"] || "unknown"}" | IP: "${req.ip}"`,
      );
    }
    next();
  });

  const frontendOrigin = process.env.FRONTEND_ORIGIN ?? "http://localhost:3000";
  const allowedOrigins = frontendOrigin.split(",").map((o) => o.trim());

  const extraOrigins = [
    "http://localhost:3000",
    "https://ezeeflights.com",
    "https://www.ezeeflights.com",
    "http://fareshoppe.com",
    "https://fareshoppe.com",
    "http://www.fareshoppe.com",
    "https://www.fareshoppe.com",
    "http://localhost",
    "capacitor://localhost",
    "http://192.168.100.67",
    "http://192.168.100.67:3000",
  ];

  extraOrigins.forEach((origin) => {
    if (!allowedOrigins.includes(origin)) {
      allowedOrigins.push(origin);
    }
  });

  app.enableCors({
    origin: (origin, callback) => {
      if (process.env.CORS_ALLOW_ALL === "true") {
        callback(null, true);
        return;
      }
      if (!origin) {
        callback(null, true);
        return;
      }
      const isAllowed =
        allowedOrigins.includes("*") ||
        allowedOrigins.includes(origin) ||
        origin.includes("jetcost.") ||
        origin.endsWith(".jetcost.com") ||
        origin.endsWith(".fareshoppe.com") ||
        origin.endsWith(".ezeeflights.com") ||
        origin.endsWith(".ezeeflights.online") ||
        origin === "http://fareshoppe.com" ||
        origin === "https://fareshoppe.com" ||
        origin === "http://ezeeflights.com" ||
        origin === "https://ezeeflights.com" ||
        origin === "http://ezeeflights.online" ||
        origin === "https://ezeeflights.online" ||
        /^http:\/\/10\.0\.2\.2(:\d+)?$/.test(origin) ||
        /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin);

      if (!isAllowed) {
        console.warn(`[CORS Blocked] Origin "${origin}" was denied access.`);
      }

      callback(null, isAllowed ? true : false);
    },
    credentials: true,
  });

  app.setGlobalPrefix("api", {
    exclude: ["v1/(.*)", "/"],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Only expose Swagger in non-production environments
  if (process.env.NODE_ENV !== "production") {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("ezeeFlights API")
      .setDescription("AI-powered OTA platform APIs")
      .setVersion("1.0.0")
      .addBearerAuth()
      .addApiKey(
        {
          type: "apiKey",
          in: "header",
          name: "x-correlation-id",
          description: "Optional correlation ID for request tracing",
        },
        "correlation-id",
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("docs", app, document);
  }

  const port = process.env.PORT ?? 4000;
  await app.listen(port, "0.0.0.0");
  app
    .get(Logger)
    .log(`Listening on all interfaces (0.0.0.0) at port ${port}`, "Bootstrap");
}

bootstrap();
