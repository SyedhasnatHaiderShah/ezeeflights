import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { NotificationService } from "../modules/notification/services/notification.service";
import * as dotenv from "dotenv";
import * as path from "path";

// Load dotenv from the backend directory to access SMTP credentials
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function run() {
  const emailArg = process.argv[2] || "uaf.khurram@gmail.com";

  console.log(
    "======================================================================",
  );
  console.log(
    "🚀 Bootstrapping NestJS Application Context for Welcome Email Test...",
  );
  console.log(
    "======================================================================",
  );

  let app;
  try {
    app = await NestFactory.createApplicationContext(AppModule, {
      logger: ["error", "warn", "log"],
    });
  } catch (err: any) {
    console.error(
      "❌ Failed to bootstrap NestJS application context:",
      err.message,
    );
    process.exit(1);
  }

  const notificationService = app.get(NotificationService);

  console.log(`\n✉️ Sending test welcome email:`);
  console.log(`   - Recipient: ${emailArg}\n`);

  try {
    const userId = "df09c6c7-acca-4b62-ad96-2128cd24cb5d"; // Mock/Test User ID
    const notification = await notificationService.triggerWelcome(
      userId,
      emailArg,
    );

    if (notification) {
      console.log(
        `✅ Welcome notification created in DB with ID: ${notification.id}`,
      );
      console.log(
        "⏳ Waiting 15 seconds for background in-memory queue to dispatch the email...",
      );
      await new Promise((resolve) => setTimeout(resolve, 15000));
      console.log("🎉 Welcome email test script run finished.");
    } else {
      console.error("❌ Welcome notification creation returned null.");
    }
  } catch (err: any) {
    console.error(
      "❌ Failed to send welcome notification:",
      err.message || err,
    );
  } finally {
    try {
      await app.close();
    } catch {}
    console.log(
      "======================================================================",
    );
    process.exit(0);
  }
}

run();
