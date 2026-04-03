import { IsString, MinLength } from 'class-validator';

export class LoginRequestDto {
  @IsString()
  username!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}

export class UserContextDto {
  userId: string;
  name: string;
  role: string;
  locationId: string;
  locationName?: string;

  constructor() {
    this.userId = '';
    this.name = '';
    this.role = '';
    this.locationId = '';
  }
}

export class LoginResponseDto {
  accessToken: string;
  userContext: UserContextDto;

  constructor() {
    this.accessToken = '';
    this.userContext = new UserContextDto();
  }
}

export class SessionResponseDto {
  userContext: UserContextDto;

  constructor() {
    this.userContext = new UserContextDto();
  }
}

export class AuthErrorResponseDto {
  message: string;
  referenceId?: string;

  constructor() {
    this.message = '';
  }
}
