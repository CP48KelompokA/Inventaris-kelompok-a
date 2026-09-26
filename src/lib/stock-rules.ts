export function nextStock(current: number, type: "in" | "out", quantity: number) {
  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    throw new Error("Jumlah transaksi harus bilangan bulat positif.");
  }
  const next = current + (type === "in" ? quantity : -quantity);
  if (next < 0) throw new Error("Jumlah keluar melebihi stok tersedia.");
  if (!Number.isSafeInteger(next)) throw new Error("Jumlah stok terlalu besar.");
  return next;
}

export function opposite(type: "in" | "out") {
  return type === "in" ? "out" : "in";
}
