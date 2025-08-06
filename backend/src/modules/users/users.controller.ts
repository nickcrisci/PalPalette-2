import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
  Request,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UsersService } from "./users.service";
import { FriendsService } from "./friends.service";
import { ColorPalettesService } from "./color-palettes.service";
import { RegisterUserDto } from "./dto/register-user.dto";
import {
  SendFriendRequestDto,
  RespondToFriendRequestDto,
} from "./dto/friendship.dto";
import {
  CreateColorPaletteDto,
  UpdateColorPaletteDto,
  SendPaletteToFriendsDto,
} from "./dto/color-palette.dto";

@Controller("users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly friendsService: FriendsService,
    private readonly palettesService: ColorPalettesService
  ) {}

  @Post("register")
  async register(@Body() registerUserDto: RegisterUserDto) {
    return this.usersService.register(registerUserDto);
  }

  // Friends endpoints - must come before :id route
  @UseGuards(JwtAuthGuard)
  @Post("friends/request")
  async sendFriendRequest(@Request() req, @Body() dto: SendFriendRequestDto) {
    return this.friendsService.sendFriendRequest(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post("friends/respond")
  async respondToFriendRequest(
    @Request() req,
    @Body() dto: RespondToFriendRequestDto
  ) {
    return this.friendsService.respondToFriendRequest(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("friends")
  async getFriends(@Request() req) {
    return this.friendsService.getFriends(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get("friends/pending")
  async getPendingRequests(@Request() req) {
    return this.friendsService.getPendingRequests(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get("friends/sent")
  async getSentRequests(@Request() req) {
    return this.friendsService.getSentRequests(req.user.userId);
  }

  // Color palettes endpoints - must come before :id route
  @UseGuards(JwtAuthGuard)
  @Post("palettes")
  async createPalette(@Request() req, @Body() dto: CreateColorPaletteDto) {
    return this.palettesService.create(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("palettes")
  async getUserPalettes(@Request() req) {
    return this.palettesService.findUserPalettes(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post("palettes/send")
  async sendPaletteToFriends(
    @Request() req,
    @Body() dto: SendPaletteToFriendsDto
  ) {
    return this.palettesService.sendPaletteToFriends(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("palettes/:id")
  async getPalette(@Param("id") id: string) {
    return this.palettesService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("palettes/:id")
  async updatePalette(
    @Request() req,
    @Param("id") id: string,
    @Body() dto: UpdateColorPaletteDto
  ) {
    return this.palettesService.update(req.user.userId, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete("palettes/:id")
  async deletePalette(@Request() req, @Param("id") id: string) {
    return this.palettesService.delete(req.user.userId, id);
  }

  // Messages endpoints for missed messages functionality - must come BEFORE :id route
  @UseGuards(JwtAuthGuard)
  @Get("messages")
  async getReceivedMessages(@Request() req) {
    // This will be implemented in MessagesService via UsersService
    return this.usersService.getReceivedMessages(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get("messages/undelivered")
  async getUndeliveredMessages(@Request() req) {
    return this.usersService.getUndeliveredMessages(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post("messages/:messageId/replay")
  async replayMessage(
    @Request() req,
    @Param("messageId") messageId: string,
    @Body() body: { deviceId: string }
  ) {
    return this.usersService.replayMessageOnDevice(
      req.user.userId,
      messageId,
      body.deviceId
    );
  }

  // Generic user routes - must come AFTER specific routes
  @Get(":id")
  async getUser(@Param("id") id: string) {
    return this.usersService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  async updateProfile(@Param("id") id: string, @Body() update: Partial<any>) {
    return this.usersService.updateProfile(id, update);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }
}
