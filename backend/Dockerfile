FROM public.ecr.aws/docker/library/python:3.12.1-slim
ARG aws_public_key
ARG aws_secret_key

COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.1 /lambda-adapter /opt/extensions/lambda-adapter

WORKDIR /var/task
COPY requirements.txt .
RUN python -m pip install -r requirements.txt
COPY --link . .

ENV AWS_PUBLIC_KEY=$aws_public_key
ENV AWS_SECRET_KEY=$aws_secret_key
# CORS should be handled by lambda.
# Value is overridden to 1 in dev script
ENV ENABLE_FLASK_CORS=0 
CMD ["gunicorn", "src.app:app", "-b=:8080", "-w=1", "-c", "./gunicorn.conf.py"]