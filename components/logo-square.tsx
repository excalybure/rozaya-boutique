import Image from "next/image";

export default function LogoSquare({ size }: { size?: "sm" | undefined }) {
  const dimension = size === "sm" ? 30 : 40;
  return (
    <div className="flex flex-none items-center justify-center">
      <Image
        src="/brand/monogram.svg"
        alt="Rozaya Boutique RB monogram"
        width={dimension}
        height={dimension}
        priority
        unoptimized
        className="object-contain"
      />
    </div>
  );
}
