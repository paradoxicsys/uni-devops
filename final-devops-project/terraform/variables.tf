variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Prefix for resource names"
  type        = string
  default     = "uni-devops-final"
}

variable "vpc_cidr" {
  description = "CIDR block of the VPC"
  type        = string
  default     = "10.30.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block of the public subnet"
  type        = string
  default     = "10.30.1.0/24"
}

variable "allowed_http_cidr" {
  description = "Who may reach HTTP on the demo instance (set to your own IP/32)"
  type        = string
  default     = "0.0.0.0/0"
}

variable "create_instance" {
  description = "Create a short-lived t3.micro demo instance"
  type        = bool
  default     = false
}

variable "instance_type" {
  description = "EC2 instance type (free-tier eligible)"
  type        = string
  default     = "t3.micro"
}
