aws_region         = "ap-south-1"
project_name       = "uni-devops-s19"
vpc_cidr           = "10.20.0.0/16"
public_subnet_cidr = "10.20.1.0/24"
instance_type      = "t3.micro"

common_tags = {
  Project   = "uni-devops-homework"
  Owner     = "shambhu"
  ManagedBy = "terraform"
}
