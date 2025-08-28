import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { LoginUserDto } from "../users/dto/login-user.dto";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

interface RefreshTokenStore {
  [userId: string]: {
    token: string;
    deviceName?: string;
    createdAt: Date;
    expiresAt: Date;
  };
}

@Injectable()
export class AuthService {
  private refreshTokenStore: RefreshTokenStore = {};

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {
    // Clean up expired refresh tokens every hour
    setInterval(() => this.cleanupExpiredTokens(), 60 * 60 * 1000);
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return null;
    return user;
  }

  async login(loginUserDto: LoginUserDto & { device_name?: string }) {
    const user = await this.validateUser(
      loginUserDto.email,
      loginUserDto.password
    );
    if (!user) throw new UnauthorizedException("Invalid credentials");

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: "15m" }); // Short-lived access token
    const refreshToken = this.generateRefreshToken(
      user.id,
      loginUserDto.device_name
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
    };
  }

  async refreshTokens(refreshToken: string) {
    const userId = this.validateRefreshToken(refreshToken);
    if (!userId) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    // Generate new tokens
    const payload = { sub: user.id, email: user.email };
    const newAccessToken = this.jwtService.sign(payload, { expiresIn: "15m" });
    const newRefreshToken = this.generateRefreshToken(user.id);

    // Invalidate old refresh token
    delete this.refreshTokenStore[userId];

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
    };
  }

  async logout(userId: string) {
    // Invalidate refresh token
    delete this.refreshTokenStore[userId];
    return { success: true };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findById(payload.sub);
      return user ? { valid: true, user } : { valid: false };
    } catch (error) {
      return { valid: false };
    }
  }

  private generateRefreshToken(userId: string, deviceName?: string): string {
    const token = uuidv4();
    const expirationTime = 7 * 24 * 60 * 60 * 1000; // 7 days

    this.refreshTokenStore[userId] = {
      token,
      deviceName,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + expirationTime),
    };

    return token;
  }

  private validateRefreshToken(token: string): string | null {
    for (const [userId, tokenData] of Object.entries(this.refreshTokenStore)) {
      if (tokenData.token === token) {
        if (new Date() > tokenData.expiresAt) {
          // Token expired
          delete this.refreshTokenStore[userId];
          return null;
        }
        return userId;
      }
    }
    return null;
  }

  private cleanupExpiredTokens() {
    const now = new Date();
    for (const [userId, tokenData] of Object.entries(this.refreshTokenStore)) {
      if (now > tokenData.expiresAt) {
        delete this.refreshTokenStore[userId];
      }
    }
  }
}
