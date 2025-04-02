# CLAUDE.md - Banking MCP Project Guidelines

## Development Commands
- Build/Run: `npm run dev`
- Test: Not configured (add with `jest` or `mocha`)
- Typecheck: `npx tsc --noEmit`

## Code Style Guidelines

### TypeScript
- Use strict type checking (enabled in tsconfig.json)
- Prefer explicit types over inferred types for function parameters and returns
- Use interfaces for object shapes and types for unions/primitives

### Formatting & Naming
- Use camelCase for variables and functions
- Use PascalCase for classes and interfaces
- Use descriptive, meaningful names
- Limit line length to 100 characters

### Imports
- Use named imports when importing multiple items
- Group imports: 1) Node.js modules, 2) External packages, 3) Local modules
- Sort imports alphabetically within groups

### Error Handling
- Use typed errors with descriptive messages
- Prefer async/await with try/catch over promise chains
- Handle all error conditions explicitly

### Best Practices
- Favor pure functions and immutability
- Add JSDoc comments for public APIs
- Avoid any type when possible
- Use undefined over null