# Contributing

## Development Setup

1. **Clone the repository:**
```bash
git clone https://github.com/sthpratik/Synapse.git
cd Synapse
```

2. **Install dependencies:**
```bash
npm install
```

3. **Build the project:**
```bash
npm run build
```

4. **Run tests:**
```bash
npm test
```

## Project Structure

```
synapse/
├── src/
│   ├── generators/          # Parameter and script generators
│   ├── validators/          # Configuration validators
│   ├── types/              # TypeScript interfaces
│   └── cli.ts              # CLI interface
├── examples/               # Example configurations
├── docs/                   # Documentation
└── tests/                  # Test files
```

## Adding New Parameter Types

1. **Create generator class:**
```typescript
export class MyParameterGenerator extends ParameterGenerator {
  generate(): string {
    // Implementation
  }
}
```

2. **Add to parameter factory:**
```typescript
case 'mytype':
  return new MyParameterGenerator(param);
```

3. **Update schema validation:**
```typescript
mytype: Joi.object({
  // Schema definition
})
```

4. **Add tests:**
```typescript
describe('MyParameterGenerator', () => {
  // Test cases
});
```

## Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Add JSDoc comments for public APIs
- Write unit tests for new features

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test -- --coverage

# Run specific test
npm test -- --testNamePattern="MyTest"
```

## Documentation

Update documentation when adding features:

1. **API changes:** Update `api-reference.md`
2. **CLI changes:** Update `cli-reference.md`
3. **New features:** Add examples to `examples.md`

## Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for new functionality
5. Update documentation
6. Commit changes: `git commit -m 'Add amazing feature'`
7. Push to branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release tag
4. Publish to NPM

## Issues and Support

- **Bug reports:** Use GitHub Issues
- **Feature requests:** Use GitHub Discussions
- **Questions:** Check documentation first

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
