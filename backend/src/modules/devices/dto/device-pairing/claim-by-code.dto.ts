import { IsString, IsNotEmpty, Length } from "class-validator";

export class ClaimByCodeDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: "Pairing code must be exactly 6 characters" })
  pairingCode: string;

  @IsString()
  @IsNotEmpty()
  deviceName: string;
}
