variable "project_name" {
  description = "The name of the project"
  type        = string
}

locals {
  project_resource_prefix = "${replace(var.project_name, ".", "-")}"
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.61.0"
    }
  }
}

provider "aws" {
  default_tags {
    tags = {
      ManagedBy   = "Terraform"
      ProjectName = var.project_name
      Environment = "Terraform Backend"
    }
  }
}

data "aws_region" "region" {

}

data "aws_caller_identity" "current" {

}

output "aws_region" {
  value = data.aws_region.region.name
}