import { IsUUID, IsString, IsArray, ArrayMinSize } from "class-validator";

export class CreateMessageDto {
  @IsUUID()
  senderId: string;

  @IsUUID()
  recipientId: string;

  @IsUUID()
  deviceId: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  colors: string[]; // e.g., hex codes or color names

  @IsString()
  content?: string;
}
