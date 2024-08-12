import os
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from src.api.aws_s3 import create_presigned_upload_url, create_presigned_download_url
from src.api.runpod import (
    AudioRequest,
    submit_audio_request,
    submit_audio,
    get_task_status,
    submit_result_request,
    get_transcription,
)
# CORS handled by lambda.
from flask_cors import CORS

load_dotenv()

# FIXME: this needs to depend on user + date or some other thing.
app = Flask(__name__)

# # CORS handled by lambda.
if (os.getenv('ENABLE_FLASK_CORS') == '1'):
    print('Flask CORS Enabled', flush=True)
    CORS(app)


@app.route('/')
def landing():
    return jsonify(message="Test, OKs"), 200


@app.route('/get_presigned_upload_link', methods=['POST'])
def get_presigned_upload_link():
    s3_bucket_object_key = request.json.get('s3_bucket_object_key')
    url_data = create_presigned_upload_url(s3_bucket_object_key)
    return jsonify(url_data=url_data), 200


@app.route('/get_presigned_download_link', methods=['POST'])
def get_presigned_download_link():
    s3_bucket_object_key = request.json.get('s3_bucket_object_key')
    url_data = create_presigned_download_url(s3_bucket_object_key)
    return jsonify(url_data=url_data), 200


@app.route('/transcribe_audio', methods=['POST'])
def transcribe_audio():
    download_url = request.json.get('audio_download_url')
    if download_url is None:
        return jsonify(message="No download url found"), 404
    
    audio_request_object = AudioRequest.from_kwargs(**request.json)
    success, job_id, error = submit_audio(
        submit_audio_request(
            wav_file_url=download_url,
            enable_vad=False,
            **audio_request_object),
    )
    if not success:
        return jsonify(message=error), 502

    return jsonify(job_id=job_id), 200


@app.route('/get_transcription_status', methods=['GET'])
def get_transcription_status_endpoint():
    job_id = request.args.get('job_id')
    status = get_task_status(submit_result_request(job_id))
    if status == 'ERROR':
        return (jsonify(
            status="Something went wrong in getting the transcription status. Likely not found."),
            404)
    return jsonify(status=status), 200


@app.route('/get_transcription', methods=['GET'])
def get_transcription_endpoint():
    job_id = request.args.get('job_id')
    response = submit_result_request(job_id)
    status = get_task_status(response)
    if status == 'ERROR':
        return jsonify(message="Something went wrong"), 500
    if status == 'IN_PROGRESS':
        return jsonify(message="Task is still in progress"), 202
    if status != 'COMPLETED':
        return jsonify(message="Task is in an unknown state"), 500
    transcription = get_transcription(response)
    if transcription is None:
        return jsonify(message="Something went wrong"), 400

    return jsonify(transcription=transcription), 200

