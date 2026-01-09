# Incident Response Runbook

This document outlines procedures for responding to incidents related to the Lumen SDK.

## Severity Levels

### SEV-1: Critical

**Definition:** Complete SDK failure affecting all users

**Examples:**
- SDK throws unhandled exceptions blocking user requests
- Security vulnerability actively being exploited
- npm package compromised or malicious

**Response Time:** Immediate (< 15 minutes)

### SEV-2: High

**Definition:** Major functionality impaired for significant user segment

**Examples:**
- Events not being delivered to backend
- Signature verification failing
- Memory leaks or performance degradation

**Response Time:** < 1 hour

### SEV-3: Medium

**Definition:** Degraded functionality, workaround available

**Examples:**
- Specific framework adapter issues
- Edge cases causing incorrect sampling
- Documentation errors causing confusion

**Response Time:** < 4 hours

### SEV-4: Low

**Definition:** Minor issues, no significant impact

**Examples:**
- TypeScript type definition issues
- Minor documentation updates needed
- Feature requests

**Response Time:** Next business day

## Escalation Contacts

| Role | Contact | Escalation Path |
|------|---------|-----------------|
| On-Call Engineer | [TODO: Add contact] | First responder |
| Tech Lead | [TODO: Add contact] | SEV-1 and SEV-2 |
| Security Lead | [TODO: Add contact] | Security incidents |
| Package Owner | [TODO: Add contact] | npm access issues |

## Initial Response Checklist

### 1. Assess the Situation

- [ ] Identify the severity level
- [ ] Determine scope of impact (which versions, which frameworks)
- [ ] Check if this is a known issue (GitHub issues, npm advisories)

### 2. Communicate

- [ ] Acknowledge the incident in the issue tracker
- [ ] Notify relevant stakeholders based on severity
- [ ] Update status page if applicable

### 3. Investigate

- [ ] Reproduce the issue if possible
- [ ] Check recent commits for potential causes
- [ ] Review error logs and stack traces

### 4. Mitigate

For SDK issues that block user requests:

```typescript
// Emergency bypass - disable Lumen temporarily
const tracker = createLumen({
  ...config,
  sampleRate: 0, // Disable all tracking
});
```

### 5. Resolve

- [ ] Develop and test fix
- [ ] Review fix with another engineer
- [ ] Deploy hotfix following deployment runbook
- [ ] Verify fix in production

## Common Incident Scenarios

### SDK Blocking User Requests

**Symptoms:** User applications experiencing latency or timeouts

**Investigation:**
1. Check if tracker.capture() is being awaited incorrectly
2. Verify timeout settings
3. Check backend ingest endpoint availability

**Mitigation:**
```typescript
// Ensure fire-and-forget pattern
tracker.capture(req, event); // No await!
```

### Signature Verification Failing

**Symptoms:** Backend rejecting all events with 401 errors

**Investigation:**
1. Verify HMAC secret matches between SDK and backend
2. Check for timestamp drift (> 5 minutes)
3. Verify keyId is correct

**Mitigation:**
1. Verify environment variables
2. Check backend logs for specific error messages

### Memory Leaks

**Symptoms:** Application memory growing over time

**Investigation:**
1. Check for event listener leaks
2. Verify AbortController cleanup
3. Profile memory usage

**Mitigation:**
1. Reduce sample rate temporarily
2. Restart affected instances
3. Roll back to previous version

### npm Package Compromise

**Symptoms:** Unexpected behavior, security alerts

**Immediate Actions:**
1. Deprecate affected version immediately
2. Notify users via GitHub security advisory
3. Investigate supply chain
4. Publish clean version

## Post-Incident

### Post-Mortem Template

```markdown
# Incident Post-Mortem: [Title]

## Summary
- **Date:** YYYY-MM-DD
- **Duration:** X hours
- **Severity:** SEV-X
- **Impact:** Description of user impact

## Timeline
- HH:MM - Incident detected
- HH:MM - Investigation started
- HH:MM - Root cause identified
- HH:MM - Fix deployed
- HH:MM - Incident resolved

## Root Cause
[Describe the technical root cause]

## Resolution
[Describe how the incident was resolved]

## Lessons Learned
### What went well
-

### What could be improved
-

## Action Items
- [ ] Action item 1 (Owner, Due Date)
- [ ] Action item 2 (Owner, Due Date)
```

### Follow-Up Actions

- [ ] Complete post-mortem within 48 hours
- [ ] Share learnings with team
- [ ] Update runbooks if needed
- [ ] Implement preventive measures
- [ ] Close related GitHub issues

## Useful Commands

### Check npm Package Health

```bash
# View package info
npm view @lumen/lumen-core

# Check for vulnerabilities
npm audit

# View download stats
npm show @lumen/lumen-core downloads
```

### Debug SDK in Production

```typescript
const tracker = createLumen({
  ...config,
  debug: true, // Enable debug logging
});
```

### Emergency Version Pin

If users need to avoid a problematic version:

```json
{
  "resolutions": {
    "@lumen/lumen-core": "1.0.0"
  }
}
```
