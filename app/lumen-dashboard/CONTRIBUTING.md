# Contributing to Lumen

Thank you for your interest in contributing to Lumen! This guide will help you get started.

## Getting Started

1. Fork the repository
2. Clone your fork
3. Install dependencies: `pnpm install`
4. Create a `.env.local` file (see [Environment Guide](docs/environment.md))
5. Run the dev server: `pnpm dev`

## Branch Naming Conventions

Use the following prefixes for branch names:

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New features | `feature/add-date-range-picker` |
| `fix/` | Bug fixes | `fix/chart-rendering-issue` |
| `refactor/` | Code improvements | `refactor/extract-filter-logic` |
| `docs/` | Documentation changes | `docs/update-api-reference` |
| `chore/` | Maintenance tasks | `chore/update-dependencies` |

**Format**: `<prefix>/<short-description>`

Examples:
- `feature/export-csv`
- `fix/polling-memory-leak`
- `refactor/simplify-hooks`

## Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change that neither fixes nor adds |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build process, dependencies, etc. |

### Scope (Optional)

Component or area affected: `ui`, `api`, `hooks`, `charts`, etc.

### Examples

```
feat(charts): add tooltip to traffic chart

fix(api): handle 429 rate limit errors

docs: update environment setup instructions

refactor(hooks): extract polling logic to separate hook
```

## Pull Request Process

### Before Submitting

1. **Create a branch** from `main` using naming conventions above
2. **Make your changes** with clear, focused commits
3. **Run linting**: `pnpm lint`
4. **Build successfully**: `pnpm build`
5. **Test locally**: Verify your changes work as expected

### Submitting

1. Push your branch to your fork
2. Open a Pull Request against `main`
3. Fill out the PR template:
   - Summary of changes
   - Screenshots (for UI changes)
   - Testing steps
4. Request review from maintainers

### PR Title Format

Follow the same format as commits:

```
feat(charts): add date range selector
fix: resolve memory leak in polling
```

### Review Checklist

Your PR should:

- [ ] Follow the code style of the project
- [ ] Pass linting (`pnpm lint`)
- [ ] Build without errors (`pnpm build`)
- [ ] Include relevant documentation updates
- [ ] Have a clear description of changes

## Code Review Guidelines

### For Authors

- Keep PRs focused and reasonably sized
- Respond to feedback promptly
- Explain your reasoning when disagreeing with feedback
- Update PR description if scope changes

### For Reviewers

- Be constructive and respectful
- Explain the "why" behind suggestions
- Approve when changes are good enough, not perfect
- Use these labels:
  - `nit:` - Minor suggestion, optional
  - `blocking:` - Must be addressed before merge

## Running Tests

```bash
# Currently no test suite configured
# See docs/testing.md for recommended setup
pnpm lint  # Run ESLint
pnpm build # Verify build succeeds
```

## Development Workflow

### Local Development

```bash
pnpm dev      # Start dev server at localhost:3000
pnpm lint     # Check for linting errors
pnpm build    # Create production build
```

### Project Structure

```
app/           # Next.js pages (App Router)
components/    # React components
  ui/         # shadcn/ui primitives
  overview/   # Dashboard components
  time-series/
  top-routes/
  top-bots/
hooks/         # Custom React hooks
lib/           # Utilities, context, server actions
```

### Key Files

- `lib/actions.ts` - Server actions for API calls
- `hooks/use-api.ts` - React Query hooks
- `lib/filter-context.tsx` - Global filter state

## Questions?

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Tag issues appropriately: `bug`, `enhancement`, `question`
