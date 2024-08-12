from pathlib import Path
from time import sleep
from requests import request
import requests
from testcontainers.core.container import DockerContainer
from testcontainers.core.waiting_utils import wait_for_logs
from os import getenv
import pytest
import datetime

CONT_EXPOSTED_PORT = 8080


@pytest.fixture
def backend_container(request):
    with DockerContainer(getenv("DOCKER_IMAGE_TAG")).with_exposed_ports(CONT_EXPOSTED_PORT) as container:
        wait_for_logs(container, "Listening at:")
        yield container
        # Nice hack to print logs on test failure
        print(container.get_logs())


@pytest.fixture
def backend_path(backend_container: DockerContainer):
    return f"http://{backend_container.get_container_host_ip()}:{backend_container.get_exposed_port(CONT_EXPOSTED_PORT)}/"


@pytest.mark.component
def test_aws_auth(backend_container: DockerContainer):
    env_var_str = backend_container.exec("env").output.decode()
    env_vars = dict([line.split("=", 1) for line in env_var_str.splitlines()])
    assert env_vars.get("AWS_PUBLIC_KEY", "") != ""
    assert env_vars.get("AWS_SECRET_KEY", "") != ""


@pytest.mark.component
def test_flask_endpoint(backend_path: str):
    response = request("GET", backend_path)
    assert "OK" in response.content.decode()


@pytest.mark.component
def test_get_presigned_upload_link(backend_path: str):
    response = request("POST", backend_path +
                       "get_presigned_upload_link", json={"s3_bucket_object_key": "test.txt"})
    data = response.json()['url_data']
    response = requests.post(
        data['url'],
        data=data['fields'],
        files={'file': ('test.txt', str(datetime.datetime.now()))}
    )
    assert response.status_code == 204


@pytest.mark.component
def test_overall_transcription_api(backend_path: str):
    response = request("POST", backend_path +
                       "get_presigned_upload_link",
                       json={"s3_bucket_object_key": "test.wav", "model": "tiny"})
    data = response.json()['url_data']
    audio_file = Path("./test/audio/gettysburg.wav")
    assert audio_file.exists()
    with open(audio_file, "rb") as f:
        response = requests.post(
            data['url'],
            data=data['fields'],
            files={'file': f},
        )
    assert response.status_code == 204

    response = request("POST", backend_path + "get_presigned_download_link",
                       json={'s3_bucket_object_key': "test.wav"})
    assert response.status_code == 200
    download_url = response.json()['url_data']

    response = request("POST", backend_path +
                       "transcribe_audio", json={"audio_download_url": download_url})
    job_id = response.json()['job_id']
    assert job_id != ""

    response = None
    while response is None or response.json()['status'] != 'COMPLETED':
        response = request("GET", backend_path +
                           "get_transcription_status", params={"job_id": job_id})
        assert response.json()['status'] in [
            'COMPLETED', 'IN_PROGRESS', 'IN_QUEUE']
        sleep(1)

    response = request("GET", backend_path +
                       "get_transcription", params={"job_id": job_id})
    assert response.status_code == 200
    assert response.json()['transcription'][0]['text'] != ''
