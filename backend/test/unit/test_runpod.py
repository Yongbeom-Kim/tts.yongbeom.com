from time import sleep
import pytest
from src.api.runpod import (
    submit_audio,
    get_task_status,
    get_transcription,
    submit_audio_request,
    submit_result_request,
)
from test.unit.runpod_response import (
    status_response_error,
    status_response_in_progress,
    status_response_complete,
    status_response_complete_no_transcript
)

from test.unit.utils import create_http_response

sample_audio_url = 'https://github.com/runpod-workers/sample-inputs/raw/main/audio/gettysburg.wav'


@pytest.mark.fast
@pytest.mark.runpod
def test_submit_audio_success():
    response = create_http_response(
        200, {"id": "test-submission-job-id", "status": "IN_QUEUE"})
    assert submit_audio(response)[0]
    assert submit_audio(response)[1]
    assert not submit_audio(response)[2]


@pytest.mark.fast
@pytest.mark.parametrize("status_code", [(400,), (401,), (429,)])
@pytest.mark.runpod
def test_submit_audio_fail(status_code):
    response = create_http_response(
        status_code, {"error": "test-error-message"})
    assert not submit_audio(response)[0]
    assert not submit_audio(response)[1]
    assert submit_audio(response)[2]


@pytest.mark.fast
@pytest.mark.runpod
def test_get_task_status_error():
    assert get_task_status(status_response_error) == 'ERROR'


@pytest.mark.fast
@pytest.mark.runpod
def test_get_task_status_in_progress():
    assert get_task_status(status_response_in_progress) == 'IN_PROGRESS'


@pytest.mark.fast
@pytest.mark.runpod
def test_get_task_status_completed():
    assert get_task_status(status_response_complete) == 'COMPLETED'


@pytest.mark.fast
@pytest.mark.runpod
def test_get_transcription_error():
    assert get_transcription(status_response_error) is None


@pytest.mark.fast
@pytest.mark.runpod
def test_get_transcription_in_progress():
    assert get_transcription(status_response_in_progress) is None


@pytest.mark.fast
@pytest.mark.runpod
def test_get_transcription_complete_no_transcript():
    assert get_transcription(status_response_complete_no_transcript) is None


@pytest.mark.fast
@pytest.mark.runpod
def test_get_transcription_complete():
    assert get_transcription(status_response_complete) != ""


@pytest.mark.slow
@pytest.mark.runpod
def test_submit_audio_request_success():
    response = submit_audio_request(sample_audio_url, model='tiny')
    assert response.status_code == 200


@pytest.mark.slow
@pytest.mark.runpod
def test_submit_audio_request_not_url():
    response = submit_audio_request('not_url', model='tiny')
    assert response.status_code == 200


@pytest.mark.slow
@pytest.mark.runpod
def test_submit_result_request_invalid_id():
    response = submit_result_request('test-job-id')
    assert response.status_code == 404


@pytest.mark.slow
@pytest.mark.runpod
def test_submit_result_request():
    success, id, error = submit_audio(submit_audio_request(sample_audio_url, model='tiny'))
    assert success
    status = get_task_status(submit_result_request(id))
    assert status in ('IN_PROGRESS', 'IN_QUEUE', 'COMPLETED')
    if status != 'COMPLETED':
        sleep(10)
        assert get_task_status(submit_result_request(id)) == 'COMPLETED'


@pytest.mark.slow
@pytest.mark.runpod
def test_get_transcription_text():
    success, id, error = submit_audio(submit_audio_request(sample_audio_url, model='tiny'))
    assert success
    while True:
        status = get_task_status(submit_result_request(id))
        assert status in ('IN_PROGRESS', 'IN_QUEUE', 'COMPLETED')
        if status == 'COMPLETED':
            break
        sleep(1)
    transcript = get_transcription(submit_result_request(id))
    assert transcript is not None
    assert transcript[0]['text'] != ''