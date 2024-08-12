from flask import jsonify, request
from .s3 import create_presigned_download_url, create_presigned_upload_url


def start():
    s3_bucket_object_key = request.json.get('s3_bucket_object_key')
    url_data = create_presigned_upload_url(s3_bucket_object_key)
    return jsonify(url_data=url_data), 200

def end():
    return jsonify(message="OK"), 200

def get():
    s3_bucket_object_key = request.json.get('s3_bucket_object_key')
    url_data = create_presigned_download_url(s3_bucket_object_key)
    return jsonify(url_data=url_data), 200

