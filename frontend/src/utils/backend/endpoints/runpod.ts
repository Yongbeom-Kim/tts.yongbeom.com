import axios, { AxiosError } from "axios";
import { format_axios_error, PromiseResult } from "../utils/utils";
import { ModelConfig, TranscriptionStatus, TranscriptObjectType } from "../types/runpod";

export const create_transcription_job = async function (
  audio_download_url: string,
  config: ModelConfig
): Promise<PromiseResult<string, string>> {
  try {
    const res = await axios.post(
      `/transcribe_audio`,
      {
        audio_download_url,
        ...config.toRequestObject()
      },
      { validateStatus: (status: number) => status === 200 }
    );
    return [res.data["job_id"], null];
  } catch (e: unknown) {
    if (!(e instanceof AxiosError)) throw e;
    return [null, format_axios_error(e)];
  }
};

const request_transcription_status = async function (
  job_id: string
): Promise<PromiseResult<TranscriptionStatus, string>> {
  try {
    const res = await axios.get(`/get_transcription_status`, {
      params: { job_id: job_id },
      validateStatus: (status: number) => status === 200,
    });
    return [res.data["status"], null];
  } catch (e: unknown) {
    if (!(e instanceof AxiosError)) throw e;
    return [null, format_axios_error(e)];
  }
};

export const request_transcription_text: (
  job_id: string
) => Promise<PromiseResult<TranscriptObjectType[], string>> = async (
  job_id: string
) => {
  try {
    const res = await axios.get(`/get_transcription`, {
      params: { job_id: job_id },
      validateStatus: (status: number) => status === 200,
    });
    return [res.data["transcription"], null];
  } catch (e: unknown) {
    if (!(e instanceof AxiosError)) throw e;
    return [null, format_axios_error(e)];
  }
};

export type Milliseconds = number;

export const wait_until_transcription_completed = async function (
  job_id: string,
  queryInterval: Milliseconds = 500,
  onProgress: (progress: TranscriptionStatus) => void = () => {}
): Promise<PromiseResult<void, string>> {
  const [error, error_msg] = await new Promise<[boolean, string]>(
    (resolve) => {
      const interval = setInterval(async () => {
        const [status, status_error] = await request_transcription_status(
          job_id
        );
        onProgress(status ?? "FAILED");
        if (status === "FAILED" || status_error) {
          clearInterval(interval);
          resolve([true, status_error ?? "Transcription failed."]);
        }
        if (status === "COMPLETED") {
          clearInterval(interval);
          resolve([false, ""]);
        }
      }, queryInterval);
    }
  );
  if (error) {
    return [null, error_msg];
  }
  return [undefined, null];
};

export const TEST_EXPORTS = {
  request_transcription_status,
};
