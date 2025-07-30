export function bigIntToBytes(value: bigint): Uint8Array {
  const hex = value.toString(16);
  const byteLength = Math.ceil(hex.length / 2);
  const bytes = new Uint8Array(byteLength);
  for (let i = 0; i < byteLength; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }

  return bytes;
}

export function toBase64FromBytes(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}
