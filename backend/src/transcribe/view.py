from flask import jsonify, request
from .runpod import AudioRequest, get_task_status, get_transcription, submit_audio, submit_audio_request, submit_result_request

def request_transcription():
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


def get_status():
    job_id = request.args.get('job_id')
    status = get_task_status(submit_result_request(job_id))
    if status == 'ERROR':
        return (jsonify(
            status="Something went wrong in getting the transcription status. Likely not found."),
            404)
    return jsonify(status=status), 200


def get_result():
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