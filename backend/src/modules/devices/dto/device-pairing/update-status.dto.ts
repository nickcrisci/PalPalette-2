import {
  IsBoolean,
  IsOptional,
  IsString,
  IsDateString,
  IsNumber,
  IsObject,
} from "class-validator";

export class UpdateStatusDto {
  @IsOptional()
  @IsBoolean()
  isOnline?: boolean;

  @IsOptional()
  @IsBoolean()
  isProvisioned?: boolean;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsDateString()
  lastSeenAt?: string;

  @IsOptional()
  @IsString()
  firmwareVersion?: string;

  @IsOptional()
  @IsString()
  macAddress?: string;

  @IsOptional()
  @IsNumber()
  wifiRSSI?: number;

  @IsOptional()
  @IsObject()
  systemStats?: {
    freeHeap?: number;
    uptime?: number;
    lastUpdate?: Date;
  };
}
