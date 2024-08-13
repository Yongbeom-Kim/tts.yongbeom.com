variable "aws_iam_access_key" {
  description = "value of the AWS IAM access key"
  type        = string
}

variable "aws_iam_secret_key" {
  description = "value of the AWS IAM secret key"
  type        = string
}

variable "backend_bucket" {
  description = "The name of the S3 bucket to use for the Terraform backend."
  type        = string
}

variable "backend_key" {
  description = "The name of the key to use for the Terraform backend."
  type        = string
}

variable "backend_region" {
  description = "The region to deploy the Terraform backend to."
  type        = string
}

variable "backend_table" {
  description = "The name of the DynamoDB table to use for the Terraform backend."
  type        = string
}

variable "environment" {
    description = "The environment to deploy to. Can be dev, stage, or prod."
    type        = string
    validation {
        condition = contains(["dev", "stage", "prod"], var.environment)
        error_message = "Environment must be one of dev, stage, or prod."
    }
}

variable "project_name" {
  description = "The name of the project"
  type        = string
}


variable "project_resource_prefix" {
  description = "The prefix to use for all project resources"
  type        = string
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.61.0"
    }
  }
  backend "s3" {
    // from terraform_backend/main.tf
    bucket = var.backend_bucket
    key    = var.backend_key
    region = var.backend_region
    dynamodb_table = var.backend_table
  }
}

provider "aws" {
  region = var.backend_region
  access_key = var.aws_iam_access_key
  secret_key = var.aws_iam_secret_key
  default_tags {
    tags = {
      ManagedBy = "Terraform"
      ProjectName = var.project_name
      Environment = var.environment
    }
  }
}