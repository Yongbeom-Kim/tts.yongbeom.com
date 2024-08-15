.PHONY: test

ifeq "$(ENABLE_FLASK_CORS)" ""
ENABLE_FLASK_CORS := 0
endif

PYTHON_COMPONENT_TEST_VENV=.component_test.venv

dev:
	@ set -a && . ../env/.env.development && . ../env/.global.env && set +a && \
		flask --app src.app:app run -h localhost -p 8080

unit_test:
	-cd .. && ./scripts/sops.sh decrypt
	@ set -a && . ../env/.env.development && . ../env/.global.env && set +a && \
		pytest test/unit
	cd .. && ./scripts/sops.sh encrypt

docker_run:
	docker run -it -p 8080:8080 $(shell docker images -q | head -n 1)

docker_run_bash:
	docker run -it --entrypoint /bin/bash $(shell docker images -q | head -n 1)

component_test:
	-cd .. && ./scripts/sops.sh decrypt
	@ set -a && . ../env/.env.development && . ../env/.global.env && DOCKER_IMAGE_TAG=$(shell docker images -q | head -n 1) set +a && \
		pytest test/component
	cd .. && ./scripts/sops.sh encrypt
