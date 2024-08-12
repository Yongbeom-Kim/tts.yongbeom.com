import classNames from "classnames";

const HeaderBar: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({className, ...props}) => {
  return (
    <div
      className={classNames(
        "sticky w-screen top-0 flex flex-row items-center justify-start",
        className,
      )}
      {...props}
    >
      <h1 className="text-3xl font-bold text-slate-50">TTS Tool</h1>
    </div>
  );
};

export default HeaderBar;
