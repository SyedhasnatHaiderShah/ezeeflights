import { Response } from "express";
import * as fs from "fs";
import * as path from "path";
import { Controller, Get, Res } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Debug")
@Controller({ path: "debug", version: "1" })
export class DebugController {
  private readonly logDir = path.join(
    process.cwd(),
    "logs",
    "travelport_responses",
  );

  @ApiOperation({
    summary: "Latest Travelport SOAP request (payload.xml) — paste into Postman",
  })
  @ApiResponse({ status: 200, description: "Raw SOAP request XML" })
  @Get("travelport-payload")
  getPayload(@Res() res: Response): void {
    this.sendFile(res, "payload.xml");
  }

  @ApiOperation({
    summary: "Latest Travelport SOAP server response (server-response.xml)",
  })
  @ApiResponse({ status: 200, description: "Raw SOAP response XML" })
  @Get("travelport-response")
  getResponse(@Res() res: Response): void {
    this.sendFile(res, "server-response.xml");
  }

  @ApiOperation({
    summary: "Parsed flight results from last search (parsed-results.json)",
  })
  @ApiResponse({ status: 200, description: "JSON array" })
  @Get("parsed-results")
  getParsedResults(@Res() res: Response): void {
    this.sendFile(res, "parsed-results.json");
  }

  @ApiOperation({ summary: "List all saved Travelport log files" })
  @Get("travelport-logs")
  getLogs(): { files: string[] } {
    if (!fs.existsSync(this.logDir)) return { files: [] };
    return {
      files: fs
        .readdirSync(this.logDir)
        .filter((f) => f.endsWith(".xml") || f.endsWith(".json"))
        .sort()
        .reverse(),
    };
  }

  private sendFile(res: Response, filename: string): void {
    const file = path.join(this.logDir, filename);
    if (!fs.existsSync(file)) {
      res.status(404).json({ error: `${filename} not found — run a flight search first` });
      return;
    }
    const isJson = filename.endsWith(".json");
    res.set("Content-Type", isJson ? "application/json; charset=utf-8" : "application/xml; charset=utf-8");
    res.send(fs.readFileSync(file, "utf8"));
  }
}
