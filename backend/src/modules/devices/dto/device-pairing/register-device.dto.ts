import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Matches,
  IsNumber,
  IsObject,
} from "class-validator";

export class RegisterDeviceDto {
  @Matches(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, {
    message:
      "macAddress must be a valid MAC address format (XX:XX:XX:XX:XX:XX)",
  })
  @IsNotEmpty()
  macAddress: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  deviceType?: string;

  @IsOptional()
  @IsString()
  firmwareVersion?: string;

  // Lighting system configuration (from captive portal)
  @IsOptional()
  @IsString()
  lightingSystemType?: string;

  @IsOptional()
  @IsString()
  lightingHostAddress?: string;

  @IsOptional()
  @IsNumber()
  lightingPort?: number;

  @IsOptional()
  @IsString()
  lightingAuthToken?: string;

  @IsOptional()
  @IsObject()
  lightingCustomConfig?: any;
}
