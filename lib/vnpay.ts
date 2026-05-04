import crypto from "crypto";

export function sortObject(obj: Record<string, string | number>) {
  const sorted: Record<string, string> = {};
  const str: string[] = [];

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();

  for (let i = 0; i < str.length; i++) {
    const decodedKey = decodeURIComponent(str[i]);
    sorted[str[i]] = encodeURIComponent(String(obj[decodedKey])).replace(/%20/g, "+");
  }

  return sorted;
}

export function createVnpaySignature(
  sortedParams: Record<string, string>,
  secretKey: string
): string {
  // ✅ Ký trên dữ liệu đã encode (key=encodedValue&...)
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