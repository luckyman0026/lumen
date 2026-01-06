# Incident Response Runbook

## Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| **P1 - Critical** | Dashboard completely down | Immediate | Site unreachable, all API calls failing |
| **P2 - High** | Major feature broken | < 1 hour | Charts not loading, data not updating |
| **P3 - Medium** | Minor feature impacted | < 4 hours | Single page broken, filter not working |
| **P4 - Low** | Cosmetic/minor issues | < 24 hours | Styling issues, minor UI bugs |

## Escalation Contacts

| Role | Contact | When to Escalate |
|------|---------|------------------|
| On-call Engineer | [TODO: Add contact] | P1-P2 incidents |
| Engineering Lead | [TODO: Add contact] | P1 incidents, escalation from on-call |
| Backend Team | [TODO: Add contact] | API-related issues |

## Initial Response Checklist

### For All Incidents

- [ ] Acknowledge the incident
- [ ] Assess severity level
- [ ] Start incident timeline
- [ ] Notify relevant stakeholders

### For P1/P2 Incidents

- [ ] Join incident channel/call
- [ ] Assign incident commander
- [ ] Begin diagnostic steps below

## Diagnostic Steps

### 1. Check Deployment Status

```bash
# Vercel status
# Visit: https://vercel.com/[org]/lumen/deployments
```

### 2. Verify API Connectivity

```bash
# Test API endpoint
curl -H "X-API-Key: $API_KEY" \
  "https://backend.example.com/v1/overview"
```

### 3. Check Browser Console

- Open browser DevTools (F12)
- Check Console tab for JavaScript errors
- Check Network tab for failed requests

### 4. Review Recent Changes

```bash
# List recent commits
git log --oneline -10

# List recent deployments (Vercel CLI)
vercel ls
```

### 5. Check Environment Variables

Verify in deployment platform:
- `API_URL` is set correctly
- `API_KEY` is valid and not expired

## Common Issues and Fixes

### Dashboard Shows No Data

1. Check if API backend is responding
2. Verify API_KEY is valid
3. Check for CORS issues in browser console
4. Confirm time range filters are valid

### Charts Not Rendering

1. Check for JavaScript errors in console
2. Verify data format from API matches expected types
3. Clear browser cache and reload

### Slow Performance

1. Check React Query cache settings
2. Verify polling interval (default 10s)
3. Check for memory leaks in browser DevTools

### 502/503 Errors

1. Check Vercel function logs
2. Verify serverless function timeout settings
3. Check API backend health

## Post-Mortem Template

After resolving P1/P2 incidents, complete a post-mortem:

### Incident Summary

- **Date**: [YYYY-MM-DD]
- **Duration**: [Start time - End time]
- **Severity**: [P1/P2/P3/P4]
- **Impact**: [Description of user impact]

### Timeline

| Time | Event |
|------|-------|
| HH:MM | [Event description] |

### Root Cause

[Detailed explanation of what caused the incident]

### Resolution

[What was done to fix the issue]

### Action Items

| Item | Owner | Due Date |
|------|-------|----------|
| [Action] | [Name] | [Date] |

### Lessons Learned

[What can be improved to prevent similar incidents]
