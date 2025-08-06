import { NestFactory } from "@nestjs/core";
import { AppModule } from "./src/app.module";
import { ValidationPipe } from "@nestjs/common";
import * as dotenv from "dotenv";
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Disable default body parser
  });

  // Configure validation pipe for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Configure custom body parser with larger limits
  const express = require("express");
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  // Enable CORS for frontend communication and WebSocket connections
  app.enableCors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "*",
    ], // Allow all origins for WebSocket testing
    credentials: true,
  });

  // Listen on all interfaces (0.0.0.0) so external devices can connect
  await app.listen(3000, "0.0.0.0");

  console.log("Backend server started on http://0.0.0.0:3000");
  console.log("WebSocket server available for edge devices");
}
bootstrap();
