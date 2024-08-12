export type TranscriptionStatus =
  | "ERROR"
  | "COMPLETED"
  | "IN_PROGRESS"
  | "IN_QUEUE"
  | "FAILED";

export type TranscriptObjectType = {
  end: number;
  start: number;
  text: string;
};

export enum ModelType {
  TINY = "tiny",
  BASE = "base",
  SMALL = "small",
  MEDIUM = "medium",
  LARGE_V1 = "large-v1",
  LARGE_V2 = "large-v2",
}

export enum SupportedLanguages {
  Auto = "auto",
  Afrikaans = "af",
  Arabic = "ar",
  Armenian = "hy",
  Azerbaijani = "az",
  Belarusian = "be",
  Bosnian = "bs",
  Bulgarian = "bg",
  Catalan = "ca",
  Chinese = "zh",
  Croatian = "hr",
  Czech = "cs",
  Danish = "da",
  Dutch = "nl",
  English = "en",
  Estonian = "et",
  Finnish = "fi",
  French = "fr",
  Galician = "gl",
  German = "de",
  Greek = "el",
  Hebrew = "he",
  Hindi = "hi",
  Hungarian = "hu",
  Icelandic = "is",
  Indonesian = "id",
  Italian = "it",
  Japanese = "ja",
  Kannada = "kn",
  Kazakh = "kk",
  Korean = "ko",
  Latvian = "lv",
  Lithuanian = "lt",
  Macedonian = "mk",
  Malay = "ms",
  Marathi = "mr",
  Maori = "mi",
  Nepali = "ne",
  Norwegian = "no",
  Persian = "fa",
  Polish = "pl",
  Portuguese = "pt",
  Romanian = "ro",
  Russian = "ru",
  Serbian = "sr",
  Slovak = "sk",
  Slovenian = "sl",
  Spanish = "es",
  Swahili = "sw",
  Swedish = "sv",
  Tagalog = "tl",
  Tamil = "ta",
  Thai = "th",
  Turkish = "tr",
  Ukrainian = "uk",
  Urdu = "ur",
  Vietnamese = "vi",
  Welsh = "cy",
}

export class ModelConfig {
    model: ModelType;
    language: SupportedLanguages;
    initial_prompt: string;
    temperature: number;
    best_of: number;
    beam_size: number;
    patience: number;
    suppress_tokens: string;
    condition_on_previous_text: boolean;
    temperature_increment_on_fallback: number;
    compression_ratio_threshold: number;
    logprob_threshold: number;
    word_timestamps: boolean;
    no_speech_threshold: number;

    constructor(
        model: ModelType = ModelType.BASE,
        language: SupportedLanguages = SupportedLanguages.Auto,
        initial_prompt: string = "",
        temperature: number = 0,
        best_of: number = 5,
        beam_size: number = 5,
        patience: number = 1,
        suppress_tokens: string = "-1",
        condition_on_previous_text: boolean = false,
        temperature_increment_on_fallback: number = 0.2,
        compression_ratio_threshold: number = 2.4,
        logprob_threshold: number = -1,
        word_timestamps: boolean = false,
        no_speech_threshold: number = 0.6
    ) {
        this.model = model;
        this.language = language;
        this.initial_prompt = initial_prompt;
        this.temperature = temperature;
        this.best_of = best_of;
        this.beam_size = beam_size;
        this.patience = patience;
        this.suppress_tokens = suppress_tokens;
        this.condition_on_previous_text = condition_on_previous_text;
        this.temperature_increment_on_fallback = temperature_increment_on_fallback;
        this.compression_ratio_threshold = compression_ratio_threshold;
        this.logprob_threshold = logprob_threshold;
        this.word_timestamps = word_timestamps;
        this.no_speech_threshold = no_speech_threshold;
    }

    static fromObject({
        model,
        language,
        initial_prompt,
        temperature,
        best_of,
        beam_size,
        patience,
        suppress_tokens,
        condition_on_previous_text,
        temperature_increment_on_fallback,
        compression_ratio_threshold,
        logprob_threshold,
        word_timestamps,
        no_speech_threshold,
    }: {
        model?: ModelType,
        language?: SupportedLanguages,
        initial_prompt?: string,
        temperature?: number,
        best_of?: number,
        beam_size?: number,
        patience?: number,
        suppress_tokens?: string,
        condition_on_previous_text?: boolean,
        temperature_increment_on_fallback?: number,
        compression_ratio_threshold?: number,
        logprob_threshold?: number,
        word_timestamps?: boolean,
        no_speech_threshold?: number,
    }) {
        return new ModelConfig(
            model,
            language,
            initial_prompt,
            temperature,
            best_of,
            beam_size,
            patience,
            suppress_tokens,
            condition_on_previous_text,
            temperature_increment_on_fallback,
            compression_ratio_threshold,
            logprob_threshold,
            word_timestamps,
            no_speech_threshold
        );
    }
    

    // We coerce the type here, so we can use the form object directly in the API call
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromFormObject(obj: Record<string, string>): ModelConfig {
        if ('model' in obj && !(Object.values(ModelType) as string[]).includes(obj.model)) {
            delete obj.model;
        }
        if ('language' in obj && !(Object.values(SupportedLanguages) as string[]).includes(obj.language)) {
            delete obj.language;
        }
        return ModelConfig.fromObject({
            model: obj.model as ModelType,
            language: obj.language as SupportedLanguages,
            initial_prompt: obj.initial_prompt,
            temperature: parseFloat(obj.temperature),
            best_of: parseInt(obj.best_of),
            beam_size: parseInt(obj.beam_size),
            patience: parseInt(obj.patience),
            suppress_tokens: obj.suppress_tokens,
            condition_on_previous_text: 'condition_on_previous_text' in obj,
            temperature_increment_on_fallback: parseFloat(obj.temperature_increment_on_fallback),
            compression_ratio_threshold: parseFloat(obj.compression_ratio_threshold),
            logprob_threshold: parseFloat(obj.logprob_threshold),
            word_timestamps: 'word_timestamps' in obj,
            no_speech_threshold: parseFloat(obj.no_speech_threshold),
        });
    }

    toRequestObject(): Record<string, string | number | boolean> {
        const object: Record<string, string | number | boolean | undefined> = {
            model: this.model,
            language: this.language === SupportedLanguages.Auto ? undefined : this.language.toString(),
            initial_prompt: this.initial_prompt,
            temperature: this.temperature,
            best_of: this.best_of,
            beam_size: this.beam_size,
            patience: this.patience,
            suppress_tokens: this.suppress_tokens,
            condition_on_previous_text: this.condition_on_previous_text,
            temperature_increment_on_fallback: this.temperature_increment_on_fallback,
            compression_ratio_threshold: this.compression_ratio_threshold,
            logprob_threshold: this.logprob_threshold,
            word_timestamps: this.word_timestamps,
            no_speech_threshold: this.no_speech_threshold,
        };
        Object.keys(object).forEach(key => object[key] === undefined && delete object[key]);
        // We deleted all undefined values.
        return object as Record<string, string | number | boolean>;
    }
}