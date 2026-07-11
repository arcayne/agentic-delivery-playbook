# Public run report sanitization checklist

Before publishing a run report, verify:

- [ ] No raw session JSONL is included.
- [ ] No raw prompts with sensitive/private project context are included.
- [ ] No secrets, API keys, tokens, cookies, credentials, or env values are included.
- [ ] No private customer/user data is included.
- [ ] No raw provider responses are included.
- [ ] Screenshots, if any, do not reveal private dashboards, billing, accounts, chat IDs, or unrelated projects.
- [ ] Paths are repo-relative or sanitized.
- [ ] Commit SHAs and validation commands are accurate.
- [ ] Model/agent labels are actual recorded routes, not assumptions.
- [ ] Missing cost/pricing/quota data is marked `unknown`.
- [ ] Failed/rejected/duplicative lanes are included.
- [ ] Public artifacts were manually reviewed.

Reviewer:
Date:
Notes:
