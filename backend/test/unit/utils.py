import json
from typing import Any, Dict
import requests


def create_http_response(status_code: int, content: Dict[str, Any], encoding: str = 'utf-8'):
    response: requests.Response = requests.Response()
    response.status_code = status_code
    response._content = json.dumps(content).encode(encoding)
    response.encoding = encoding
    return response