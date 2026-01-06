# Contributing to Lumen

Thank you for your interest in contributing to Lumen! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/lumen-sdk.git
   cd lumen-sdk
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Create a branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Branch Naming Conventions

Use descriptive branch names with prefixes:

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New features | `feature/add-remix-adapter` |
| `fix/` | Bug fixes | `fix/sampling-edge-case` |
| `docs/` | Documentation changes | `docs/update-api-reference` |
| `refactor/` | Code refactoring | `refactor/simplify-transport` |
| `test/` | Test additions/changes | `test/add-signer-tests` |
| `chore/` | Maintenance tasks | `chore/update-dependencies` |

## Commit Message Format

Follow conventional commits format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Scope

Use package names or general areas:
- `core`: Changes to `@lumen/core`
- `nextjs`: Changes to `@lumen/nextjs`
- `docs`: Documentation changes
- `ci`: CI/CD changes

### Examples

```bash
feat(core): add custom tags support

fix(nextjs): handle undefined headers gracefully

docs: update environment configuration guide

test(core): add edge cases for sampler
```

## Pull Request Process

### 1. Before Submitting

- [ ] Run all tests: `pnpm test`
- [ ] Run linting: `pnpm lint`
- [ ] Build all packages: `pnpm build`
- [ ] Update documentation if needed
- [ ] Add tests for new functionality

### 2. PR Title

Use the same format as commit messages:
```
feat(core): add custom metrics support
```

### 3. PR Description

Include:
- **What**: Brief description of changes
- **Why**: Motivation and context
- **How**: Implementation approach (for complex changes)
- **Testing**: How you tested the changes

### 4. PR Template

```markdown
## Description
[Describe your changes]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Checklist
- [ ] Code follows project style
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
```

## Code Review Guidelines

### For Authors

- Keep PRs focused and reasonably sized
- Respond to feedback promptly
- Be open to suggestions
- Explain complex decisions in comments

### For Reviewers

- Be respectful and constructive
- Focus on code quality and correctness
- Suggest improvements, don't just criticize
- Approve when satisfied, request changes when needed

### What We Look For

1. **Correctness**: Does it work as intended?
2. **Tests**: Are there sufficient tests?
3. **Performance**: Any performance concerns?
4. **Security**: Any security implications?
5. **Readability**: Is the code clear?
6. **Documentation**: Is it documented?

## How to Run Tests

### All Tests

```bash
pnpm test
```

### Specific Package

```bash
# Core
cd packages/lumen-core && pnpm test

# Next.js adapter
cd packages/lumen-nextjs && pnpm test
```

### With Coverage

```bash
pnpm test -- --coverage
```

### Watch Mode

```bash
pnpm test -- --watch
```

## Project Structure

```
lumen-sdk/
├── packages/
│   ├── lumen-core/      # Core SDK (framework-agnostic)
│   │   ├── src/                # Source files
│   │   └── test/               # Tests
│   └── lumen-nextjs/    # Next.js adapter
│       ├── src/
│       └── test/
├── examples/
│   └── nextjs-16-app/          # Example application
├── docs/                       # Documentation
└── package.json                # Root workspace config
```

### Where to Put Changes

- **Core SDK logic**: `packages/lumen-core`
- **Next.js specific**: `packages/lumen-nextjs`
- **New framework adapter**: `packages/lumen-{framework}`
- **Documentation**: `docs/`

## Development Workflow

1. **Make changes** in the appropriate package
2. **Build** to check for compilation errors:
   ```bash
   pnpm build
   ```
3. **Test** your changes:
   ```bash
   pnpm test
   ```
4. **Lint** for code style:
   ```bash
   pnpm lint
   ```
5. **Commit** with a descriptive message
6. **Push** and create a pull request

## Adding a New Framework Adapter

1. Create package directory:
   ```bash
   mkdir packages/lumen-{framework}
   ```

2. Set up package structure:
   ```
   lumen-{framework}/
   ├── package.json
   ├── tsconfig.json
   ├── vitest.config.ts
   ├── src/
   │   ├── index.ts
   │   └── adapter.ts
   └── test/
       └── adapter.test.ts
   ```

3. Add to workspace in root `package.json`

4. Implement adapter using `@lumen/core`

5. Add documentation and examples

## Questions?

- Open an issue for bugs or feature requests
- Use discussions for questions
- Check existing issues before opening new ones

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
