import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import {
  LoginRequestDto,
  LoginResponseDto,
  SessionResponseDto,
} from './auth.dto';
import { JwtAuthGuard } from './auth.guard';
import { CurrentUser } from './auth.decorator';
import type { AuthenticatedUser } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: LoginRequestDto,
    @Req() request: Request,
  ): Promise<LoginResponseDto> {
    const ipAddress = request.ip;
    return this.authService.login(body.username, body.password, ipAddress);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(204)
  async logout(): Promise<void> {
    return;
  }

  @UseGuards(JwtAuthGuard)
  @Get('session')
  async session(@CurrentUser() user: AuthenticatedUser): Promise<SessionResponseDto> {
    return {
      userContext: {
        userId: user.userId,
        name: user.name,
        role: user.role,
        locationId: user.locationId,
        locationName: user.locationName,
      },
    };
  }
}
