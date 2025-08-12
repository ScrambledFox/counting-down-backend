# Testing Setup for Todo Backend

This project uses Jest for testing the Todo API endpoints with comprehensive test coverage.

## Test Files Structure

```
tests/
├── setup.ts                 # Test environment setup
├── helpers/
│   └── test-helpers.ts      # Test utility functions
└── todo.test.ts            # Todo endpoints tests
```

## Available Test Scripts

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Features

### 1. In-Memory Database
- Uses `mongodb-memory-server` for isolated testing
- Each test runs with a clean database state
- No need for a separate test database

### 2. Test Coverage
- **Controllers**: 77.77% coverage
- **DAL (Data Access Layer)**: 100% coverage
- **Routes**: 100% coverage
- **Models**: 100% coverage

### 3. Comprehensive Endpoint Testing

#### GET /api/todos
- ✅ Returns empty array when no todos exist
- ✅ Returns all todos when they exist

#### GET /api/todos/:id
- ✅ Returns todo when it exists
- ✅ Returns 404 when todo doesn't exist
- ✅ Handles route access properly

#### POST /api/todos
- ✅ Creates new todo with valid data
- ✅ Sets default completed status
- ✅ Validates required fields (title, description)
- ✅ Trims whitespace from inputs
- ✅ Returns proper error messages

#### PUT /api/todos/:id
- ✅ Updates todo with valid data
- ✅ Partial updates (only provided fields)
- ✅ Returns 404 for non-existent todos
- ✅ Validates update data
- ✅ Ignores empty/undefined values
- ✅ Trims whitespace from inputs

#### DELETE /api/todos/:id
- ✅ Deletes existing todo
- ✅ Returns 404 for non-existent todos
- ✅ Verifies database deletion

#### PATCH /api/todos/:id/toggle-completion
- ✅ Toggles completion status (false → true)
- ✅ Toggles completion status (true → false)
- ✅ Returns 404 for non-existent todos
- ✅ Returns proper success messages

#### Error Handling
- ✅ Handles invalid MongoDB ObjectIds
- ✅ Returns proper error responses
- ✅ Maintains consistent error format

## Test Utilities

### Test Helpers (`tests/helpers/test-helpers.ts`)
- `createTestTodo()` - Creates a single test todo
- `createMultipleTestTodos()` - Creates multiple test todos
- `sampleTodos` - Pre-defined test data
- `generateInvalidObjectId()` - Generates invalid but valid-format ObjectId
- `generateInvalidId()` - Generates completely invalid ID

### Test Setup (`tests/setup.ts`)
- Configures in-memory MongoDB
- Sets up database connections
- Cleans up after each test
- Handles test environment teardown

## Running Tests

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Tests**:
   ```bash
   npm test
   ```

3. **View Coverage**:
   ```bash
   npm run test:coverage
   ```
   Coverage reports are generated in the `coverage/` directory.

## Test Configuration

The Jest configuration is in `jest.config.js`:
- Uses `ts-jest` for TypeScript support
- 10-second timeout for database operations
- Excludes server startup files from coverage
- Generates HTML and LCOV coverage reports

## Best Practices Followed

1. **Isolation**: Each test is independent and doesn't affect others
2. **Cleanup**: Database is cleaned after each test
3. **Realistic Data**: Tests use realistic todo data
4. **Edge Cases**: Tests cover error conditions and edge cases
5. **Descriptive Names**: Test names clearly describe what they're testing
6. **Assertions**: Comprehensive assertions for both success and error cases
