terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
  # local state for the homework; a team would use an S3 backend with locking
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project   = "uni-devops-final"
      Owner     = "shambhu"
      ManagedBy = "terraform"
    }
  }
}
