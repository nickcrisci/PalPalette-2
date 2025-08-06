import { Controller, Post, Body, Inject } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import { AuthService } from "./auth.service";
import { LoginUserDto } from "../users/dto/login-user.dto";
import { RegisterUserDto } from "../users/dto/register-user.dto";
import { UsersService } from "../users/users.service";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(UsersService) private readonly usersService: UsersService
  ) {}
  @Public()
  @Post("register")
  async register(@Body() registerUserDto: RegisterUserDto) {
    return this.usersService.register(registerUserDto);
  }

  @Public()
  @Post("login")
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }
}
