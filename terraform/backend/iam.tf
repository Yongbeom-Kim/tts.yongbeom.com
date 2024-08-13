resource "aws_iam_user" "terraform_backend" {
  name = "${local.project_resource_prefix}-backend-terraform-user"
  path = "/terraform/"
}

resource "aws_iam_user_policy" "terraform_backend" {
  name   = "${aws_iam_user.terraform_backend.name}-policy"
  user   = aws_iam_user.terraform_backend.name
  policy = data.aws_iam_policy_document.terraform_backend.json
}


data "aws_iam_policy_document" "terraform_backend" {
  statement {
    effect    = "Allow"
    actions   = ["*"]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      variable = "aws:ResourceTag/ManagedBy"
      values   = ["Terraform"]
    }
    condition {
      test     = "StringEquals"
      variable = "aws:ResourceTag/ProjectName"
      values   = [var.project_name]
    }
  }

  statement {
    effect    = "Allow"
    actions   = ["s3:*"]
    resources = ["arn:aws:s3:::${local.project_resource_prefix}*", "arn:aws:s3:::${local.project_resource_prefix}*/*"]
  }

  statement {
    effect    = "Allow"
    actions   = ["dynamodb:*"]
    resources = [
      aws_dynamodb_table.backend_lock.arn,
    ]
  }

  statement {
    effect = "Allow"
    actions = ["s3:*"]
    resources = [
      aws_s3_bucket.backend.arn,
      "${aws_s3_bucket.backend.arn}/*"
    ]
  }

  statement {
    effect    = "Allow"
    actions   = ["ecr:*"]
    resources = ["arn:aws:ecr:${data.aws_region.region.name}:${data.aws_caller_identity.current.account_id}:repository/${local.project_resource_prefix}*"]
  }

  statement {
    effect    = "Allow"
    actions   = ["ecr:GetAuthorizationToken"]
    resources = ["*"]
  }

  statement {
    effect    = "Allow"
    actions   = ["iam:PassRole"]
    resources = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${local.project_resource_prefix}*"]
  }

  statement {
    effect    = "Allow"
    actions   = ["route53:*"] 
    resources = ["*"]
  }

  statement {
    effect = "Deny"
    actions = ["route53:CreateHostedZone", "route53:DeleteHostedZone"]
    resources = ["*"]
  }

  statement {
    effect = "Allow"
    actions = ["cloudfront:*"]
    resources = [
      "arn:aws:cloudfront::${data.aws_caller_identity.current.account_id}:origin-access-identity/*",
      "arn:aws:cloudfront::${data.aws_caller_identity.current.account_id}:cache-policy/*",
      "arn:aws:cloudfront::${data.aws_caller_identity.current.account_id}:distribution/${local.project_resource_prefix}*"
    ]
  }
}

resource "aws_iam_access_key" "terraform_backend" {
  user = aws_iam_user.terraform_backend.name
}

output "iam_access_key_id" {
  value     = aws_iam_access_key.terraform_backend.id
  sensitive = true
}

output "iam_access_key_secret" {
  value     = aws_iam_access_key.terraform_backend.secret
  sensitive = true
}