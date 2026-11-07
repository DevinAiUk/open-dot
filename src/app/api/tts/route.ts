import { NextRequest, NextResponse } from "next/server";
import { hasKey, openai } from "@/server/agent/client";

export async function POST(req: NextRequest) {
  try {
    const { text, voice = "alloy" } = (await req.json()) as { text?: string; voice?: string };
    if (!text?.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // If OpenAI key is available, we can optionally provide server-side tts-1 audio
    if (hasKey()) {
      try {
        const client = openai();
        const mp3 = await client.audio.speech.create({
          model: "tts-1",
          voice: (voice as any) || "alloy",
          input: text.slice(0, 4096),
        });
        const buffer = Buffer.from(await mp3.arrayBuffer());
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Content-Length": buffer.length.toString(),
          },
        });
      } catch (err: any) {
        console.warn("[TTS] Server-side speech fallback:", err?.message);
      }
    }

    return NextResponse.json({
      status: "native",
      engine: "web_speech",
      message: "Browser native Web Speech API available (0KB footprint)",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}

