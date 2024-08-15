import { beforeEach, describe, expect, it } from "vitest";
import { set_backend_path } from "../../../../src/utils/backend";
import { transcribe_audio, upload_file_s3 } from "../../../../src/utils/backend/endpoints";
import { ModelConfig, ModelType } from "../../../../src/utils/backend/types/runpod";

// TODO: backend path should be set in a global setup file, with separate values for local and prod backend
beforeEach(() => {
    set_backend_path("http://localhost:8080");
})

const WHISPER_MODEL_CONFIG = ModelConfig.fromObject({model: ModelType.TINY})

const AUDIO_FILE_URL =
  "https://github.com/runpod-workers/sample-inputs/raw/main/audio/gettysburg.wav";

describe('test upload_file_s3', () => {
    it('should upload file to s3', async () => {
        const file = new File([''], 'file.txt');
        const progress_states: string[] = []
        const [download_url, error] = await upload_file_s3('file.txt', file, (progress) => progress_states.push(progress));
        expect(error).toEqual(null);
        expect(download_url).toContain("s3.amazonaws.com");
        expect(progress_states).toEqual(['GETTING_LINK', 'UPLOADING', 'UPLOADED']);
    }, 15000)
})


describe('test transcribe_audio', () => {
    it('transcribe audio', async () => {
        const progress_states: string[] = []
        const [transcript, transcript_err] = await transcribe_audio(AUDIO_FILE_URL, WHISPER_MODEL_CONFIG, (progress) => progress_states.push(progress), 1000);
        expect(progress_states).toContain('IN_PROGRESS');
        expect(progress_states).toContain('COMPLETED');
        expect(transcript_err).toBeNull();
        expect(typeof transcript![0].text).toBe('string');
        expect(transcript![0].text).not.toBe('');
    }, 30000)
})