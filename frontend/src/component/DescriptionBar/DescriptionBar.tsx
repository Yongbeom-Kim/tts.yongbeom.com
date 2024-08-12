import classNames from "classnames";

const DescriptionBar: React.FC<React.HTMLAttributes<HTMLDivElement>> = (
  {className, ...props}
) => {
  return (
    <div
      className={classNames(
        "w-full bg-slate-600 flex flex-col justify-start items-start text-slate-50",
        className
      )}
      {...props}
    >
        <h2 className="text-xl font-bold">Text-To-Speech Converter</h2>
        <div>
          This service converts some speech (.wav) file to a text transcript.
        </div>
    </div>
  );
};

export default DescriptionBar;
