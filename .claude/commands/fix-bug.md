# Fix Bug

Fix the bug in: $ARGUMENTS

## Steps to Follow

1. **Read** the file or code carefully
2. **Identify** the root cause of the bug — do not guess
3. **Fix** only what is broken — do not refactor unrelated code
4. **Verify** the fix does not break anything else nearby
5. **Explain** in a short paragraph:
   - What was wrong
   - Why it was wrong
   - What you changed and why

## Rules
- Change the minimum amount of code needed to fix the bug
- Do not rename variables, restructure code, or refactor while fixing
- Do not introduce new dependencies to fix a simple bug
- After fixing, run: pnpm run lint to make sure no new errors
- If the bug is in backend, make sure the fix follows NestJS patterns from backend/CLAUDE.md
- If the bug is in frontend, make sure the fix follows React patterns from frontend/CLAUDE.md

## Output Format
```
🐛 Root Cause:
[Explain what was wrong]

✅ Fix Applied:
[Explain what you changed]

📁 Files Changed:
- path/to/file.ts
```
