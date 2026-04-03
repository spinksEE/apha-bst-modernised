import { IsString, MinLength } from 'class-validator';

export class LoginRequestDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(1)
  password: string;
}

export class UserContextDto {
  userId: string;
  name: string;
  role: string;
  locationId: string;
  locationName?: string;
}

export class LoginResponseDto {
  accessToken: string;
  userContext: UserContextDto;
}

export class SessionResponseDto {
  userContext: UserContextDto;
}

export class AuthErrorResponseDto {
  message: string;
  referenceId?: string;
}
