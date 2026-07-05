import clsx from "clsx";

function Grid(props: React.ComponentProps<"ul">) {
  return (
    <ul
      {...props}
      className={clsx(
        "grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5",
        props.className,
      )}
    >
      {props.children}
    </ul>
  );
}

function GridItem(props: React.ComponentProps<"li">) {
  return (
    <li
      {...props}
      className={clsx("aspect-square transition-opacity", props.className)}
    >
      {props.children}
    </li>
  );
}

Grid.Item = GridItem;

export default Grid;
