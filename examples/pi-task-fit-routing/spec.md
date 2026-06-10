# Spec: Add OAuth Provider (GitHub)

## Objective

Add GitHub as a new OAuth provider to the authentication system.

## Non-goals

- Do not change existing OAuth providers (Google, Microsoft).
- Do not modify the session model.
- Do not add UI components beyond the provider button.
- Do not change token storage format.

## Current state

The auth module supports OAuth login via Google and Microsoft. Each provider implements `OAuthProvider` interface:

```typescript
interface OAuthProvider {
  name: string;
  getAuthUrl(state: string): string;
  exchangeCode(code: string): Promise<TokenSet>;
  refreshToken(refreshToken: string): Promise<TokenSet>;
}
```

## Architecture decision

GitHub OAuth follows the same interface. Separate file per provider: `src/auth/providers/github.ts`.

## Acceptance criteria

1. `GET /api/auth/github/url` returns a valid GitHub OAuth authorize URL with client_id, redirect_uri, and state.
2. `POST /api/auth/github/callback` exchanges the code for a token set.
3. Token set includes access_token, token_type, and (if available) refresh_token.
4. Existing Google and Microsoft providers continue working unchanged.
5. All existing auth tests pass.

## Verification plan

1. Run `npm test` — all existing tests pass.
2. Run `npm run lint` — no new lint issues.
3. Verify provider registration in `src/auth/providers/index.ts` lists GitHub.

## Implementation checklist

- [ ] Add `src/auth/providers/github.ts` implementing `OAuthProvider`
- [ ] Register GitHub provider in `src/auth/providers/index.ts`
- [ ] Add GitHub client ID and redirect URI to config schema
- [ ] Add route handlers for `/api/auth/github/url` and `/api/auth/github/callback`
- [ ] Run validation and fix failures

## Open questions

- Should GitHub device flow be supported in this pass? (No — deferred.)