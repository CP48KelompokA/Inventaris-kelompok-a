import assert from "node:assert/strict";
import { test } from "node:test";
import { pageBounds, parsePage } from "../src/lib/pagination";

test("halaman kosong dan parameter tidak valid kembali ke halaman pertama", () => {
  assert.deepEqual(pageBounds(0, parsePage("999")), { page: 1, pages: 1, offset: 0 });
  for (const input of ["0", "-1", "abc", "9007199254740992", undefined]) {
    assert.equal(parsePage(input), 1);
  }
});

test("halaman terakhir dibatasi dan offset menunjuk 20 data per halaman", () => {
  assert.deepEqual(pageBounds(45, parsePage("3")), { page: 3, pages: 3, offset: 40 });
  assert.deepEqual(pageBounds(45, parsePage("9")), { page: 3, pages: 3, offset: 40 });
});
