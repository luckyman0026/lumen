# Scaffold SaaS Documentation

Generate essential developer documentation for this codebase.

## Instructions

Create the following documentation structure in this project:

```
/docs
  /architecture
    overview.md
    diagrams/.gitkeep
  /adr
    000-template.md
  /runbooks
    deployment.md
    incident-response.md
  api.md
  database-schema.md
  environment.md
  testing.md
CONTRIBUTING.md
README.md
```

## File Contents

### README.md

If README.md exists, update it by:
1. Adding a TL;DR section at the very top (3-4 sentences max summarizing what the project does)
2. Adding a "Documentation" section with links to all docs, each with its own TL;DR

If README.md doesn't exist, create one with these sections:
- **TL;DR** — 3-4 sentence summary of what this project does
- **Prerequisites** — what's needed to run locally
- **Quick Start** — clone to running in under 15 minutes
- **Scripts** — available commands (npm scripts, make targets, etc.)
- **Documentation** — links to all docs with TL;DRs (see below)

The Documentation section format — each doc gets a heading, TL;DR, and link:

```markdown
## Documentation

### [Architecture Overview](docs/architecture/overview.md)
How the system fits together. Covers services, databases, data flow, and third-party integrations.

### [API Reference](docs/api.md)
REST API documentation. Endpoints, authentication, request/response formats, and error codes.

### [Database Schema](docs/database-schema.md)
Data model reference. Tables, relationships, and indexing strategy.

### [Environment Guide](docs/environment.md)
Configuration reference. All environment variables, secrets management, and per-environment differences.

### [Testing Guide](docs/testing.md)
How to run and write tests. Coverage expectations and mocking conventions.

### [Contributing](CONTRIBUTING.md)
How to contribute code. Branch naming, commit format, PR process, and code review guidelines.

### [ADRs](docs/adr/)
Architecture Decision Records. Documents explaining why key technical decisions were made.

### [Runbooks](docs/runbooks/)
Operational guides. Deployment procedures, rollback steps, and incident response.
```

**Important:** After generating the docs, re-read each document and rewrite its TL;DR in the README to accurately summarize what's actually in that specific document for this project. Don't use the generic descriptions above — make them specific.

### CONTRIBUTING.md
Include sections for: branch naming conventions, commit message format, PR process, code review guidelines, and how to run tests.

### docs/architecture/overview.md
Include sections for: system overview, component diagram placeholder, data flow, third-party integrations, and key design patterns.

### docs/adr/000-template.md
Create an ADR template with: title, status (proposed/accepted/deprecated/superseded), context, decision, and consequences.

### docs/runbooks/deployment.md
Include sections for: prerequisites, deployment steps, verification, and rollback procedure.

### docs/runbooks/incident-response.md
Include sections for: severity levels, escalation contacts placeholder, initial response checklist, and post-mortem template.

### docs/api.md
Include sections for: authentication, base URL, endpoints placeholder table, error codes, and rate limits.

### docs/database-schema.md
Include sections for: ER diagram placeholder, tables overview, relationships, and indexing strategy.

### docs/environment.md
Include sections for: required environment variables table (with name, description, example, required columns), secrets management, and environment differences (local/staging/production).

### docs/testing.md
Include sections for: running tests, testing philosophy, coverage expectations, writing new tests, and mocking conventions.

## Guidelines

1. Scan the codebase first to infer: language/framework, package manager, test framework, database type
2. Pre-fill templates with project-specific details where possible (e.g., actual scripts from package.json, env vars from .env.example)
3. For existing README.md: preserve all existing content, just add TL;DR at top and Documentation section (remove any existing Documentation section first to avoid duplicates)
4. Use placeholders like `[TODO: describe]` for sections that need human input
5. Write all TL;DRs by analyzing the codebase — don't use generic filler text
6. After generating all docs, go back and update each TL;DR in the README Documentation section to reflect what's actually in each document
7. After creating files, provide a summary:
   - Files created
   - Files updated (with what changed)
   - Sections that need manual attention