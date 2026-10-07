# IAM - Identity and Access Management

**What:** Global AWS service that controls **who** (authentication) can do **what** on **which resources** (authorization). Free.

| Concept | Meaning |
|---------|---------|
| **User** | A person/app with long-term credentials (password and/or access keys) |
| **Group** | Collection of users; attach policies once, all members inherit |
| **Role** | Identity with **temporary** credentials, assumed by EC2, Lambda, other accounts, SSO users |
| **Policy** | JSON document of `Effect` / `Action` / `Resource` / `Condition` |
| **Permissions** | Effective result of all policies; default is **deny**, explicit `Deny` always wins |
| **Least privilege** | Grant only the actions + resources needed, nothing more |

Example least-privilege policy (read one bucket only):

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:GetObject", "s3:ListBucket"],
    "Resource": ["arn:aws:s3:::my-app-bucket", "arn:aws:s3:::my-app-bucket/*"]
  }]
}
```

**Best practices**
- Don't use the root account day-to-day; enable MFA on root and lock its keys away.
- Use groups for humans, roles for workloads (EC2 instance profile instead of access keys on servers).
- Prefer SSO / temporary credentials; rotate any long-term keys.
- Start from AWS managed policies, then tighten with custom ones; review with IAM Access Analyzer.

**Use cases:** developer access per team (groups), EC2 reading S3 (role), CI/CD deploying via OIDC role, cross-account access.

```bash
aws iam get-account-summary --query 'SummaryMap.{Users:Users,Groups:Groups,Roles:Roles,MFA:AccountMFAEnabled}' --output table
aws iam list-attached-user-policies --user-name <user>
```
