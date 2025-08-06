import {
  IsString,
  IsArray,
  IsOptional,
  ArrayMinSize,
  IsHexColor,
} from "class-validator";

export class CreateColorPaletteDto {
  @IsString()
  name: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsHexColor({ each: true })
  colors: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class UpdateColorPaletteDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsHexColor({ each: true })
  colors?: string[];

  @IsOptional()
  @IsString()
  description?: string;
}

export class SendPaletteToFriendsDto {
  @IsOptional()
  @IsString()
  paletteId?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  friendIds: string[];

  // For direct color sending without palette storage
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  colors?: string[];

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
