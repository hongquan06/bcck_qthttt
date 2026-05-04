import crypto from "crypto";

export function sortObject(obj: Record<string, string>) {
  return Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {} as Record<string, string>);
}

export function createVnpaySignature(
  sortedParams: Record<string, string>,
  secretKey: string
): string {
  // ✅ KHÔNG encode khi ký — đây là chuẩn VNPAY
  const signData = Object.keys(sortedParams)
    .map((key) => `${key}=${sortedParams[key]}`)
    .join("&");

  console.log("SignData:", signData);

  return crypto
    .createHmac("sha512", secretKey)
    .update(signData, "utf-8")
    .digest("hex");
}

export function formatDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const gmt7 = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return (
    gmt7.getUTCFullYear().toString() +
    pad(gmt7.getUTCMonth() + 1) +
    pad(gmt7.getUTCDate()) +
    pad(gmt7.getUTCHours()) +
    pad(gmt7.getUTCMinutes()) +
    pad(gmt7.getUTCSeconds())
  );
}