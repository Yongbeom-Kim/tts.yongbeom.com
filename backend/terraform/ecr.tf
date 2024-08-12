variable "backend_lambda_container_ecr_name" {
  type        = string
  description = "The name of the ECR repository for the backend lambda container."
}

resource "aws_ecr_repository" "backend_lambda_container_repo" {
  name                 = var.backend_lambda_container_ecr_name
  image_tag_mutability = "MUTABLE"
  force_delete         = true
  image_scanning_configuration {
    scan_on_push = true
  }
}

### Build and push docker
data "aws_ecr_authorization_token" "token" {}

resource "docker_image" "backend_image" {
  name = "${aws_ecr_repository.backend_lambda_container_repo.repository_url}:latest"
  build {
    context    = "${path.module}/../"
    dockerfile = "${path.module}/../lambda.Dockerfile"
    tag        = ["${aws_ecr_repository.backend_lambda_container_repo.repository_url}:latest"]
    build_args = {
      aws_public_key = aws_iam_access_key.backend_user.id
      aws_secret_key = aws_iam_access_key.backend_user.secret
    }
  }
  force_remove = true

  triggers = {
    run_always = timestamp()
  }
}

resource "docker_registry_image" "backend_image" {
  name          = docker_image.backend_image.name
  keep_remotely = true

  triggers = {
    image = docker_image.backend_image.repo_digest
  }
}