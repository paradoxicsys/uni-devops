# DynamoDB and RDS

## DynamoDB (NoSQL)

**What:** Fully managed, serverless key-value / document database with single-digit-ms latency at any scale.

| Concept | Meaning |
|---------|---------|
| **NoSQL** | No fixed schema or joins; each item can have different attributes |
| **Table** | Collection of items |
| **Item** | One record (like a row), max 400 KB |
| **Attribute** | A field of an item (`name`, `price`) |
| **Partition key** | Required; hashed to pick the storage partition. Must be unique if used alone |
| **Sort key** | Optional; with the partition key forms the primary key, enables range queries |

**Use cases:** session store, shopping carts, gaming leaderboards, IoT events, serverless (Lambda) back-ends.

```bash
aws dynamodb create-table --table-name Orders \
  --attribute-definitions AttributeName=customerId,AttributeType=S AttributeName=orderDate,AttributeType=S \
  --key-schema AttributeName=customerId,KeyType=HASH AttributeName=orderDate,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST
aws dynamodb describe-limits --output table
```

## RDS (Relational Database Service)

**What:** Managed relational (SQL) databases; AWS handles patching, backups, failover.

| Concept | Meaning |
|---------|---------|
| **Relational** | Tables with schema, SQL, joins, ACID transactions |
| **Engines** | MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, Aurora (MySQL/Postgres compatible) |
| **DB instance** | The managed DB server, sized by class (`db.t3.micro`, `db.r6g.large`) |
| **Security** | Private subnets (DB subnet group), security groups, KMS encryption at rest, TLS, IAM auth |
| **Backups** | Automated daily snapshots + transaction logs (point-in-time restore, 1-35 days) and manual snapshots |
| **Multi-AZ** | Synchronous standby in another AZ, automatic failover - for **availability** |
| **Read replicas** | Asynchronous copies serving reads - for **read scaling** |

**Use cases:** e-commerce orders, ERP/CRM, any app needing joins and transactions.

```bash
aws rds describe-db-engine-versions --engine postgres --default-only \
  --query 'DBEngineVersions[].[Engine,EngineVersion]' --output text
```
```text
postgres    18.3
```

## DynamoDB vs RDS

| | DynamoDB | RDS |
|--|--|--|
| Model | Key-value / document | Relational tables |
| Query | By key / index | Full SQL, joins |
| Scaling | Automatic, horizontal | Vertical + read replicas |
| Server | Serverless | Managed instance |
