import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsObject,
  IsIn,
} from "class-validator";

export class LightingSystemConfigDto {
  @IsString()
  @IsIn(["nanoleaf", "wled", "ws2812"])
  lightingSystemType: string;

  @IsString()
  @IsOptional()
  lightingHostAddress?: string;

  @IsNumber()
  @IsOptional()
  lightingPort?: number;

  @IsString()
  @IsOptional()
  lightingAuthToken?: string;

  @IsObject()
  @IsOptional()
  lightingCustomConfig?: any;
}

export class UpdateLightingSystemDto {
  @IsString()
  @IsOptional()
  @IsIn(["nanoleaf", "wled", "ws2812"])
  lightingSystemType?: string;

  @IsString()
  @IsOptional()
  lightingHostAddress?: string;

  @IsNumber()
  @IsOptional()
  lightingPort?: number;

  @IsString()
  @IsOptional()
  lightingAuthToken?: string;

  @IsObject()
  @IsOptional()
  lightingCustomConfig?: any;

  @IsBoolean()
  @IsOptional()
  lightingSystemConfigured?: boolean;

  @IsString()
  @IsOptional()
  @IsIn(["unknown", "working", "error", "authentication_required"])
  lightingStatus?: string;
}

export class TestLightingSystemDto {
  @IsString()
  deviceId: string;
}

export class LightingSystemStatusDto {
  lightingSystemType: string;
  lightingHostAddress?: string;
  lightingPort?: number;
  lightingSystemConfigured: boolean;
  lightingStatus: string;
  lightingLastTestAt?: Date;
  requiresAuthentication: boolean;
  capabilities?: any;
}
