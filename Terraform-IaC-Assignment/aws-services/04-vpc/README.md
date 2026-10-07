# VPC - Virtual Private Cloud

**What:** Your own isolated network inside an AWS region.

| Concept | Meaning |
|---------|---------|
| **CIDR** | IP range of the VPC/subnet, e.g. VPC `10.0.0.0/16` (65,536 IPs), subnet `10.0.1.0/24` (256) |
| **Subnet** | Slice of the VPC CIDR in **one** Availability Zone |
| **Route table** | Rules deciding where traffic goes; associated with subnets |
| **Internet Gateway** | Lets a VPC talk to the internet (both directions) |
| **NAT Gateway** | Lets private subnets reach the internet **outbound only** (billed hourly) |
| **Security group** | Stateful, instance-level, allow rules only |
| **NACL** | Stateless, subnet-level, allow + deny rules, numbered order |

**Public vs private subnet**

| | Public subnet | Private subnet |
|--|--|--|
| Route `0.0.0.0/0` | -> Internet Gateway | -> NAT Gateway (or none) |
| Public IP | Yes | No |
| Typical use | Load balancers, bastion, web | App servers, databases |

```bash
aws ec2 describe-vpcs --filters Name=is-default,Values=true --query 'Vpcs[].[VpcId,CidrBlock]' --output table
aws ec2 describe-subnets --filters Name=default-for-az,Values=true \
  --query 'Subnets[].[AvailabilityZone,CidrBlock,MapPublicIpOnLaunch]' --output table
```
```text
|  ap-south-1a |  172.31.32.0/20  |  True |
|  ap-south-1b |  172.31.0.0/20   |  True |
|  ap-south-1c |  172.31.16.0/20  |  True |
```

Terraform build of a VPC + public subnet + IGW + route table + SG: [../../../Cloud-Terraform-Assignment](../../../Cloud-Terraform-Assignment).
