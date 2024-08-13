variable "backend_lambda_ecr_name" {
  type        = string
  description = "The name of the ECR repository for the backend lambda container."
}

resource "aws_ecr_repository" "backend_lambda" {
  name = var.backend_lambda_ecr_name

  image_tag_mutability = "MUTABLE"
  force_delete         = true
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "null_resource" "copy_env_file" {
  triggers = {
    always_run = timestamp()
  }

  provisioner "local-exec" {
    command = "cp ${path.root}/../env/.env.${terraform.workspace} ${path.module}/../.env"
  }
}
### Build and push docker
data "aws_ecr_authorization_token" "token" {}

resource "docker_image" "backend_image" {
  name = "${aws_ecr_repository.backend_lambda.repository_url}:latest"
  build {
    context    = "${path.module}/../"
    # dockerfile = "${path.module}/../Dockerfile"
    tag        = ["${aws_ecr_repository.backend_lambda.repository_url}:latest"]
    build_args = {
      env_file = "${path.module}/../.env"
      AWS_PUBLIC_KEY = aws_iam_access_key.backend_user.id
      AWS_SECRET_KEY = aws_iam_access_key.backend_user.secret
    }
  }
  force_remove = true

  triggers = {
    run_always = timestamp()
  }

  depends_on = [ null_resource.copy_env_file ]
}

resource "docker_registry_image" "backend_image" {
  name          = docker_image.backend_image.name
  keep_remotely = true

  triggers = {
    image = docker_image.backend_image.repo_digest
  }
}