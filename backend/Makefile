.PHONY: test

ifeq "$(ENABLE_FLASK_CORS)" ""
ENABLE_FLASK_CORS := 0
endif

PYTHON_COMPONENT_TEST_VENV=.component_test.venv

flask:
	@ set -a && . ./.env.terraform && set +a && \
		flask --app src.app:app run
dev:
	ENABLE_FLASK_CORS=1 $(MAKE) docker_run

unit_test: 
	COMMAND="pytest -m unit test/unit" $(MAKE) docker_run_cmd

component_test: $(PYTHON_COMPONENT_TEST_VENV)
	@ echo "Building docker image..."
	@ $(MAKE) docker_build > /dev/null
	@ echo "Running component tests..."
	. .test.venv/bin/activate && \
		set -a && . ./.env.terraform && set +a && \
		pytest -m component test/component

## Docker

docker_build:
	DIR=terraform TF_ACTION="apply -target=docker_image.backend_image -auto-approve" $(MAKE) tf
	# @ set -a && . ./.env.terraform && set +a && \
	# 	pip freeze > requirements.txt && \
	# 	docker build \
	# 			-t $${DOCKER_IMAGE_TAG} \
	# 			-f lambda.Dockerfile \
	# 			--build-arg="aws_public_key=$(backend_aws_iam_access_key)" \
	# 			--build-arg="aws_secret_key=$(backend_aws_iam_secret_key)" \
	# 			.

docker_run: docker_build
	@ set -a && . ./.env.terraform && set +a && \
		docker run \
			-p 5000:8080 \
			--env ENABLE_FLASK_CORS=$(ENABLE_FLASK_CORS) \
			$${DOCKER_IMAGE_TAG}

docker_run_cmd: docker_build
	@ set -a && . ./.env.terraform && set +a && \
		docker run -it $${DOCKER_IMAGE_TAG} $(COMMAND)

docker_run_bash: 
	COMMAND=/bin/bash $(MAKE) docker_run_cmd


docker_login:
	@ set -a && . ./.env.terraform && set +a && \
		aws ecr get-login-password --region $${AWS_REGION} | docker login --username AWS --password-stdin $${AWS_ACCOUNT_ID}.dkr.ecr.$${AWS_REGION}.amazonaws.com

docker_push: docker_login docker_build
	@ set -a && . ./.env.terraform && set +a && \
		docker push $${DOCKER_IMAGE_TAG}


## Terraform

tf:
	@ set -a && . ./.env.terraform && set +a && \
		cd $(DIR) && \
		terraform $(TF_ACTION)

init:
	DIR=terraform TF_ACTION=init $(MAKE) tf

plan:
	DIR=terraform TF_ACTION=plan $(MAKE) tf

apply:
	DIR=terraform TF_ACTION="apply -auto-approve" $(MAKE) tf

destroy:
	DIR=terraform TF_ACTION="destroy -auto-approve" $(MAKE) tf

## Utils

fmt:
	terraform fmt -recursive


## Python Environments
$(PYTHON_COMPONENT_TEST_VENV): test/component/requirements.txt
	rm -rf $@
	python3 -m venv $@
	. .test.venv/bin/activate && \
		pip install -r test/component/requirements.txt
