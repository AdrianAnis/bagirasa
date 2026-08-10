import "server-only";

const FONNTE_ENDPOINT = "https://api.fonnte.com/send";

export type WhatsAppOutcome =
  | { status: "sent"; providerResponse: unknown }
  | { status: "skipped"; reason: string }
  | { status: "failed"; reason: string; providerResponse?: unknown };

function normalisePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("62")) {
    return digits;
  }

  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }

  return digits;
}

export async function sendWhatsApp(
  targetPhone: string,
  message: string,
): Promise<WhatsAppOutcome> {
  const token = process.env.FONNTE_API_TOKEN;

  if (!token) {
    return { status: "skipped", reason: "FONNTE_API_TOKEN belum diisi" };
  }

  const target = normalisePhone(targetPhone);

  if (target.length < 10) {
    return { status: "skipped", reason: "Nomor tujuan tidak valid" };
  }

  try {
    const response = await fetch(FONNTE_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ target, message, countryCode: "62" }),
    });

    const providerResponse = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        status: "failed",
        reason: `Fonnte membalas ${response.status}`,
        providerResponse,
      };
    }

    return { status: "sent", providerResponse };
  } catch (error) {
    return {
      status: "failed",
      reason: error instanceof Error ? error.message : "Permintaan gagal",
    };
  }
}
