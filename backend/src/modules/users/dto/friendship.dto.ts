import { IsString, IsEmail } from "class-validator";

export class SendFriendRequestDto {
  @IsEmail()
  email: string;
}

export class RespondToFriendRequestDto {
  @IsString()
  friendshipId: string;

  @IsString()
  action: "accept" | "decline";
}
