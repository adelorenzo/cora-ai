# Branch Protection Guidelines

## Protected Branches

### main
- **Purpose**: Production-ready code
- **Protection Rules**:
  - ❌ Direct pushes disabled (use feature branches)
  - ✅ Pull requests required
  - ✅ Code review required before merge
  - ✅ Must be up-to-date before merging
  - ✅ Status checks must pass

### stable-v1.0.0
- **Purpose**: Frozen stable release
- **Protection Rules**:
  - ❌ NO modifications allowed
  - ❌ Force pushes disabled
  - ❌ Deletion disabled
  - ✅ Read-only reference branch

## Gitea Branch Protection Setup

To configure in Gitea (https://git.oe74.net):

1. Navigate to Settings → Branches
2. Add protection rule for `main`:
   - Enable protection
   - Disable direct push
   - Require pull request reviews: 1
   - Dismiss stale reviews
   - Block force push

3. Add protection rule for `stable-v1.0.0`:
   - Enable protection
   - Disable all push access
   - Block deletion
   - Block force push

## Development Workflow

```bash
# Create feature branch
git checkout main
git pull origin main
git checkout -b feature/your-feature

# Make changes
git add .
git commit -m "feat: description"

# Push and create PR
git push origin feature/your-feature
# Create PR via Gitea UI

# After PR approval and merge
git checkout main
git pull origin main
git branch -d feature/your-feature
```

## Emergency Recovery

If you need to restore stable version:
```bash
# Option 1: From tag
git fetch --all --tags
git checkout v1.0.0-stable

# Option 2: From branch
git checkout stable-v1.0.0

# Option 3: Reset main to stable
git checkout main
git reset --hard v1.0.0-stable
git push --force-with-lease origin main  # Only if absolutely necessary
```

## Version Tags

- `v1.0.0-stable` - Current stable release (2025-01-11)
  - React UI with WebLLM/WASM
  - 100+ model support
  - Bright gradient theme

## Backup Strategy

1. **Git Tags**: Immutable references to specific commits
2. **Stable Branches**: Protected branches for each major release
3. **Remote Repository**: Gitea at https://git.oe74.net/adelorenzo/webgpu-webllm-app.git
4. **Local Backups**: Keep local clones of stable versions

## Do's and Don'ts

### Do's ✅
- Always work in feature branches
- Tag releases before major changes
- Document breaking changes
- Test thoroughly before merging to main
- Keep stable branches untouched

### Don'ts ❌
- Never force push to main or stable branches
- Don't commit directly to protected branches
- Avoid deleting tags or stable branches
- Don't merge untested code
- Never modify history on shared branches