import clsx from "clsx";

const Price = ({
  amount,
  className,
  currencyCode = "USD",
  currencyCodeClassName,
}: {
  amount: string;
  className?: string;
  currencyCode: string;
  currencyCodeClassName?: string;
} & React.ComponentProps<"p">) => {
  const showCurrencyCode = currencyCode.toUpperCase() !== "USD";

  return (
    <p suppressHydrationWarning={true} className={className}>
      {`${new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currencyCode,
        currencyDisplay: "narrowSymbol",
      }).format(parseFloat(amount))}`}
      {showCurrencyCode ? (
        <span
          className={clsx("ml-1 inline", currencyCodeClassName)}
        >{`${currencyCode}`}</span>
      ) : null}
    </p>
  );
};

export default Price;
