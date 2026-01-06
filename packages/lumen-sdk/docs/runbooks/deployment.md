# Deployment Runbook

This document describes the deployment process for Lumen SDK packages.

## Prerequisites

Before deploying, ensure you have:

- [ ] Node.js 18+ installed
- [ ] pnpm 8+ installed
- [ ] npm registry access with publish permissions
- [ ] Git access to the repository
- [ ] All tests passing locally

## Pre-Deployment Checklist

1. **Verify clean working directory**
   ```bash
   git status
   # Should show no uncommitted changes
   ```

2. **Pull latest changes**
   ```bash
   git checkout main
   git pull origin main
   ```

3. **Install dependencies**
   ```bash
   pnpm install
   ```

4. **Run full test suite**
   ```bash
   pnpm test
   ```

5. **Run build**
   ```bash
   pnpm build
   ```

6. **Verify no lint errors**
   ```bash
   pnpm lint
   ```

## Deployment Steps

### 1. Version Bump

Update version numbers in:
- `packages/lumen-core/package.json`
- `packages/lumen-nextjs/package.json`

Follow semantic versioning:
- **MAJOR**: Breaking API changes
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, backward compatible

### 2. Update Changelog

Document changes in each package's README or CHANGELOG:
- New features
- Bug fixes
- Breaking changes
- Migration instructions (if applicable)

### 3. Create Release Commit

```bash
git add .
git commit -m "chore: release v1.x.x"
```

### 4. Tag Release

```bash
git tag -a v1.x.x -m "Release v1.x.x"
```

### 5. Push Changes

```bash
git push origin main
git push origin v1.x.x
```

### 6. Publish to npm

```bash
# Publish core package first (dependency of adapters)
cd packages/lumen-core
pnpm publish --access public

# Then publish framework adapters
cd ../lumen-nextjs
pnpm publish --access public
```

### 7. Create GitHub Release

1. Go to GitHub Releases
2. Create new release from tag
3. Add release notes
4. Attach any relevant assets

## Verification

After deployment:

1. **Verify npm packages**
   ```bash
   npm view @lumen/core version
   npm view @lumen/nextjs version
   ```

2. **Test installation in fresh project**
   ```bash
   mkdir /tmp/test-lumen
   cd /tmp/test-lumen
   npm init -y
   npm install @lumen/nextjs
   ```

3. **Verify package contents**
   ```bash
   npm pack @lumen/core --dry-run
   npm pack @lumen/nextjs --dry-run
   ```

## Rollback Procedure

If issues are discovered after deployment:

### 1. Deprecate Problematic Version

```bash
npm deprecate @lumen/core@1.x.x "Critical bug, please upgrade to 1.x.y"
npm deprecate @lumen/nextjs@1.x.x "Critical bug, please upgrade to 1.x.y"
```

### 2. Publish Hotfix

1. Create hotfix branch from release tag
   ```bash
   git checkout -b hotfix/1.x.y v1.x.x
   ```

2. Apply fix and test

3. Follow deployment steps with incremented patch version

### 3. Unpublish (Last Resort)

Only within 72 hours of publish, and only if absolutely necessary:

```bash
npm unpublish @lumen/core@1.x.x
```

**Warning:** Unpublishing can break dependent projects. Prefer deprecation.

## Post-Deployment

- [ ] Notify team in Slack/Discord
- [ ] Update documentation if needed
- [ ] Monitor for user-reported issues
- [ ] Update example apps to use new version

## Troubleshooting

### "You do not have permission to publish"

Ensure you're logged in with correct npm account:
```bash
npm whoami
npm login
```

### "Package name already exists"

Verify you're publishing to the correct scope (`@lumen/`).

### Build artifacts missing

Run clean build:
```bash
pnpm clean
pnpm install
pnpm build
```

### Tests failing in CI but not locally

Check for:
- Different Node.js versions
- Missing environment variables
- Platform-specific issues (Windows vs Unix)
