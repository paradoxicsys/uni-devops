# S3 - Simple Storage Service

**What:** Object storage with 11 nines durability; store any file over HTTP(S).

| Concept | Meaning |
|---------|---------|
| **Bucket** | Container with a globally unique name, lives in one region |
| **Object** | File + metadata, addressed by a key (`images/logo.png`), up to 5 TB |
| **Storage classes** | Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant / Flexible / Deep Archive |
| **Versioning** | Keeps every version of an object; protects against overwrite/delete |
| **Lifecycle rules** | Auto-move objects to cheaper classes or expire them after N days |
| **Encryption** | SSE-S3 (AES256, default), SSE-KMS, SSE-C; enforce TLS in transit |
| **Bucket policy** | Resource-based JSON policy (e.g. deny non-HTTPS, allow CloudFront) |
| **Block Public Access** | Account/bucket switch that overrides any public ACL/policy |

**Use cases:** static website hosting, backups, logs, data lake, Terraform remote state, artifact storage.

```bash
aws s3 mb s3://my-unique-bucket-123 --region ap-south-1
aws s3api put-bucket-versioning --bucket my-unique-bucket-123 --versioning-configuration Status=Enabled
aws s3 cp file.txt s3://my-unique-bucket-123/
```

Terraform version of all of this: [../../terraform-s3-demo](../../terraform-s3-demo).
