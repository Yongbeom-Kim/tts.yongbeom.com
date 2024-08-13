FROM public.ecr.aws/docker/library/python:3.12.1-slim
ARG AWS_PUBLIC_KEY
ARG AWS_SECRET_KEY
ARG env_file

COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.1 /lambda-adapter /opt/extensions/lambda-adapter

# Create link to use bash https://stackoverflow.com/questions/68617354/how-to-change-the-default-bin-sh-to-bin-bash-on-opening-cli-for-selected-conta
RUN ln -sf /bin/bash /bin/sh

WORKDIR /var/task
COPY requirements.txt .
RUN python -m pip install -r requirements.txt
COPY --link . .

ENV AWS_PUBLIC_KEY=$AWS_PUBLIC_KEY
ENV AWS_SECRET_KEY=$AWS_SECRET_KEY
# CORS should be handled by lambda.
# Value is overridden to 1 in dev script
ENV ENABLE_FLASK_CORS=0 
CMD ["gunicorn", "src.app:app", "-b=:8080", "-w=1", "-c", "./gunicorn.conf.py"]