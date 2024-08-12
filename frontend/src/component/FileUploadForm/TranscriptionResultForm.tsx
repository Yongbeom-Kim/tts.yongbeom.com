import classNames from "classnames";

export type TranscriptionResultFormProps = {
  hasError: boolean;
  text: string;
} & React.HTMLAttributes<HTMLTextAreaElement>;

export const TranscriptionResultForm: React.FC<
  TranscriptionResultFormProps
> = ({hasError, text}) => {
  return (
    <textarea
      value={text}
      readOnly
      className={classNames(
        "w-11/12 md:w-8/12 py-1 resize-none mx-auto mb-10 h-full border-slate-700 border-[1px] border-solid rounded-xl focus:outline-none active:outline-none",
        "bg-white disabled:bg-white",
        { "text-red-800": hasError }
      )}
    ></textarea>
  );
};
