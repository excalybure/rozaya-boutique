import clsx from "clsx";
import Price from "./price";

const Label = ({
  title,
  amount,
  currencyCode,
  position = "bottom",
}: {
  title: string;
  amount: string;
  currencyCode: string;
  position?: "bottom" | "center";
}) => {
  return (
    <div
      className={clsx(
        "absolute bottom-0 left-0 flex w-full px-4 pb-4 @container/label",
        {
          "lg:px-20 lg:pb-[35%]": position === "center",
        },
      )}
    >
      <div className="flex items-center border border-cream/20 bg-burgundy/90 p-1 font-sans text-xs font-semibold text-cream backdrop-blur-md">
        <h3 className="mr-4 line-clamp-2 grow pl-2 leading-none tracking-tight text-cream">
          {title}
        </h3>
        <Price
          className="flex-none bg-gold px-3 py-2 text-burgundy-dark"
          amount={amount}
          currencyCode={currencyCode}
          currencyCodeClassName="hidden @[275px]/label:inline"
        />
      </div>
    </div>
  );
};

export default Label;
