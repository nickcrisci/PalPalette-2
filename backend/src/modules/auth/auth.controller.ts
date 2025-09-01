import {
  Controller,
  Post,
  Body,
  Inject,
  Request,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { AuthService } from "./auth.service";
import { LoginUserDto } from "../users/dto/login-user.dto";
import { LoginRequestDto } from "./dto/login-request.dto";
import { RegisterUserDto } from "../users/dto/register-user.dto";
import { UsersService } from "../users/users.service";
import { JwtAuthGuard } from "./jwt-auth.guard";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(UsersService) private readonly usersService: UsersService
  ) {}

  @Public()
  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ status: 201, description: "User successfully registered" })
  @ApiResponse({ status: 400, description: "Bad request - validation error" })
  @ApiResponse({ status: 409, description: "User already exists" })
  async register(@Body() registerUserDto: RegisterUserDto) {
    return this.usersService.register(registerUserDto);
  }

  @Public()
  @Post("login")
  @ApiOperation({ summary: "Login user and get access tokens" })
  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async login(@Body() loginRequestDto: LoginRequestDto) {
    return this.authService.login(loginRequestDto);
  }

  @Public()
  @Post("refresh")
  @ApiOperation({ summary: "Refresh access tokens using refresh token" })
  @ApiResponse({ status: 200, description: "Tokens refreshed successfully" })
  @ApiResponse({ status: 401, description: "Invalid refresh token" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        refresh_token: { type: "string" },
      },
      required: ["refresh_token"],
    },
  })
  async refresh(@Body() body: { refresh_token: string }) {
    return this.authService.refreshTokens(body.refresh_token);
  }

  @UseGuards(JwtAuthGuard)
  @Post("logout")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Logout user and invalidate tokens" })
  @ApiResponse({ status: 200, description: "Logout successful" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async logout(@Request() req) {
    return this.authService.logout(req.user.userId);
  }

  @Public()
  @Post("validate")
  @ApiOperation({ summary: "Validate an access token" })
  @ApiResponse({ status: 200, description: "Token is valid" })
  @ApiResponse({ status: 401, description: "Token is invalid" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        token: { type: "string" },
      },
      required: ["token"],
    },
  })
  async validate(@Body() body: { token: string }) {
    return this.authService.validateToken(body.token);
  }
}
