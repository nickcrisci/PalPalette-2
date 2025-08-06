import { IsBoolean, IsOptional, IsString, IsDateString } from "class-validator";

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
}
