# Write Tests

Write tests for: $ARGUMENTS

## Backend Testing (NestJS)

Use Jest (comes with NestJS by default).

### What to Test in Services
- Happy path — correct input returns expected output
- Not found — throws NotFoundException when resource missing
- Conflict — throws ConflictException when duplicate exists
- Forbidden — throws ForbiddenException when access denied
- Edge cases — empty arrays, null values, boundary conditions

### What to Test in Controllers
- Route exists and returns correct status code
- Auth guard is applied (401 when no token)
- DTO validation works (400 when invalid data)

### Backend Test Template
```typescript
describe('$ARGUMENTSService', () => {
  let service: $ARGUMENTSService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        $ARGUMENTSService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile()

    service = module.get<$ARGUMENTSService>($ARGUMENTSService)
  })

  describe('methodName', () => {
    it('should return expected result on valid input', async () => {
      // arrange
      // act
      // assert
    })

    it('should throw NotFoundException when not found', async () => {
      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException)
    })
  })
})
```

## Frontend Testing (React)

Use Vitest + React Testing Library.

### What to Test in Components
- Renders without crashing
- Displays correct content
- User interactions work (click, type, submit)
- Shows loading state during async operations
- Shows error message on failure

### Frontend Test Template
```typescript
describe('$ARGUMENTS', () => {
  it('should render without crashing', () => {
    render(<$ARGUMENTS />)
    expect(screen.getByRole('...')).toBeInTheDocument()
  })

  it('should show error when form is submitted empty', async () => {
    render(<$ARGUMENTS />)
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    expect(await screen.findByText(/required/i)).toBeInTheDocument()
  })
})
```

## Rules
- Test file goes next to the file it tests: `auth.service.spec.ts`
- Use descriptive test names: "should throw NotFoundException when user not found"
- Follow Arrange → Act → Assert pattern
- Mock external dependencies (Prisma, Axios, Socket)
- Run: pnpm test after writing to make sure all pass
