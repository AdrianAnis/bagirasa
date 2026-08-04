export async function sendWhatsApp(targetPhone: string, message: string): Promise<never> {
  throw new Error(`Not implemented: sendWhatsApp ${targetPhone} ${message}`);
}
