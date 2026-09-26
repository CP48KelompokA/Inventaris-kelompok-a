import assert from "node:assert/strict";
import test from "node:test";
import { nextStock, opposite } from "../src/lib/stock-rules";

test("barang masuk dan keluar menghitung stok", () => {
  assert.equal(nextStock(3, "in", 2), 5);
  assert.equal(nextStock(3, "out", 3), 0);
});

test("stok tidak boleh negatif atau overflow", () => {
  assert.throws(() => nextStock(2, "out", 3), /melebihi stok/);
  assert.throws(() => nextStock(Number.MAX_SAFE_INTEGER, "in", 1), /terlalu besar/);
});

test("jumlah transaksi harus bilangan bulat positif", () => {
  for (const quantity of [0, -1, 1.5, Number.NaN]) {
    assert.throws(() => nextStock(3, "in", quantity), /bilangan bulat positif/);
  }
});

test("koreksi membalik jenis transaksi", () => {
  assert.equal(opposite("in"), "out");
  assert.equal(opposite("out"), "in");
  const stock = nextStock(4, "in", 2);
  assert.equal(nextStock(stock, opposite("in"), 2), 4);
});
