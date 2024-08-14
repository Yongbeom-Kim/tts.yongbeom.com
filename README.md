# [tts.yongbeom.com](https://tts.yongbeom.com)

A wrapper around OpenAI's whisper model as a convenient interface to do text-to-speech generation.

This project does:
- Hosts a Flask serverless container that interfaces with the RunPod serverless model to generate text-to-speech.
- Hosts a React app that provides a simple interface to interact with the backend.

The project infrastructure is hosted on AWS through Terraform (or OpenTofu), and the backend is hosted on AWS Lambda.

## Requirements

| Thing                            | Version  |
| -------------------------------- | -------- |
| [OpenTofu](https://opentofu.org) | v1.8[^1] |

## Why I made this

When OpenAI's whisper tool came out, I thought it was fantastic - though I found it difficult to use. I wanted to be able to simply
record my lectures, and have them transcribed into text-to-speech. OpenAI's API, though, was super cumbersome (and **EXPENSIVE!!**) to use.

So, I decided to make a simple interface to interact with the whisper model, and host it on my own infrastructure.

## Infrastructure

### Code Base

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

### Development Workflow, CI/CD

This project follows the [gitflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) workflow, but in a somewhat loose and lazy way. The `main` branch is the production branch, and the `dev` branch is the development (staging) branch.

Here is the general development flow:
1. Create a feature branch off of `dev` (e.g. `feature/feature-name`).
2. Make changes in the feature branch.
   - In a feature branch, you can run `make tofu_deploy` to deploy the feature branch to the development environment. This is useful for testing.
3. Create a pull request to merge the feature branch into `dev`.
4. This triggers a GitHub action that runs tests and `tofu plan` on the development environment.
5. Once the pull request is merged, the GitHub action runs `tofu apply` on the staging environment.
6. When the staging environment is tested and ready, create a pull request to merge `dev` into `main`.
7. This triggers the same github action as in step 4, but on the staging environment.
8. Once the pull request is merged, the GitHub action runs `tofu apply` on the production environment.

- Production: [tts.yongbeom.com](https://tts.yongbeom.com)
- Staging: [staging.tts.yongbeom.com](https://stage.tts.yongbeom.com)
- Development: [dev.tts.yongbeom.com](https://dev.tts.yongbeom.com)

### To Deploy (Outdated)

1. Create a RunPod account, and reverse a serverless GPU, with the preset faster-whisper model.
2. Remove the `.example` suffix of `backend/.env.prod.example` and add the relevant RunPod credentials. Also add your desired S3 bucket name.
3. Run `terraform init`, `terraform plan` and `terraform apply` (or `tofu`) in the backend directory.
4. Remove the `.example` suffix of `frontend/.env.terraform.example` and add the relevant information.
5. Run `yarn` in the frontend directory.
6. Run `terraform init`, `terraform plan` and `terraform apply` (or `tofu`) in the frontend directory.
7. Your app should be deployed!


[^1]: We need OpenTofu v1.8 because of its [Early variable/locals evaluation](https://opentofu.org/blog/opentofu-1-8-0/) for input values for remote backend. To my best knowledge (as of Aug 2024), this is not supported in Terraform.


## Mistakes & Regrets
### `tts` is a misnomer
I made a mistake and accidentally named this project `tts.yongbeom.com`. But this is a misnomer since this project is actually a `speech-to-text` project. I should have named it `stt.yongbeom.com`. Oops.


### Terraform as deployment tool
Prior to this project, I looked at everyone saying "Don't use Terraform as a deployment tool" and thought "what's the issue?". I now understand the issue.

#### Frontend Deployment (`vite build`)
I thought I was a genius to use terraform as a deployment tool for the frontend.

The plan was to use a `local-exec` provisioner to run `vite build`, followed by a [`hashicorp/dir/template`](https://registry.terraform.io/modules/hashicorp/dir/template/latest) module to upload files to S3 ([file](./frontend/terraform/frontend_s3.tf)). This allows me to embed and override environment variables in the final build that come in the form of terraform (output) variables. 

So I ran into an issue because the files that the module looks at are planned during the `tofu plan` stage, then running `yarn build` with `vite` afterwards generates new files with new hashes, adn then the module tries to upload the old files, which are not found.

To work around this, I edit build options in [`vite.config.ts`](./frontend/vite.config.ts) to use a fixed file name for the files, then run `yarn build` once before the `tofu apply` stage (which runs `yarn build` one more time with a [`null_resource`](./frontend/terraform/frontend_s3.tf)). Obviously, this has turned out to be terrible, and I should have really separated the infrastructure and deployment concerns. Much regrets, but I will leave this as a lesson for the future.