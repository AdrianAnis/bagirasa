import "server-only";

import { GEMINI_MODEL } from "@/lib/config";

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

export type WasteInsight = {
  summary: string;
  peakWindow: string;
  impact: {
    mealsRescued: number;
    estKg: number;
    estCo2Kg: number;
  };
  recommendations: string[];
};

export type InsightOutcome =
  | { status: "ok"; insight: WasteInsight }
  | { status: "skipped"; reason: string }
  | { status: "failed"; reason: string };

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    peakWindow: { type: "string" },
    impact: {
      type: "object",
      properties: {
        mealsRescued: { type: "number" },
        estKg: { type: "number" },
        estCo2Kg: { type: "number" },
      },
      required: ["mealsRescued", "estKg", "estCo2Kg"],
    },
    recommendations: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["summary", "peakWindow", "impact", "recommendations"],
};

function buildPrompt(payload: unknown): string {
  return [
    "Kamu asisten analitik untuk BagiRasa, platform penyaluran surplus makanan dari rumah makan ke panti asuhan dan rumah lansia di Indonesia.",
    "Berdasarkan data agregat donasi satu restoran di bawah ini, tulis insight singkat dalam Bahasa Indonesia yang ramah dan konkret.",
    "",
    "Aturan:",
    "- summary: 2-3 kalimat merangkum tren donasi restoran ini.",
    "- peakWindow: kapan surplus paling sering muncul, misal 'malam hari sekitar pukul 20.00'.",
    "- impact: pakai angka yang sudah dihitung di data, jangan mengarang angka baru.",
    "- recommendations: 3 saran praktis untuk mengurangi surplus atau menyalurkannya lebih cepat.",
    "- Jangan menyebut nama panti tertentu. Jangan memberi klaim medis atau gizi.",
    "",
    "Data:",
    JSON.stringify(payload),
  ].join("\n");
}

export async function generateWasteInsight(
  payload: unknown,
): Promise<InsightOutcome> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return { status: "skipped", reason: "GEMINI_API_KEY belum diisi" };
  }

  try {
    const response = await fetch(
      `${GEMINI_ENDPOINT}/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildPrompt(payload) }] }],
          generationConfig: {
            temperature: 0.4,
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA,
          },
        }),
      },
    );

    if (!response.ok) {
      return {
        status: "failed",
        reason: `Gemini membalas ${response.status}`,
      };
    }

    const result = await response.json();
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (typeof text !== "string") {
      return { status: "failed", reason: "Balasan Gemini tidak berisi teks" };
    }

    const parsed = JSON.parse(text) as WasteInsight;

    if (!parsed.summary || !Array.isArray(parsed.recommendations)) {
      return { status: "failed", reason: "Bentuk balasan tidak sesuai" };
    }

    return { status: "ok", insight: parsed };
  } catch (error) {
    return {
      status: "failed",
      reason: error instanceof Error ? error.message : "Permintaan gagal",
    };
  }
}
