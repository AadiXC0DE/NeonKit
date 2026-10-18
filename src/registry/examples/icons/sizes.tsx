"use client";

import * as React from "react";
import { Calendar, Link, Settings, Shuffle } from "@/components/ui/icons";
import { Switch } from "@/components/ui/switch";

const sizes = [12, 16, 20, 24, 32, 48];
const glyphs = [Settings, Link, Shuffle, Calendar];
const STROKE = 1.75;

/** Draws one icon into a canvas at 1 device pixel per CSS pixel, then shows it magnified, square pixels and all. */
function Pixels({ index, size, absolute }: { index: number; size: number; absolute: boolean }) {
  const Glyph = glyphs[index];
  const source = React.useRef<SVGSVGElement>(null);
  const canvas = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const svg = source.current;
    const target = canvas.current?.getContext("2d");
    if (!svg || !target) return;
    const image = new Image();
    image.onload = () => {
      target.clearRect(0, 0, size, size);
      target.drawImage(image, 0, 0, size, size);
    };
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
  }, [index, size, absolute]);

  return (
    <>
      <Glyph ref={source} size={size} absoluteStrokeWidth={absolute} color="#e8edf5" className="hidden" />
      <canvas
        ref={canvas}
        width={size}
        height={size}
        aria-hidden
        className="size-16 rounded-md bg-[#05060a] [image-rendering:pixelated] @xl:size-28"
      />
    </>
  );
}

export default function IconsSizes() {
  const [absolute, setAbsolute] = React.useState(true);

  return (
    <div className="@container grid w-full max-w-[42rem] gap-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Switch checked={absolute} onCheckedChange={setAbsolute} size="sm" label="absoluteStrokeWidth" />
        <p className="text-[13px] text-white/55">
          {absolute ? "The tube stays 1.75px at every size." : "The tube scales with the icon."}
        </p>
      </div>

      <table className="w-full table-fixed border-collapse text-white/85">
        <caption className="sr-only">Four icons at six sizes</caption>
        <thead>
          <tr>
            {sizes.map((size) => (
              <th key={size} scope="col" className="pb-5 text-center align-bottom font-normal">
                <span className="block font-mono text-[12px] tabular-nums text-white/85">{size}</span>
                <span className="mt-1 block font-mono text-[11px] tabular-nums text-white/45">
                  {(absolute ? STROKE : (STROKE * size) / 24).toFixed(2)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {glyphs.map((Glyph, row) => (
            <tr key={row}>
              {sizes.map((size) => (
                <td key={size} className="h-16 text-center align-middle">
                  <Glyph size={size} absoluteStrokeWidth={absolute} className="inline-block" aria-hidden />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <figure className="grid gap-4 border-t border-white/[0.07] pt-8">
        <div className="flex justify-between gap-2">
          {glyphs.map((_, index) => (
            <Pixels key={index} index={index} size={16} absolute={absolute} />
          ))}
        </div>
        <figcaption className="text-[13px] text-white/55">
          The same four at 16px on a 1x screen, drawn pixel for pixel and then magnified.
        </figcaption>
      </figure>
    </div>
  );
}
