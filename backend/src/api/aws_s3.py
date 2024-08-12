import logging
import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv
import boto3
import botocore


load_dotenv('.env.prod')

auth_object = {
    'region_name': os.getenv('AWS_REGION'),
    'aws_access_key_id': os.getenv('AWS_PUBLIC_KEY'),
    'aws_secret_access_key': os.getenv('AWS_SECRET_KEY'),
}
bucket_name = os.environ['AWS_S3_AUDIO_BUCKET_NAME']
url_expiration = int(os.environ['AWS_PRESIGNED_URL_EXPIRATION'])
session = boto3.Session(
    **auth_object
)
s3 = session.resource('s3')
bucket = s3.Bucket(bucket_name)


def get_identity():
    return boto3.client('sts').get_caller_identity()


def upload_file(local_file_path: Path, bucket_file_key: str) -> List[str]:
    assert local_file_path.exists(), f"File not found: {local_file_path}"
    assert local_file_path.is_file(), f"Not a file: {local_file_path}"
    with open(local_file_path, 'rb') as data:
        bucket.put_object(Key=bucket_file_key, Body=data)


def item_exists(key: str) -> bool:
    try:
        bucket.Object(key).load()
    except botocore.exceptions.ClientError:
        return False
    return True


def delete_item(key: str) -> None:
    bucket.Object(key).delete()


# https://boto3.amazonaws.com/v1/documentation/api/latest/guide/s3-presigned-urls.html
def create_presigned_download_url(object_name, expiration=url_expiration):
    """Generate a presigned URL to share an S3 object

    :param bucket_name: string
    :param object_name: string
    :param expiration: Time in seconds for the presigned URL to remain valid
    :return: Presigned URL as string. If error, returns None.
    """

    try:
        s3_client = boto3.client('s3', **auth_object)
        response = s3_client.generate_presigned_url('get_object',
                                                    Params={'Bucket': bucket_name,
                                                            'Key': object_name},
                                                    ExpiresIn=expiration)
    except botocore.exceptions.ClientError as e:
        logging.error(e)
        return None

    # The response contains the presigned URL
    return response


# https://boto3.amazonaws.com/v1/documentation/api/latest/guide/s3-presigned-urls.html
def create_presigned_upload_url(object_name, expiration=url_expiration):
    """Generate a presigned URL S3 POST request to upload a file

    :param object_name: string
    :param expiration: Time in seconds for the presigned URL to remain valid
    :return: Dictionary with the following keys:
        url: URL to post to
        fields: Dictionary of form fields and values to submit with the POST
    :return: None if error.
    """

    # Generate a presigned S3 POST URL
    try:
        s3_client = boto3.client('s3', **auth_object)
        response = s3_client.generate_presigned_post(bucket_name,
                                                     object_name,
                                                     Fields=None,
                                                     Conditions=None,
                                                     ExpiresIn=expiration)
    except botocore.exceptions.ClientError as e:
        logging.error(e)
        return None

    # The response contains the presigned URL and required fields
    return response
