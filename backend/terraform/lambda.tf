variable "backend_lambda_function_name" {
  type = string
}

variable "backend_lambda_iam_role_name" {
  type = string
}

data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

data "aws_iam_policy_document" "lambda_logs_policy" {
  statement {
    effect = "Allow"

    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]

    resources = ["*"]
  }
}

resource "aws_iam_role" "iam_for_lambda" {
  name               = var.backend_lambda_iam_role_name
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
  inline_policy {
    name   = "lambda_logs_policy"
    policy = data.aws_iam_policy_document.lambda_logs_policy.json

  }
}

resource "aws_lambda_function" "backend" {
  # If the file is not in the current working directory you will need to include a
  # path.module in the filename.
  function_name = var.backend_lambda_function_name
  description   = "A Lambda function for the backend of the tts.yongbeom.com web application."
  role          = aws_iam_role.iam_for_lambda.arn

  package_type = "Image"
  image_uri = "${aws_ecr_repository.backend_lambda.repository_url}:latest"

  source_code_hash = docker_registry_image.backend_image.sha256_digest
}

resource "aws_lambda_function_url" "backend_url" {
  function_name      = aws_lambda_function.backend.function_name
  authorization_type = "NONE"

  cors {
    # allow_methods = ["GET", "POST"]
    allow_methods = ["*"]
    allow_origins = ["*"]
    allow_headers = ["*"]
  }
}

output "backend_lambda_url" {
  value = aws_lambda_function_url.backend_url.function_url
}