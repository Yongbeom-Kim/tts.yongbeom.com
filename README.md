# [tts.yongbeom.com](https://tts.yongbeom.com)

A wrapper around OpenAI's whisper model as a convenient interface to do text-to-speech generation.

This project does:
- Hosts a Flask serverless container that interfaces with the RunPod serverless model to generate text-to-speech.
- Hosts a React app that provides a simple interface to interact with the backend.

The project infrastructure is hosted on AWS through Terraform (or OpenTofu), and the backend is hosted on AWS Lambda.

## Why I made this

When OpenAI's whisper tool came out, I thought it was fantastic - though I found it difficult to use. I wanted to be able to simply
record my lectures, and have them transcribed into text-to-speech. OpenAI's API, though, was super cumbersome (and **EXPENSIVE!!**) to use.

So, I decided to make a simple interface to interact with the whisper model, and host it on my own infrastructure.

## How it works

This is a monorepo with the following components:
- `backend`: A Flask serverless container that interfaces with the RunPod serverless model to generate text-to-speech.
- `frontend`: A React app that provides a simple interface to interact with the backend.
- `frontend-tts-lib`: A library that provides a simple interface to interact with the backend.


When you request an audio file to be translated, the following happens:
1. The frontend makes a request to the backend to upload the audio file.
2. The backend replies with a presigned AWS S3 URL to upload the audio file.
3. The frontend uploads the audio file to the S3 URL.
4. The frontend makes a request to the backend to generate the audio transcript.
5. The backend makes an asynchronous request to the RunPod serverless model to generate the audio transcript, and replies with the corresponding RunPod job id.
6. The frontend periodically makes a request to the backend to check on the status of the RunPod job.
7. Once the RunPod job is complete, the backend replies with the finished audio transcript.

## To Deploy

1. Create a RunPod account, and reverse a serverless GPU, with the preset faster-whisper model.
2. Remove the `.example` suffix of `backend/.env.prod.example` and add the relevant RunPod credentials. Also add your desired S3 bucket name.
3. Run `terraform init`, `terraform plan` and `terraform apply` (or `tofu`) in the backend directory.
4. Remove the `.example` suffix of `frontend/.env.terraform.example` and add the relevant information.
5. Run `yarn` in the frontend directory.
6. Run `terraform init`, `terraform plan` and `terraform apply` (or `tofu`) in the frontend directory.
7. Your app should be deployed!