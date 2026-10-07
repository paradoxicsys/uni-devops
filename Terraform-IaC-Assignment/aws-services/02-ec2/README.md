# EC2 - Elastic Compute Cloud

**What:** Resizable virtual machines (instances) in the cloud, billed per second.

| Concept | Meaning |
|---------|---------|
| **AMI** | Image (OS + software) an instance boots from, e.g. Amazon Linux 2023, Ubuntu |
| **Instance type** | CPU/RAM size: `t3.micro` (burstable), `c` compute, `m` general, `r` memory |
| **Key pair** | SSH public key placed on the instance; you keep the private `.pem` |
| **Security group** | Stateful firewall on the instance (allow rules only) |
| **EBS** | Network block storage volume (root disk + extra disks), snapshots for backup |
| **Public IP** | Internet-reachable, changes on stop/start (use Elastic IP for a fixed one) |
| **Private IP** | Inside the VPC only, stays for the instance's lifetime |

**Lifecycle:** `pending -> running -> stopping -> stopped -> (start) running` ... `shutting-down -> terminated`.
Stopped = no compute charge (EBS still billed); terminated = gone.

**Use cases:** web/app servers, CI runners, batch jobs, bastion hosts, self-managed databases.

```bash
aws ec2 describe-instance-types --filters Name=free-tier-eligible,Values=true \
  --query 'InstanceTypes[].[InstanceType,VCpuInfo.DefaultVCpus,MemoryInfo.SizeInMiB]' --output table
```
```text
|  t3.micro       |  2 |  1024  |
|  t4g.micro      |  2 |  1024  |
|  t3.small       |  2 |  2048  |
...
```
```bash
aws ec2 describe-images --owners amazon --filters 'Name=name,Values=al2023-ami-2023.*-x86_64' \
  --query 'sort_by(Images,&CreationDate)[-1].[ImageId,Name]' --output text
```
```text
ami-0a59fb4395466ed05   al2023-ami-2023.12.20260930.0-kernel-6.12-x86_64
```
