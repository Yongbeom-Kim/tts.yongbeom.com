/*
create_transcription_job
request_transcription_status
request_transcription_text
*/

import { set_backend_path } from "../../src";
import {
  TEST_EXPORTS,
  create_transcription_job,
  request_transcription_text,
  wait_until_transcription_completed,
} from "../../src/endpoints/runpod";
import { ModelConfig, ModelType } from "../../src/types/runpod";

const { request_transcription_status } = TEST_EXPORTS;

const AUDIO_FILE_URL =
  "https://github.com/runpod-workers/sample-inputs/raw/main/audio/gettysburg.wav";
const WHIPSER_MODEL_CONFIG = ModelConfig.fromObject({model: ModelType.TINY})

jest.mock('axios');

// TODO: backend path should be set in a global setup file, with separate values for local and prod backend
beforeEach(() => {
  set_backend_path("http://localhost:5000");
});

describe("test create_transcription_job", () => {
  test("create_transcription_job returns job_id", async () => {
    const [res, err] = await create_transcription_job(AUDIO_FILE_URL, WHIPSER_MODEL_CONFIG);
    expect(err).toBeNull();
    expect(res).toBeDefined();
  });
});

describe("test wait_until_transcription_completed", () => {

  test("wait_until_transcription_completed", async () => {
    const [job_id, job_err] = await create_transcription_job(
      AUDIO_FILE_URL,
      WHIPSER_MODEL_CONFIG
    );
    expect(job_err).toBeNull();
    expect(job_id).toBeDefined();
    const [_, err] = await wait_until_transcription_completed(job_id!);
    expect(err).toBeNull();
    const [status, status_err] = await request_transcription_status(job_id!);
    expect(status_err).toBeNull();
    expect(status).toBe("COMPLETED");
  }, 20000);
});

describe("test create_transcription_job + request_transcription_status + request_transcription_text", () => {
  test("transcription job completes and returns text", async () => {
    const [job_id, err] = await create_transcription_job(
      AUDIO_FILE_URL,
      WHIPSER_MODEL_CONFIG
    );
    expect(err).toBeNull();
    expect(job_id).toBeDefined();
    while (true) {
      const [transcription_status, err1] = await request_transcription_status(
        job_id!
      );
      expect(err1).toBeNull();
      expect(transcription_status).toBeDefined();
      expect(transcription_status).not.toBe("ERROR");
      if (transcription_status === "COMPLETED") {
        break;
      }
    }
    const [transcription_status, err1] = await request_transcription_status(
      job_id!
    );
    expect(err1).toBeNull();
    expect(transcription_status).toBe("COMPLETED");
    const [transcription_text, err2] = await request_transcription_text(
      job_id!
    );
    expect(err2).toBeNull;
    expect(transcription_text).not.toBeNull();
    expect(transcription_text![0].text).not.toBe("");
  }, 30000);
});
