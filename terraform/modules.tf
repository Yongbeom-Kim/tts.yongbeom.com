variable "dns_domain" {
    type = string
}

variable "website_domain" {
    type = string
}

variable "backend_s3_upload_bucket_name" {
    type = string
}

module "backend" {
  source                       = "../backend/terraform"
  backend_lambda_ecr_name      = "${var.project_resource_prefix}-backend"
  s3_upload_bucket_name        = var.backend_s3_upload_bucket_name
  backend_lambda_iam_user_name = "${var.project_resource_prefix}-backend-terraform-user"
  backend_lambda_iam_user_path = "/${var.project_resource_prefix}/"
  backend_lambda_function_name = "${var.project_resource_prefix}-backend"
  backend_lambda_iam_role_name = "${var.project_resource_prefix}-backend-role"
}

module "frontend" {
    source = "../frontend/terraform"
    dns_domain = var.dns_domain
    website_domain = var.website_domain
    website_bucket_name = "${var.project_resource_prefix}-frontend"
    aws_region = var.backend_region
    cloudfront_cache_policy_name = "${var.project_resource_prefix}-frontend-cache-policy"
}

# output "backend_iam_arn" {
#   value     = module.backend.backend_iam_arn
#   sensitive = true
# }

# output "backend_iam_access_key" {
#   value     = module.backend.backend_iam_access_key
#   sensitive = true
# }

# output "backend_iam_secret_key" {
#   value     = module.backend.backend_iam_secret_key
#   sensitive = true
# }

