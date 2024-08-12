variable "backend_iam_user_name" {
  type = string
}
variable "backend_iam_user_path" {
  type = string
}

resource "aws_iam_user" "backend_user" {
  name = var.backend_iam_user_name
  path = var.backend_iam_user_path
}

resource "aws_iam_user_policy" "backend_s3_policy" {
  name   = "${var.backend_iam_user_name}-policy"
  user   = aws_iam_user.backend_user.name
  policy = data.aws_iam_policy_document.s3_upload_policy.json
}

data "aws_iam_policy_document" "s3_upload_policy" {
  statement {
    effect = "Allow"

    actions = [
      "s3:PutObject",
      "s3:GetObject",
      "s3:ListBucket",
      "s3:DeleteObject",
    ]

    resources = [
      "${aws_s3_bucket.upload_bucket.arn}",
      "${aws_s3_bucket.upload_bucket.arn}/*",
    ]
  }
}

resource "aws_iam_access_key" "backend_user" {
  user = aws_iam_user.backend_user.name
}

output "backend_iam_arn" {
  value = aws_iam_user.backend_user.arn
}

output "backend_iam_access_key" {
  value     = aws_iam_access_key.backend_user.id
  sensitive = true
}

output "backend_iam_secret_key" {
  value     = aws_iam_access_key.backend_user.secret
  sensitive = true
}