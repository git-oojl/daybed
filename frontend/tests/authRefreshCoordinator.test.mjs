import assert from "node:assert/strict";
import test from "node:test";

import { createSingleFlightCoordinator } from "../src/services/authRefreshCoordinator.js";

test("concurrent callers share one refresh operation", async () => {
  const coordinator = createSingleFlightCoordinator();
  let calls = 0;
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const factory = async () => {
    calls += 1;
    await gate;
    return { access: "fresh" };
  };

  const first = coordinator.run(factory);
  const second = coordinator.run(factory);
  assert.equal(first, second);
  assert.equal(calls, 0); // starts in the next microtask

  await Promise.resolve();
  assert.equal(calls, 1);
  release();
  assert.deepEqual(await first, { access: "fresh" });
  assert.equal(coordinator.active, false);
});

test("a failed refresh is cleared before the next attempt", async () => {
  const coordinator = createSingleFlightCoordinator();
  let calls = 0;

  await assert.rejects(
    coordinator.run(async () => {
      calls += 1;
      throw new Error("invalid refresh");
    }),
    /invalid refresh/,
  );

  const result = await coordinator.run(async () => {
    calls += 1;
    return "recovered";
  });
  assert.equal(result, "recovered");
  assert.equal(calls, 2);
});

test("reset prevents a stale in-flight operation from being reused", async () => {
  const coordinator = createSingleFlightCoordinator();
  let release;
  const stale = coordinator.run(() => new Promise((resolve) => { release = resolve; }));
  coordinator.reset();
  const current = coordinator.run(async () => "current-session");

  assert.notEqual(stale, current);
  assert.equal(await current, "current-session");
  release("stale-session");
  assert.equal(await stale, "stale-session");
});
