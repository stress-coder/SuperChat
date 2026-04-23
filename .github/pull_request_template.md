## 🔗 Related Issue
Closes #(issue number)

---

## 📋 What does this PR do?
<!-- A clear and short description of what this PR does -->



---

## 🔄 Type of Change
<!-- Put an x inside the [ ] to check it -->

- [ ] 🚀 `feature` — New feature
- [ ] 🐛 `fix` — Bug fix
- [ ] ♻️ `refactor` — Code refactor (no feature or bug fix)
- [ ] 🎨 `style` — Styling / UI changes
- [ ] 📝 `docs` — Documentation update
- [ ] 🔧 `chore` — Config, tooling, dependencies
- [ ] 🐳 `docker` — Docker / infrastructure changes
- [ ] 🔒 `security` — Security fix or improvement

---

## 📸 Screenshots (if UI change)
<!-- Add before/after screenshots if this PR changes the UI -->
<!-- Delete this section if not applicable -->

| Before | After |
|--------|-------|
|        |       |

---

## 🧪 How to Test
<!-- Step by step instructions on how to test this PR -->

1. 
2. 
3. 

---

## ✅ Checklist
<!-- Put an x inside the [ ] to check it. All must be checked before requesting review -->

### General
- [ ] My branch name follows the convention (`feature/*`, `bugfix/*`, `hotfix/*`)
- [ ] My commit messages follow Conventional Commits (`feature:`, `fix:`, `chore:`)
- [ ] I have tested this locally and it works
- [ ] No `console.log` left in the code
- [ ] No commented-out code left behind
- [ ] No hardcoded secrets, API keys, or passwords

### TypeScript
- [ ] No `any` type used
- [ ] No TypeScript errors (`tsc` passes without errors)

### Backend (if applicable)
- [ ] DTOs are created for all request/response shapes
- [ ] All inputs are validated with `class-validator`
- [ ] All routes are protected with `JwtAuthGuard` where needed
- [ ] Errors are handled — no unhandled promise rejections
- [ ] API response follows the standard format `{ statusCode, message, data }`
- [ ] TypeORM migrations are included if schema changed

### Frontend (if applicable)
- [ ] Forms use `react-hook-form` and `zod` validation
- [ ] Loading and error states are handled
- [ ] No broken UI on different screen sizes (responsive)
- [ ] API errors are shown to the user clearly

---

## 📝 Additional Notes
<!-- Anything else the reviewer should know? Any known issues? Future improvements? -->
<!-- Delete this section if not applicable -->
