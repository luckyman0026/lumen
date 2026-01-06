# Deployment Runbook

## Prerequisites

- Node.js 20+ installed
- pnpm package manager
- Access to environment variables (see [Environment Guide](../environment.md))
- Access to deployment platform (Vercel recommended)

## Local Build Verification

Before deploying, verify the build locally:

```bash
# Install dependencies
pnpm install

# Run linting
pnpm lint

# Build the application
pnpm build
```

## Deployment Steps

### Vercel (Recommended)

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Import the GitHub repository
   - Vercel auto-detects Next.js configuration

2. **Configure Environment Variables**
   ```
   API_URL=https://backend.example.com/v1
   API_KEY=<your-production-api-key>
   ```

3. **Deploy**
   - Pushes to `main` branch trigger automatic deployments
   - Preview deployments created for pull requests

### Manual Deployment

1. **Build the application**
   ```bash
   pnpm build
   ```

2. **Start production server**
   ```bash
   pnpm start
   ```

3. **Or export static files** (if configured)
   ```bash
   # Static export not supported with server actions
   # Use Node.js server or Vercel
   ```

## Verification

After deployment, verify the following:

- [ ] Dashboard loads at root URL
- [ ] API data populates within 10 seconds
- [ ] Filter controls (time range, route) work correctly
- [ ] All pages render: Overview, Time Series, Top Routes, Top Bots
- [ ] Charts display correctly with live data

## Rollback Procedure

### Vercel

1. Go to Vercel dashboard > Deployments
2. Find the previous working deployment
3. Click "..." menu > "Promote to Production"

### Manual

1. Identify the last working commit:
   ```bash
   git log --oneline -10
   ```

2. Checkout and redeploy:
   ```bash
   git checkout <commit-hash>
   pnpm install
   pnpm build
   pnpm start
   ```

## Troubleshooting

### Build Failures

- Check Node.js version matches `>=20`
- Clear `.next` directory and rebuild
- Verify all dependencies installed: `pnpm install`

### Runtime Errors

- Verify environment variables are set correctly
- Check API backend is accessible
- Review browser console for client-side errors

### API Connection Issues

- Verify `API_URL` is correct
- Confirm `API_KEY` has correct permissions
- Check network connectivity to backend
