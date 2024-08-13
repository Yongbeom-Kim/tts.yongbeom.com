.PHONY: test

ifeq "$(ENABLE_FLASK_CORS)" ""
ENABLE_FLASK_CORS := 0
endif

PYTHON_COMPONENT_TEST_VENV=.component_test.venv

dev:
	@ set -a && . ../env/.env.development && . ../env/.global.env && set +a && \
		flask --app src.app:app run -h localhost -p 5000

test:
	pytest