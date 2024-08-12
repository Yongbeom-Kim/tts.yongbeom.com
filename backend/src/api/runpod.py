from __future__ import annotations
from typing import Dict, List, Literal, Tuple, TypedDict
from typing_extensions import Unpack
import os
import requests

JobStatus = Literal['IN_PROGRESS', 'COMPLETED', 'ERROR', 'IN_QUEUE', 'FAILED']
Transcript = List[TypedDict(
    'TranscriptSegment', {'start': float, 'end': float, 'text': str})]

RUNPOD_API_KEY = os.getenv("RUNPOD_API_KEY")
RUNPOD_API_URL = os.getenv("RUNPOD_API_URL")


def submit_audio(audio_request_response: requests.Response) -> Tuple[bool, str, str]:
    """ Submit audio to Runpod whisper API for transcription.

    Args:
        audio_request_response (requests.Response): The response from the audio request.

    Returns:
        bool: Whether the audio was successfully submitted.
        str: Resulting job ID if successful. (Empty string if failed.)
        str: Reason for failure if any. (Empty string if successful.)
    """
    if audio_request_response.status_code != 200:
        return False, '', audio_request_response.text
    return True, audio_request_response.json()['id'], ''


def get_task_status(result_request_response: requests.Response) -> JobStatus:
    """Get the status of the task from the result request response.

    Args:
        result_request_response (requests.Response): The response from the result request.

    Returns:
        JobStatus: The status of the task.
    """
    # FIXME: Handle task failure.
    if result_request_response.status_code != 200:
        return 'ERROR'

    match result_request_response.json()['status']:
        case 'COMPLETED':
            return 'COMPLETED'
        case 'IN_PROGRESS':
            return 'IN_PROGRESS'
        case 'IN_QUEUE':
            return 'IN_QUEUE'
        case 'FAILED':
            return 'FAILED'

    raise ValueError(f'Unknown task status, {result_request_response.json()}')


def get_transcription(result_request_response: requests.Response) -> Transcript | None:
    """Get the transcription from the result request response.

    Args:
        result_request_response (requests.Response): The response from the result request.

    Returns:
        Transcript | None: The transcription of the audio if completed, else None.
    """
    if result_request_response.status_code != 200:
        return None
    if get_task_status(result_request_response) != 'COMPLETED':
        return None
    if 'output' not in result_request_response.json():
        return None
    
    segments = result_request_response.json()['output']['segments']
    transcript: List[Dict[str, int | float | str]] = [{
        'start': s['start'],
        'end': s['end'],
        'text': s['text']}
        for s in segments]

    return transcript


SupportedLanguages = Literal['af', 'ar', 'hy', 'az', 'be', 'bs', 'bg', 'ca', 'zh', 'hr', 'cs',
                             'da', 'nl', 'en', 'et', 'fi', 'fr', 'gl', 'de', 'el', 'he', 'hi',
                             'hu', 'is', 'id', 'it', 'ja', 'kn', 'kk', 'ko', 'lv', 'lt', 'mk',
                             'ms', 'mr', 'mi', 'ne', 'no', 'fa', 'pl', 'pt', 'ro', 'ru', 'sr',
                             'sk', 'sl', 'es', 'sw', 'sv', 'tl', 'ta', 'th', 'tr', 'uk', 'ur',
                             'vi', 'cy']


class AudioRequest(TypedDict):
    model: Literal["tiny", "base", "small",
                   "medium", "large-v1", "large-v2"] = 'base'
    transcription: Literal['plain_text', 'srt', 'vtt'] = 'plain_text'
    translate: bool = False  # translate to english
    language: SupportedLanguages | None = None
    temperature: float = 0
    best_of: int = 5
    beam_size: int = 5
    patience: float = 1
    suppress_tokens: str = '-1'
    initial_prompt: str = ''
    condition_on_previous_text: bool = False
    temperature_increment_on_fallback: float = 0.2
    compression_ratio_threshold: float = 2.4
    logprob_threshold: float = -1
    word_timestamps: bool = False
    no_speech_threshold: float = 0.6

    @classmethod
    def from_kwargs(cls, **kwargs: any) -> AudioRequest:
        """Add default values to the audio request. Removes any extra keys."""
        kwargs = {k: v for k, v in kwargs.items() if v is not None}
        return ({
            'model': kwargs.get('model', 'base'),
            'transcription': kwargs.get('transcription', 'plain_text'),
            'translate': kwargs.get('translate', False),
            'language': kwargs.get('language', None),
            'temperature': kwargs.get('temperature', 0),
            'best_of': kwargs.get('best_of', 5),
            'beam_size': kwargs.get('beam_size', 5),
            'patience': kwargs.get('patience', 1),
            'suppress_tokens': kwargs.get('suppress_tokens', '-1'),
            'initial_prompt': kwargs.get('initial_prompt', ''),
            'condition_on_previous_text': kwargs.get('condition_on_previous_text', False),
            'temperature_increment_on_fallback': kwargs.get('temperature_increment_on_fallback', 0.2),
            'compression_ratio_threshold': kwargs.get('compression_ratio_threshold', 2.4),
            'logprob_threshold': kwargs.get('logprob_threshold', -1),
            'word_timestamps': kwargs.get('word_timestamps', False),
            'no_speech_threshold': kwargs.get('no_speech_threshold', 0.6),
        })


def submit_audio_request(
        wav_file_url: str,
        enable_vad: bool = False,
        **kwargs: Unpack[AudioRequest],
) -> requests.Response:
    """Submit audio to Runpod whisper API for transcription.

    Args:
        wav_file_url (str): The download URL of the audio file (.wav) to be transcribed.
        model_name (Model, optional): The model to be used for transcription. Defaults to 'base'.

    Returns:
        requests.Response: The response from the API.
    """
    # url = "https://api.runpod.ai/v2/faster-whisper/run"
    url = f"{RUNPOD_API_URL}/run"
    payload = {
        "input": {
            "audio": wav_file_url,
            **kwargs
        },
        "enable_vad": enable_vad
    }

    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": RUNPOD_API_KEY
    }

    return requests.post(url, json=payload, headers=headers)


def submit_result_request(job_id: str) -> requests.Response:
    """Submit a request to get the result of the transcription task.

    Args:
        job_id (str): The job ID of the transcription task.

    Returns:
        requests.Response: The response from the API.

    """
    url = f"{RUNPOD_API_URL}/status/{job_id}"

    headers = {
        "accept": "application/json",
        "authorization": RUNPOD_API_KEY
    }
    return requests.get(url, headers=headers)
