# ADR-000: Template

## Status

[Proposed | Accepted | Deprecated | Superseded by ADR-XXX]

## Context

Describe the issue or situation that motivates this decision. What problem are we trying to solve? What constraints exist?

[TODO: Describe the context for this decision]

## Decision

Describe the decision that was made. Be specific about what we chose to do.

[TODO: Describe the decision]

## Consequences

### Positive

- [TODO: List positive outcomes]

### Negative

- [TODO: List negative outcomes or trade-offs]

### Neutral

- [TODO: List neutral observations]

---

## Usage

Copy this template to create a new ADR:

```bash
cp 000-template.md XXX-title-of-decision.md
```

### Naming Convention

- Use sequential numbering: `001-`, `002-`, etc.
- Use lowercase with hyphens: `001-use-hmac-sha256-for-signing.md`
- Keep titles concise but descriptive

### When to Write an ADR

- Choosing between multiple valid approaches
- Making irreversible or hard-to-reverse decisions
- Decisions that affect multiple parts of the system
- Trade-offs that future developers should understand

### Tips

- Focus on the "why" rather than the "what"
- Include alternatives that were considered
- Link to relevant issues, PRs, or discussions
- Update status when decisions are superseded
