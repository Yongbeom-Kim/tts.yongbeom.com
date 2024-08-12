variable "s3_bucket_name" {
  type = string
}

variable "canonical_owner_id" {
  type = string
}

resource "aws_s3_bucket" "upload_bucket" {
  bucket        = var.s3_bucket_name
  force_destroy = true
}

resource "aws_s3_bucket_cors_configuration" "upload_bucket" {
  bucket = aws_s3_bucket.upload_bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "GET", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = []
  }
}

resource "aws_s3_bucket_ownership_controls" "upload_bucket" {
  bucket = aws_s3_bucket.upload_bucket.id
  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_policy" "allow_access_from_iam_account" {
  bucket = aws_s3_bucket.upload_bucket.id
  policy = data.aws_iam_policy_document.allow_access_from_iam_account.json
}

data "aws_iam_policy_document" "allow_access_from_iam_account" {
  statement {
    effect = "Allow"

    principals {
      type        = "AWS"
      identifiers = [aws_iam_user.backend_user.arn]
    }

    actions = [
      "s3:PutObject",
      "s3:GetObject",
      "s3:ListBucket",
      "s3:DeleteObject",
    ]

    resources = [
      aws_s3_bucket.upload_bucket.arn,
      "${aws_s3_bucket.upload_bucket.arn}/*",
    ]
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "upload_bucket" {
  bucket = aws_s3_bucket.upload_bucket.id

  rule {
    id = "delete-objects-after-7-days"
    expiration {
      days = 7
    }
    status = "Enabled"
  }
}