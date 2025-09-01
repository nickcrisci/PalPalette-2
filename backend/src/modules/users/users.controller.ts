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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from "@nestjs/swagger";
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

@ApiTags('Users')
@Controller("users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly friendsService: FriendsService,
    private readonly palettesService: ColorPalettesService
  ) {}

  @Post("register")
  @ApiOperation({ summary: 'Register a new user (deprecated - use /auth/register)' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerUserDto: RegisterUserDto) {
    return this.usersService.register(registerUserDto);
  }

  // Friends endpoints - must come before :id route
  @UseGuards(JwtAuthGuard)
  @Post("friends/request")
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a friend request' })
  @ApiResponse({ status: 201, description: 'Friend request sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Target user not found' })
  async sendFriendRequest(@Request() req, @Body() dto: SendFriendRequestDto) {
    return this.friendsService.sendFriendRequest(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post("friends/respond")
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Respond to a friend request' })
  @ApiResponse({ status: 200, description: 'Response recorded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Friend request not found' })
  async respondToFriendRequest(
    @Request() req,
    @Body() dto: RespondToFriendRequestDto
  ) {
    return this.friendsService.respondToFriendRequest(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("friends")
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list of friends' })
  @ApiResponse({ status: 200, description: 'List of friends retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getFriends(@Request() req) {
    return this.friendsService.getFriends(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get("friends/pending")
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get pending friend requests received' })
  @ApiResponse({ status: 200, description: 'Pending requests retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPendingRequests(@Request() req) {
    return this.friendsService.getPendingRequests(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get("friends/sent")
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get friend requests sent by user' })
  @ApiResponse({ status: 200, description: 'Sent requests retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
