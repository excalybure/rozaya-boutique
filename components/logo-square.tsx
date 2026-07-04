import Image from "next/image";

export default function LogoSquare({ size }: { size?: "sm" | undefined }) {
  const dimension = size === "sm" ? 30 : 40;
  return (
    <div className="flex flex-none items-center justify-center overflow-hidden rounded-xl">
      <Image
        src="/brand/logo-monogram.png"
        alt="Rozaya Boutique"
        width={dimension}
        height={dimension}
        priority
        className="object-contain"
      />
    </div>
  );
}
