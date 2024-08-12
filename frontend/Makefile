backend_tfstate_path:=../backend/terraform/terraform.tfstate
backend_path:=$(shell terraform output -raw -state=$(backend_tfstate_path) backend_lambda_url)

.PHONY: unit_test

dev:
	yarn run dev

serve:
	yarn run dev --mode production

build:
	@ printf "VITE_BACKEND_ROUTE=$(backend_path)" > .env.production
	@ yarn run build --mode production

# FIXME: something wrong with this test, it just fails
# test_prod:
# 	@ set -a && . ./.env.production && set +a && \
# 	yarn vitest run

unit_test:
	@ set -a && . ./.env.development && set +a && \
	yarn vitest run

# Terraform

init:
	@ set -a && . ./.env.terraform && set +a && \
	cd terraform && terraform init

plan: init
	@ set -a && . ./.env.terraform && set +a && \
	cd terraform && terraform plan

apply: init build
	@ set -a && . ./.env.terraform && set +a && \
	cd terraform && terraform apply -auto-approve
