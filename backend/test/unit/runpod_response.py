

from test.unit.utils import create_http_response


status_response_error = create_http_response(
    400, {})

status_response_in_progress = create_http_response(
    200, {
        "delayTime": 311, "id":
            "job_id_here",
            "status": "IN_PROGRESS"})

status_response_complete_no_transcript = create_http_response(
    200, {
        "status": "COMPLETED",
        "delayTime": 133,
        "executionTime": 53,
        "id": "job_id_here"})


status_response_complete = create_http_response(
    200, {
        "status": "COMPLETED",
        "delayTime": 133,
        "executionTime": 97703,
        "id": "job_id_here",
        "output": {
            "detected_language": "en",
            "device": "cuda",
            "model": "large-v2",
            "segments": [
                {
                    "avg_logprob": -0.5202963917525774,
                    "compression_ratio": 1.4973262032085561,
                    "end": 5,
                    "id": 1,
                    "no_speech_prob": 0.10455322265625,
                    "seek": 2400,
                    "start": 0,
                    "temperature": 0,
                    "text": " Okay, so we started off with the question of...",
                    "tokens": [
                            50364,
                            1033,
                            11,
                            370,
                            321,
                            1409,
                            766,
                            365,
                            264,
                            1168,
                            295,
                            485,
                            50614
                    ]
                }]}})
