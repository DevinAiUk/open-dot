"use client";

import Image from "next/image";
import { useState } from "react";
import DotOrb from "./DotOrb";
import type { DotStatus, Look } from "@/lib/types";

type Props = {
  name: string;
  look?: Look;
  status?: DotStatus;
  size?: number;
  className?: string;
};

export default function WorkSprite({ name, look, status = "idle", size = 40, className }: Props) {
  const [imgError, setImgError] = useState(false);
  const slug = name.toLowerCase().trim();

  // Try sprite asset first, fallback to DotOrb if not found or errored
  if (!imgError) {
    return (
      <span
        className={`relative inline-flex items-center justify-center shrink-0 ${status === "working" ? "animate-[dot-bob_0.5s_ease-in-out_infinite]" : status === "waiting" ? "animate-[dot-bob_1.2s_ease-in-out_infinite]" : ""} ${className ?? ""}`}
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/sprites/${slug}.svg`}
          alt={name}
          width={size}
          height={size}
          onError={() => setImgError(true)}
          className="size-full object-contain"
        />
      </span>
    );
  }

  if (look) {
    return <DotOrb look={look} status={status} size={size} />;
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-brand/10 font-medium text-brand text-[13px] ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      {name.slice(0, 1)}
    </span>
  );
}

