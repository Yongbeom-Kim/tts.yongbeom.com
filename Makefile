SHELL=/bin/bash
MAKEFLAGS += --no-print-directory

BRANCH=$(shell git rev-parse --abbrev-ref HEAD)

ifeq "$(BRANCH)" "main"
ENV=production
else ifeq "$(BRANCH)" "dev"
ENV=staging
else
ENV=development
endif

ifeq "$(AUTO)" ""
TF_AUTO_APPROVE_FLAG=
else
TF_AUTO_APPROVE_FLAG=-auto-approve
endif

ifeq "$(SILENT)" ""
FD_REDIRECT=
else
FD_REDIRECT=&> /dev/null
endif

AWS_IAM_KEY=$(shell $(MAKE) tofu_backend_output VAR=iam_access_key_id)
AWS_IAM_SECRET_KEY=$(shell $(MAKE) tofu_backend_output VAR=iam_access_key_secret)
TF_BACKEND_S3_NAME=$(shell $(MAKE) tofu_backend_output VAR=s3_bucket_name)
AWS_REGION=$(shell $(MAKE) tofu_backend_output VAR=aws_region)
TF_BACKEND_DYNAMODB_TABLE=$(shell $(MAKE) tofu_backend_output VAR=dynamodb_table_name)
TF_BACKEND_KEY=terraform.tfstate

TF_VARS=-var='aws_iam_access_key=$(AWS_IAM_KEY)' \
-var='aws_iam_secret_key=$(AWS_IAM_SECRET_KEY)' \
-var='backend_bucket=$(TF_BACKEND_S3_NAME)' \
-var='backend_region=$(AWS_REGION)' \
-var='backend_table=$(TF_BACKEND_DYNAMODB_TABLE)' \
-var='backend_key=$(TF_BACKEND_KEY)' \
-var='environment=$(ENV)'


# Infrastucture (Terraform)

## Terraform Backend
decrypt:
	@./scripts/sops.sh decrypt $(FD_REDIRECT)

encrypt:
	@./scripts/sops.sh encrypt $(FD_REDIRECT)

decrypt_and_run:
	@./scripts/sops.sh decrypt_and_run $(COMMAND)

_tofu_backend:
	./scripts/sops.sh decrypt_and_run "set -a && source env/.global.env && source env/.$(ENV).env && set +a && cd terraform/backend && tofu $(COMMAND)"

tofu_backend_deploy: 
	$(MAKE) _tofu_backend COMMAND='init'
	$(MAKE) _tofu_backend COMMAND='plan'
	$(MAKE) _tofu_backend COMMAND='apply $(TF_AUTO_APPROVE_FLAG)'

tofu_backend_destroy: 
	$(MAKE) _tofu_backend COMMAND='destroy $(TF_AUTO_APPROVE_FLAG)'

tofu_backend_output:
	@$(MAKE) --no-print-directory decrypt_and_run COMMAND='cat terraform/backend/terraform.tfstate | jq -r .outputs.$(VAR).value'


## Terraform

_tofu:
	@./scripts/sops.sh decrypt_and_run \
		"set -a && source env/.global.env && source env/.$(ENV).env && set +a && \
		cd terraform && tofu $(COMMAND)"

tofu:
	@$(MAKE) _tofu COMMAND='$(COMMAND) $(TF_VARS)'

tofu_init:
	@$(MAKE) _tofu COMMAND='init $(TF_VARS)'

tofu_select_workspace: tofu_init
	@$(MAKE) _tofu COMMAND='workspace select $(TF_VARS) -or-create=true $(ENV)'

tofu_plan: tofu_select_workspace
	@$(MAKE) _tofu COMMAND='plan $(TF_VARS)'

tofu_deploy: tofu_select_workspace
	@$(MAKE) _tofu COMMAND='apply $(TF_VARS) $(TF_AUTO_APPROVE_FLAG)'

tofu_destroy: tofu_select_workspace
	@$(MAKE) _tofu COMMAND='destroy $(TF_VARS) $(TF_AUTO_APPROVE_FLAG)'

tofu_state:
	@$(MAKE) _tofu COMMAND='state pull $(TF_VARS)'

tofu_output_variable:
	@$(MAKE) tofu_state | jq -r .outputs.$(VAR).value


# Application
dev_frontend:

dev_backend:

