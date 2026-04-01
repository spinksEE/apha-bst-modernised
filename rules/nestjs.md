# NestJS Backend Development Rules

Modern NestJS development standards focusing on modular architecture, dependency injection, type safety, and enterprise-grade backend patterns for scalable APIs.

## Context

Establish consistent NestJS backend practices leveraging TypeScript, dependency injection, and modular design patterns.

*Applies to:* All NestJS backend code, modules, controllers, services, and middleware
*Level:* Tactical/Operational - Daily backend development standards
*Audience:* Backend developers, API designers, code reviewers

## Core Principles

1. **Module-First Design:** Organize features into cohesive modules with clear boundaries
2. **Dependency Injection Excellence:** Leverage NestJS DI for loose coupling and testability
3. **Type Safety Throughout:** Strict TypeScript with DTOs and validation at all boundaries
4. **Security by Design:** Guards, pipes, and proper authentication/authorization patterns
5. **Fail Fast, Fail Clear:** Explicit error handling with meaningful exceptions

## Rules

### Must Have (Critical)

- **RULE-001:** Organize features into dedicated modules with controllers, services, DTOs co-located
- **RULE-002:** Use DTOs with class-validator decorators for all API request/response validation
- **RULE-003:** Implement authentication/authorization via Guards, never in controller logic
- **RULE-004:** Separate database entities from DTOs - never expose internal structure directly
- **RULE-005:** Handle errors with custom exceptions extending HttpException, not generic catches
- **RULE-006:** Use ConfigModule for all configuration - no direct process.env access

### Should Have (Important)

- **RULE-101:** Keep services stateless and focused on single responsibility
- **RULE-102:** Use interceptors for cross-cutting concerns (logging, caching, response transformation)
- **RULE-103:** Enable global validation pipe with whitelist and transform options
- **RULE-104:** Document APIs with Swagger/OpenAPI decorators

### Could Have (Preferred)

- **RULE-201:** Consider CQRS pattern for complex business logic
- **RULE-202:** Implement request correlation IDs for distributed tracing

## Patterns & Anti-Patterns

### ✅ Do This

```typescript
// Proper module structure
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

// DTO with validation
export class CreateUserDto {
  @IsEmail() @IsNotEmpty()
  email: string;
  
  @IsString() @MinLength(8)
  password: string;
}

// Service with proper DI and error handling
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private configService: ConfigService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('User already exists');
    }
    
    const user = await this.userRepo.save(dto);
    return new UserResponseDto(user);
  }
}

// Guard implementation
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any): any {
    if (err || !user) {
      throw new UnauthorizedException('Invalid token');
    }
    return user;
  }
}
```

### ❌ Don't Do This

```typescript
// Don't expose entities directly
@Get()
async getUsers(): Promise<User[]> { // ❌ Internal structure exposed
  return this.userService.findAll();
}

// Don't handle auth in controllers
@Get('profile')
async getProfile(@Headers('authorization') token: string) { // ❌
  if (!this.validateToken(token)) throw new UnauthorizedException();
}

// Don't use process.env directly
@Injectable()
export class EmailService {
  sendEmail() {
    const key = process.env.EMAIL_KEY; // ❌ Use ConfigService
  }
}
```

## Decision Framework

*When rules conflict:*
1. Security takes precedence over convenience
2. Type safety is non-negotiable at API boundaries
3. Business logic belongs in services, not controllers

*When facing edge cases:*
- Use interceptors for cross-cutting concerns
- Abstract external APIs behind service interfaces
- Keep controllers thin - delegate to services

## Exceptions & Waivers

*Valid reasons for exceptions:*
- Legacy system integration requiring specific patterns (document migration plan)
- Performance bottlenecks identified through profiling (document trade-offs)

*Process for exceptions:*
1. Document with detailed rationale and tracking ticket
2. Get backend lead approval for critical rule violations

## Quality Gates

- **Automated checks:** ESLint NestJS rules, >80% test coverage, Swagger doc generation
- **Code review focus:** DTO validation, module organization, guard usage, dependency injection
- **Testing requirements:** Unit tests with mocks, integration tests, E2E for critical flows

## Related Rules

- rules/typescript-rules.md - Type safety patterns for NestJS
- rules/domain-driven-design.md - Domain modeling integration
- knowledge/database-schema.md - Database design standards

## References

- [NestJS Documentation](https://docs.nestjs.com/) - Official framework docs
- [Class Validator](https://github.com/typestack/class-validator) - Validation decorators

---

## TL;DR

*Key Principles:*
- Module-first architecture with clear feature boundaries
- Dependency injection for loose coupling and testability
- Type safety and validation at all API boundaries

*Critical Rules:*
- Must organize into feature modules with controllers, services, DTOs
- Must use DTOs with validation for all request/response data
- Must implement guards for auth/authz, never in controllers
- Must separate database entities from API DTOs

*Quick Decision Guide:*
When in doubt: **"Is this code testable, secure, and maintainable?"** If no, refactor before merging.
