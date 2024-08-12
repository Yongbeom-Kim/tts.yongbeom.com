import { set_backend_path } from "frontend_tts_lib";
import { S3UploadStatus, transcribe_audio, upload_file_s3 } from "frontend_tts_lib/endpoints";
import { RunpodModelConfig, RunpodTranscriptionStatus, RunpodTranscriptObjectType } from "frontend_tts_lib/types";
import { useEffect, useState } from "react";

export type TranscriptionState = S3UploadStatus | RunpodTranscriptionStatus | "INITIAL_STATE"

export const useTranscriptionService = function(
    audioFile: File | null,
    s3UploadObjectKey: string | null = "test.wav",
    whisperModelConfig: RunpodModelConfig | null,
    requestPollingInterval = 5000
) {
    set_backend_path(import.meta.env['VITE_BACKEND_ROUTE'])
    const [transcriptionState, setTranscriptionState] = useState<TranscriptionState>("INITIAL_STATE");
    const [audioURL, setAudioURL] = useState<string>("");
    const [transcription, setTranscription] = useState<RunpodTranscriptObjectType[] | null>(null);
    const [transcriptionError, setTranscriptionError] = useState<string | null>(null);

    useEffect(() => {
        if (audioFile === null) return;
        if (s3UploadObjectKey === null) return;
        setTranscription([])
        setTranscriptionError(null);
        upload_file_s3(s3UploadObjectKey, audioFile, setTranscriptionState).then(([download_url, err]) => {
            if (err) {
                setTranscriptionError(`Something went wrong when uploading file: ${err}`);
                return;
            }
            setAudioURL(download_url!);
        })
    }, [audioFile, s3UploadObjectKey])

    useEffect(() => {
        if (audioURL === "") return;
        if (whisperModelConfig === null) return;
        transcribe_audio(audioURL, whisperModelConfig, setTranscriptionState, requestPollingInterval).then(([transcript, err]) => {
            if (err) {
                setTranscriptionError(`Something went wrong when requesting transcription: ${err}`);
                return;
            }
            setTranscription(transcript!);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioURL])

    return {transcription, transcriptionState, transcriptionError}
}