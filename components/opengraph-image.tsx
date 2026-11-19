import { ImageResponse } from "next/og";
import { join } from "path";
import { readFile } from "fs/promises";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Rozaya Boutique gold RB monogram on burgundy";

export default async function OpengraphImage({
  title = process.env.SITE_NAME || "Rozaya Boutique",
}: { title?: string } = {}): Promise<ImageResponse> {
  const [file, monogram] = await Promise.all([
    readFile(join(process.cwd(), "fonts/Inter-Bold.ttf")),
    readFile(join(process.cwd(), "public/brand/rb-monogram.png")),
  ]);
  const font = Uint8Array.from(file).buffer;

  return new ImageResponse(
    (
      <div
        tw="flex h-full w-full flex-col items-center justify-center px-20"
        style={{ backgroundColor: "#faf6f0", color: "#4a1520" }}
      >
        <img
          src={`data:image/png;base64,${monogram.toString("base64")}`}
          alt=""
          width={240}
          height={240}
          tw="flex-none rounded-3xl"
        />
        <p tw="mt-8 mb-0 text-center text-6xl font-bold">{title}</p>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Inter",
          data: font,
          style: "normal",
          weight: 700,
        },
      ],
    },
  );
}
