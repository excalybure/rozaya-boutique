import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

export default function OpenCart({
  className,
  quantity,
}: {
  className?: string;
  quantity?: number;
}) {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center border border-burgundy/15 text-burgundy transition-colors hover:border-burgundy">
      <ShoppingCartIcon
        className={clsx(
          "h-4 transition-all ease-in-out hover:scale-110",
          className,
        )}
      />

      {quantity ? (
          <div className="absolute right-0 top-0 -mr-2 -mt-2 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-semibold text-burgundy-dark">
          {quantity}
        </div>
      ) : null}
    </div>
  );
}
