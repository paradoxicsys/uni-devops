# Security notes

| File | Used by | Purpose |
|---|---|---|
| `.semgrep.yml` | SAST job | 6 custom rules (eval, child_process exec, reflected input, missing helmet, hard-coded credential, non-constant-time token compare) + `p/javascript`, `p/nodejs`, `p/secrets` |
| `.gitleaks.toml` | Secret scan job | default rules + `final-app-api-token` (`fda_` + 32 hex) + private-key rule; allowlist only for the documented dummy demo values |
| `.trivyignore` | SCA + image scan | accepted CVEs with reason - currently empty |

Gate policy: any SAST finding, HIGH/CRITICAL dependency issue, leaked secret, or fixable HIGH/CRITICAL image CVE fails the Security Gate, so nothing is pushed or deployed.
Hardening in the image/manifests: multi-stage build, npm removed from runtime, non-root uid 1000, read-only root FS, all capabilities dropped, seccomp RuntimeDefault, PSS `restricted` namespace, secrets only via Secret objects.
