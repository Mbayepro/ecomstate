import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Nettoie et prépare le texte français pour une prononciation naturelle et fluide.
 */
function normalizeFrenchTextForSpeech(raw: string): string {
  return raw
    .replace(/[#*_`~>•·]/g, " ")
    .replace(/→/g, " ")
    .replace(/&laquo;|&raquo;|«|»/g, " ")
    .replace(/\bFCFA\b/gi, "francs CFA")
    .replace(/\bXOF\b/gi, "francs CFA")
    .replace(/\bXAF\b/gi, "francs CFA")
    .replace(/\bcmd\b/gi, "commandes")
    .replace(/\bCOD\b/gi, "paiement à la livraison")
    .replace(/\bIA\b/g, "I A")
    .replace(/\(s\)/gi, "s")
    .replace(/%/g, " pourcent")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Découpe un texte long en segments naturels <= 175 caractères sur la ponctuation
 * afin de garantir une synthèse complète sans coupure de mots.
 */
function splitIntoSpeechChunks(text: string, maxLen = 175): string[] {
  const sentences = text
    .split(/(?<=[.!?;:])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks: string[] = [];

  for (const sentence of sentences) {
    if (sentence.length <= maxLen) {
      chunks.push(sentence);
      continue;
    }

    // Découpage secondaire sur les virgules ou espaces
    const clauses = sentence.split(/(?<=,)\s+/);
    let current = "";

    for (const clause of clauses) {
      if ((current + " " + clause).trim().length <= maxLen) {
        current = (current + " " + clause).trim();
      } else {
        if (current) chunks.push(current);
        if (clause.length <= maxLen) {
          current = clause;
        } else {
          const words = clause.split(/\s+/);
          let wordBuf = "";
          for (const w of words) {
            if ((wordBuf + " " + w).trim().length <= maxLen) {
              wordBuf = (wordBuf + " " + w).trim();
            } else {
              if (wordBuf) chunks.push(wordBuf);
              wordBuf = w.slice(0, maxLen);
            }
          }
          current = wordBuf;
        }
      }
    }
    if (current) chunks.push(current);
  }

  return chunks.slice(0, 12); // Sécurité anti-abus
}

export async function GET(request: NextRequest) {
  const rawText = request.nextUrl.searchParams.get("text") ?? "";
  const cleaned = normalizeFrenchTextForSpeech(rawText);

  if (!cleaned) {
    return NextResponse.json({ error: "Texte vide" }, { status: 400 });
  }

  const chunks = splitIntoSpeechChunks(cleaned);
  if (chunks.length === 0) {
    return NextResponse.json({ error: "Aucun contenu vocal" }, { status: 400 });
  }

  try {
    const buffers: Buffer[] = [];

    for (const chunk of chunks) {
      const ttsUrl = new URL("https://translate.googleapis.com/translate_tts");
      ttsUrl.searchParams.set("ie", "UTF-8");
      ttsUrl.searchParams.set("tl", "fr");
      ttsUrl.searchParams.set("client", "tw-ob");
      ttsUrl.searchParams.set("ttsspeed", "0.95");
      ttsUrl.searchParams.set("q", chunk);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      try {
        const res = await fetch(ttsUrl.toString(), {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            Referer: "https://translate.google.com/",
          },
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Upstream TTS HTTP ${res.status}`);
        }

        const arrBuf = await res.arrayBuffer();
        if (arrBuf.byteLength > 0) {
          buffers.push(Buffer.from(arrBuf));
        }
      } finally {
        clearTimeout(timeout);
      }
    }

    if (buffers.length === 0) {
      return NextResponse.json(
        { error: "Audio indisponible" },
        { status: 502 }
      );
    }

    const combined = Buffer.concat(buffers);

    return new NextResponse(combined, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(combined.byteLength),
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Synthèse serveur indisponible, bascule locale requise" },
      { status: 503 }
    );
  }
}
