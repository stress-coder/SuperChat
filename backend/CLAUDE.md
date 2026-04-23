# Backend Context

## Tech Stack
- **Framework:** NestJS + TypeScript (strict mode)
- **Database:** MySQL with TypeORM
- **Authentication:** JWT + Passport.js
- **Real-time:** WebSockets with Socket.io
- **Cache:** Redis
- **Validation:** class-validator + class-transformer
- **Security:** Helmet + CORS + @nestjs/throttler
- **File Upload:** Multer + Cloudinary

## Folder Structure
```
src/
├── modules/
│   ├── auth/              # register, login, JWT, refresh token
│   │   ├── dto/
│   │   │   ├── register.dto.ts
│   │   │   └── login.dto.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   └── auth.service.ts
│   ├── user/              # user profile, update, search
│   │   ├── dto/
│   │   │   └── update-user.dto.ts
│   │   ├── user.module.ts
│   │   ├── user.controller.ts
│   │   └── user.service.ts
│   ├── chat/              # chat rooms, create, fetch
│   │   ├── dto/
│   │   │   ├── create-chat.dto.ts
│   │   │   └── create-group-chat.dto.ts
│   │   ├── chat.module.ts
│   │   ├── chat.controller.ts
│   │   └── chat.service.ts
│   ├── message/           # send, fetch, delete messages
│   │   ├── dto/
│   │   │   └── send-message.dto.ts
│   │   ├── message.module.ts
│   │   ├── message.controller.ts
│   │   └── message.service.ts
│   └── gateway/           # WebSocket gateway
│       ├── gateway.module.ts
│       └── chat.gateway.ts
├── common/
│   ├── decorators/
│   │   └── current-user.decorator.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   └── interceptors/
│       └── response.interceptor.ts
├── entities/              # TypeORM entity classes
│   ├── user.entity.ts
│   ├── chat.entity.ts
│   ├── message.entity.ts
│   └── participant.entity.ts
├── config/
│   ├── jwt.config.ts
│   └── database.config.ts
├── app.module.ts
└── main.ts
```

## Module Structure (always follow this pattern)
Every module must have exactly these files:
- `*.module.ts`     → imports, controllers, providers registration
- `*.controller.ts` → HTTP routes only, zero business logic
- `*.service.ts`    → all business logic + TypeORM repository calls
- `dto/`            → request/response data shapes with validation

## TypeORM Entities

```typescript
// user.entity.ts
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column({ unique: true })
  email: string

  @Column()
  password: string

  @Column({ nullable: true })
  avatar: string

  @Column({ default: false })
  isOnline: boolean

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastSeen: Date

  @CreateDateColumn()
  createdAt: Date
}

// chat.entity.ts
@Entity()
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ default: false })
  isGroupChat: boolean

  @Column({ nullable: true })
  name: string

  @CreateDateColumn()
  createdAt: Date
}

// message.entity.ts
@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  content: string

  @Column({ nullable: true })
  mediaUrl: string

  @Column()
  senderId: string

  @Column()
  chatId: string

  @CreateDateColumn()
  createdAt: Date
}

// participant.entity.ts
@Entity()
export class Participant {
  @PrimaryColumn()
  userId: string

  @PrimaryColumn()
  chatId: string
}
```

## Controller Rules
- Handle HTTP routing only
- Delegate ALL logic to the service
- Always use `@UseGuards(JwtAuthGuard)` on protected routes
- Always use `@CurrentUser()` to get the logged-in user
- Always use DTOs with `@Body()`, `@Param()`, `@Query()`

```typescript
// ✅ Correct controller pattern
@Get()
@UseGuards(JwtAuthGuard)
findAll(@CurrentUser() user: User) {
  return this.chatService.findAll(user.id)
}

// ❌ Wrong — business logic in controller
@Get()
async findAll() {
  const chats = await this.chatRepository.find()  // never do this in controller
  return chats
}
```

## Service Rules
- All business logic lives here
- All TypeORM repository calls live here
- Inject repositories using `@InjectRepository(Entity)`
- Always throw proper NestJS exceptions
- Never return passwords in any response

```typescript
// ✅ Correct TypeORM repository injection
@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
  ) {}

  async findAll(userId: string): Promise<Chat[]> {
    return this.chatRepository.find({
      where: { participants: { userId } },
    })
  }
}

// ✅ Correct exception throwing
throw new NotFoundException('Chat not found')
throw new ConflictException('Email already exists')
throw new UnauthorizedException('Invalid credentials')
throw new ForbiddenException('Access denied')
```

## DTO Rules
- Every request body must have a DTO
- Every field must have class-validator decorators
- Every decorator must have a custom error message
- Use `@IsOptional()` for non-required fields

```typescript
// ✅ Correct DTO pattern
export class CreateChatDto {
  @IsUUID('4', { message: 'participantId must be a valid UUID' })
  @IsNotEmpty({ message: 'participantId is required' })
  participantId: string
}
```

## WebSocket Events
```
Client → Server:
  connection     → authenticate with JWT
  joinRoom       → { chatId: string }
  sendMessage    → { chatId: string, content: string }
  typing         → { chatId: string }
  stopTyping     → { chatId: string }

Server → Client:
  newMessage     → full message object
  userTyping     → { userId, chatId }
  userOnline     → { userId }
  userOffline    → { userId }
```

## Environment Variables
```
DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
REDIS_HOST, REDIS_PORT
JWT_SECRET, JWT_EXPIRES_IN
CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
BACKEND_PORT
```
