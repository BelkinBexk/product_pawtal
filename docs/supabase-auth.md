# Supabase Authentication — Pawtal Prototype

> Document type: Technical Reference  
> Scope: Login & Forgot Password  
> Last updated: 2026-04-06

---

## 1. What is Supabase Auth?

Supabase Auth is a fully managed authentication service built on top of PostgreSQL. It handles:

- User registration and login (email/password, OAuth, magic link, OTP)
- Session management via JWT tokens
- Secure password reset via email
- Row Level Security (RLS) integration — every DB query automatically knows who the user is

Pawtal uses **email + password** authentication for pet owners.

---

## 2. How It's Set Up in This Project

### 2.1 Environment Variables

Stored in `.env.local` (never committed to git):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

| Variable | What it is |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your project's unique API endpoint |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public key — safe to expose in browser. Only gives access what RLS allows |

### 2.2 Supabase Client (`lib/supabase.ts`)

```ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

This single client instance is imported wherever auth or database calls are needed.

---

## 3. Login Flow

### 3.1 What Happens Step by Step

```
User fills email + password
        ↓
[Log In] button clicked
        ↓
supabase.auth.signInWithPassword({ email, password })
        ↓
Supabase verifies credentials against auth.users table
        ↓
  ┌─ Success ──────────────────────────────────────────┐
  │  Supabase returns: { data: { user, session }, error: null } │
  │  Session (JWT) stored in browser localStorage      │
  │  User redirected to home page "/"                  │
  └────────────────────────────────────────────────────┘
        ↓
  ┌─ Failure ──────────────────────────────────────────┐
  │  Supabase returns: { data: null, error: { message } }      │
  │  Error message displayed in red banner on the form │
  └────────────────────────────────────────────────────┘
```

### 3.2 Code Used (`app/login/page.tsx`)

```ts
const { error } = await supabase.auth.signInWithPassword({ email, password });

if (error) {
  setError(error.message); // e.g. "Invalid login credentials"
  return;
}

router.push("/"); // Redirect on success
```

### 3.3 Common Error Messages

| Supabase Error | Meaning |
|---|---|
| `Invalid login credentials` | Wrong email or password |
| `Email not confirmed` | User signed up but hasn't verified email yet |
| `Too many requests` | Rate limited — too many failed attempts |

### 3.4 Session Persistence

After a successful login, Supabase stores the session in `localStorage` automatically. On any page you can check the current user with:

```ts
const { data: { user } } = await supabase.auth.getUser();
```

---

## 4. Forgot Password Flow

### 4.1 What Happens Step by Step

```
User enters their registered email
        ↓
[Send Reset Link] clicked
        ↓
supabase.auth.resetPasswordForEmail(email, { redirectTo })
        ↓
Supabase sends an email with a secure one-time link
        ↓
UI switches to confirmation state ("Check your inbox")
        ↓
User clicks the link in their email
        ↓
Redirected to: /reset-password?token=...
        ↓
supabase.auth.updateUser({ password: newPassword })
        ↓
Password updated — user redirected to login
```

### 4.2 Code Used (`app/forgot-password/page.tsx`)

```ts
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`,
});

if (error) {
  setError(error.message);
  return;
}

setSent(true); // Show confirmation state
```

### 4.3 The `redirectTo` Parameter

This is the URL Supabase embeds inside the reset email link. When the user clicks it:

1. They land on `/reset-password` in your app
2. Supabase automatically extracts the token from the URL hash
3. Your `/reset-password` page calls `supabase.auth.updateUser({ password })` to set the new password

> **Important:** The `redirectTo` domain must be whitelisted in:  
> Supabase Dashboard → Authentication → URL Configuration → Redirect URLs

### 4.4 What if the Email Isn't Registered?

Supabase **does not reveal** whether an email exists in the system (security best practice). The confirmation state is always shown, even for unknown emails — this prevents email enumeration attacks.

---

## 5. Security Notes

| Topic | Detail |
|---|---|
| **Anon key is safe to expose** | It only allows what Row Level Security permits. Cannot bypass RLS. |
| **Service role key is secret** | Never use in the browser. Only in server-side code (API routes, Edge Functions). |
| **Passwords** | Hashed with bcrypt by Supabase. Pawtal never sees raw passwords. |
| **JWT expiry** | Access token expires in 1 hour by default. Supabase auto-refreshes via the refresh token. |
| **Rate limiting** | Supabase rate-limits login attempts automatically to prevent brute force. |

---

## 6. Supabase Dashboard — Where to Configure

| Setting | Location |
|---|---|
| Enable/disable email auth | Authentication → Providers → Email |
| Redirect URL whitelist | Authentication → URL Configuration |
| Email templates (reset, confirm) | Authentication → Email Templates |
| View all users | Authentication → Users |
| Check auth logs | Logs → Auth Logs |

---

## 7. Next Steps After This

| Step | What to build |
|---|---|
| `/reset-password` page | Handles the token from the email link, calls `supabase.auth.updateUser({ password })` |
| Sign up page | `supabase.auth.signUp({ email, password })` + email confirmation flow |
| Auth guard | Redirect unauthenticated users away from protected pages using `supabase.auth.getSession()` |
| User profile | Read from `supabase.auth.getUser()` + join with custom `profiles` table |

---

## 8. Useful References

- Supabase Auth JS Docs: https://supabase.com/docs/reference/javascript/auth-signinwithpassword
- Password Reset Guide: https://supabase.com/docs/guides/auth/passwords
- Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
