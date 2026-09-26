# Maintained adapters

Codex, ChatGPT Work, and Pi are maintained surfaces. Each translates the same [Direct and Controlled kernel](../playbook.md) and maintained [GPT-6 profile](../profiles/gpt-6.md); none implies a route the runtime does not expose.

| Surface | Installation path | Use |
| --- | --- | --- |
| Codex | Review and merge [adapters/codex/AGENTS.md](../adapters/codex/AGENTS.md) into the target repository's AGENTS.md. Optionally review [profiles/codex/](../profiles/codex/) before copying selected settings into the target .codex directory. | Repository-editing tasks. |
| ChatGPT Work | Paste [adapters/chatgpt/instructions.md](../adapters/chatgpt/instructions.md) into project instructions. Optionally attach the [profile](../profiles/gpt-6.md) and [templates](../templates/contract.md). | Workspaces that need project instructions and attached evidence. |
| Pi | Install the package using the source syntax supported by your Pi version; see [Pi](#pi) below. | Loads a skill that reads the packaged canonical kernel and profile. |

## Pi

The npm package declares `./adapters/pi` as a Pi skill resource. Installing the package adds the non-colliding `agentic-delivery-playbook-pi` skill; it does not install executable extensions or change project/global model settings.

To try an unmerged checkout or PR branch, install its local worktree path with `pi install /path/to/agentic-delivery-playbook`. After merge, install the repository's default branch with `pi install git:github.com/arcayne/agentic-delivery-playbook`; after publication, install the npm package with `pi install npm:agentic-delivery-playbook`. Update by installing the desired source again or using `pi update <source>`. Verify the installed package with `pi list` and the exact CLI help for your Pi version.

Use the skill with `/skill:agentic-delivery-playbook-pi` in a Pi session. It reads `playbook.md` and `profiles/gpt-6.md` from the installed package rather than embedding copies. Installing the skill does not configure a model, effort, worker, or reviewer, nor guarantee a particular route when higher-precedence project/user settings or per-run overrides exist. Verify Pi runtime capabilities and the effective route independently; record `runtime-default` or `unknown` when not exposed.

[The optional settings template](../templates/pi-settings.template.json) documents GPT-6 Luna High for worker and GPT-6 Sol Medium for reviewer. It is a reference only: review and merge it deliberately into the appropriate settings. Package installation does not apply it or overwrite settings automatically.

Historical adapters are unsupported and preserved only in [legacy/README.md](../legacy/README.md).
