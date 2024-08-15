import { ModelConfig, TranscriptionStatus, TranscriptObjectType } from "../types/runpod";
import { PromiseResult } from "../utils/utils";
import { create_transcription_job, Milliseconds, request_transcription_text, wait_until_transcription_completed } from "./runpod";
import {
  get_s3_presigned_download_link,
  get_s3_presigned_upload_link,
  upload_file_from_s3_presigned_link,
  UploadStatus,
} from "./s3";

export type {
  UploadStatus as S3UploadStatus,
} from './s3'


/** 
 * Uploads a file to s3 and returns the download link
 * @param s3_bucket_object_key The key for the object in s3 bucket
 * @param file The file to upload
 * @param onProgress A callback function that will be called with the progress of the upload
 * @returns PromiseResult<string, string> A tuple containing the download link or an error message
 */
export const upload_file_s3 = async function (
  s3_bucket_object_key: string,
  file: File,
  onProgress: (progress: UploadStatus) => void = (() => {})
): Promise<PromiseResult<string, string>> {

  onProgress("GETTING_LINK");
  const [link_result, link_error] = await get_s3_presigned_upload_link(
    s3_bucket_object_key
  );
  if (link_error) {
    return [null, `Error during getting presigned s3 link: ${link_error}`];
  }

  onProgress("UPLOADING");
  const { url, fields } = link_result!;
  const [_, upload_error] = await upload_file_from_s3_presigned_link(
    url,
    fields,
    file
  );
  if (upload_error) {
    return [null, `Error during uploading file to s3: ${upload_error}`];
  }
  onProgress("UPLOADED");

  return await get_s3_presigned_download_link(s3_bucket_object_key);
};


export const transcribe_audio = async function (
  audio_download_url: string,
  modelConfig: ModelConfig,
  onProgress: (progress: TranscriptionStatus) => void = (() => {}),
  queryInterval: Milliseconds = 1000
): Promise<PromiseResult<TranscriptObjectType[], string>> {
  const [job_id, job_error] = await create_transcription_job(
    audio_download_url,
    modelConfig
  );
  if (job_error) {
    return [null, `Error during creating transcription job: ${job_error}`];
  }
  onProgress("IN_PROGRESS");
  
  await wait_until_transcription_completed(job_id!, queryInterval, onProgress);

  const [trans_obj, trans_obj_err] = await request_transcription_text(job_id!)
  if (trans_obj_err) {
    return [null, `Error during getting transcription: ${trans_obj_err}`];
  }
  return [trans_obj!, null];
}