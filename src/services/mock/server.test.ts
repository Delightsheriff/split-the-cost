import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@react-native-async-storage/async-storage", () => ({ default: {} }));

const { seed } = await import("./db");
const { handleMock, MockHttpError } = await import("./server");

type Db = ReturnType<typeof seed>;
let db: Db;
const YOU = "mock.u_you";
const as = (token: string) => ({
  get: (url: string) => handleMock(db, "GET", url, {}, token),
  post: (url: string, body: object = {}) => handleMock(db, "POST", url, body, token),
  patch: (url: string, body: object) => handleMock(db, "PATCH", url, body, token),
  del: (url: string) => handleMock(db, "DELETE", url, {}, token),
});
const you = () => as(YOU);

beforeEach(() => {
  db = seed();
});

describe("group details", () => {
  it("returns balances in cents that add up across the group", async () => {
    const details = await you().get("/api/groups/g_trip/details");
    // Paid 120.00, owes a quarter of 256.50 with the leftover cent.
    expect(details.myBalanceCents).toBe(12000 - 3000 - 1163 - 2250);
    const paid = details.suggestedPayments.reduce((a: number, p: { cents: number }) => a + p.cents, 0);
    expect(paid).toBeGreaterThan(0);
    expect(details.expenses[0].shares[0]).toHaveProperty("user.name");
  });

  it("splits the electricity by shares", async () => {
    const { expenses } = await you().get("/api/groups/g_flat/details");
    const electricity = expenses.find((e: { description: string }) => e.description === "Electricity token");
    expect(electricity.shares.map((s: { cents: number }) => s.cents)).toEqual([3200, 1600, 1600]);
  });
});

describe("expenses", () => {
  const body = {
    groupId: "g_trip",
    description: "Boat ride",
    amountCents: 4000,
    type: "transport",
    split: { type: "percent", members: ["u_you", "u_tari"], values: { u_you: 2500, u_tari: 7500 } },
  };

  it("creates with a percentage split", async () => {
    const expense = await you().post("/api/expenses", body);
    expect(expense.shares.map((s: { cents: number }) => s.cents)).toEqual([1000, 3000]);
    expect(expense.paidBy._id).toBe("u_you");
  });

  it("takes several payers and credits each one", async () => {
    const before = (await you().get("/api/groups/g_trip/details")).myBalanceCents;
    const expense = await you().post("/api/expenses", {
      ...body,
      payers: [
        { userId: "u_you", cents: 1000 },
        { userId: "u_tari", cents: 3000 },
      ],
    });
    expect(expense.paidBy._id).toBe("u_tari");
    expect(expense.payers.map((p: { cents: number }) => p.cents)).toEqual([1000, 3000]);
    // You paid 10.00 and your share is 10.00, so your balance doesn't move.
    expect((await you().get("/api/groups/g_trip/details")).myBalanceCents).toBe(before);
  });

  it("rejects payers that don't cover the total", async () => {
    await expect(you().post("/api/expenses", { ...body, payers: [{ userId: "u_you", cents: 100 }] })).rejects.toThrow(
      "Payments add up to 100 cents, not 4000",
    );
  });

  it("keeps several payers when only the description changes, and drops them for a new single payer", async () => {
    const payers = [
      { userId: "u_you", cents: 1000 },
      { userId: "u_tari", cents: 3000 },
    ];
    const { _id } = await you().post("/api/expenses", { ...body, payers });
    expect((await you().patch(`/api/expenses/${_id}`, { description: "Boat" })).payers).toHaveLength(2);
    expect((await you().patch(`/api/expenses/${_id}`, { paidBy: "u_ada" })).payers).toHaveLength(1);
  });

  it("rejects a split that doesn't add up or includes outsiders", async () => {
    await expect(you().post("/api/expenses", { ...body, split: { ...body.split, values: { u_you: 1 } } })).rejects.toThrow(
      "Percentages must add up to 100",
    );
    await expect(you().post("/api/expenses", { ...body, split: { type: "equal", members: ["u_femi"] } })).rejects.toThrow(
      "Cannot split with users not in the group",
    );
    await expect(you().post("/api/expenses", { ...body, amountCents: 10.5 })).rejects.toThrow("Amount must be more than zero");
  });

  it("edits only what is sent, and recomputes shares when the amount changes", async () => {
    const { _id } = await you().post("/api/expenses", body);
    const renamed = await you().patch(`/api/expenses/${_id}`, { description: "Boat ride back" });
    expect(renamed.description).toBe("Boat ride back");
    expect(renamed.split.type).toBe("percent");

    const bigger = await you().patch(`/api/expenses/${_id}`, { amountCents: 8000 });
    expect(bigger.shares.map((s: { cents: number }) => s.cents)).toEqual([2000, 6000]);
  });

  it("deletes, and the balance goes back", async () => {
    const before = (await you().get("/api/groups/g_trip/details")).myBalanceCents;
    const { _id } = await you().post("/api/expenses", body);
    await you().del(`/api/expenses/${_id}`);
    expect((await you().get("/api/groups/g_trip/details")).myBalanceCents).toBe(before);
  });

  it("is off limits to people outside the group", async () => {
    await expect(as("mock.u_femi").get("/api/groups/g_trip/details")).rejects.toBeInstanceOf(MockHttpError);
  });
});

describe("settlements", () => {
  it("lets the person being paid record it", async () => {
    const tari = await as("mock.u_tari").get("/api/groups/g_trip/details");
    await you().post("/api/settlements", { groupId: "g_trip", paidBy: "u_tari", paidTo: "u_you", amountCents: 500 });
    expect((await as("mock.u_tari").get("/api/groups/g_trip/details")).myBalanceCents).toBe(tari.myBalanceCents + 500);
  });

  it("only records payments you're part of", async () => {
    await expect(
      you().post("/api/settlements", { groupId: "g_trip", paidBy: "u_tari", paidTo: "u_ada", amountCents: 100 }),
    ).rejects.toThrow("You can only record payments you made or received");
  });

  it("lets a debtor pay what they owe, not more", async () => {
    const kemi = as("mock.u_kemi");
    const { myBalanceCents } = await kemi.get("/api/groups/g_trip/details");
    expect(myBalanceCents).toBeLessThan(0);
    await expect(kemi.post("/api/settlements", { groupId: "g_trip", paidTo: "u_you", amountCents: -myBalanceCents + 1 })).rejects.toThrow(
      "Cannot settle more than you owe",
    );
    const payment = await kemi.post("/api/settlements", { groupId: "g_trip", paidTo: "u_you", amountCents: -myBalanceCents });
    expect((await kemi.get("/api/groups/g_trip/details")).myBalanceCents).toBe(0);

    await kemi.del(`/api/settlements/${payment._id}`);
    expect((await kemi.get("/api/groups/g_trip/details")).myBalanceCents).toBe(myBalanceCents);
  });

  it("follows the simplified plan, even to someone you never shared an expense with", async () => {
    // In Flat 4B the plan has Ada paying Femi, though Ada's debt is partly to you.
    const ada = as("mock.u_ada");
    const { suggestedPayments } = await ada.get("/api/groups/g_flat/details");
    const toFemi = suggestedPayments.find((p: { to: { _id: string } }) => p.to._id === "u_femi");
    await ada.post("/api/settlements", { groupId: "g_flat", paidTo: "u_femi", amountCents: toFemi.cents });
    const after = await ada.get("/api/groups/g_flat/details");
    expect(after.myBalanceCents).toBe(0);
    expect(after.suggestedPayments.every((p: { from: { _id: string } }) => p.from._id !== "u_ada")).toBe(true);
  });

  it("stops someone who is owed from paying", async () => {
    await expect(you().post("/api/settlements", { groupId: "g_trip", paidTo: "u_ada", amountCents: 100 })).rejects.toThrow(
      "You don't owe anything",
    );
  });
});

describe("invites", () => {
  it("joins an invited email's group on sign-up", async () => {
    const { token } = await handleMock(db, "POST", "/api/auth/signup", { name: "Zainab", email: "zainab@example.com", password: "x" });
    const groups = await as(token).get("/api/groups");
    expect(groups.map((g: { name: string }) => g.name)).toEqual(["Flat 4B"]);
    expect(db.groups.find((g) => g._id === "g_flat")!.invitedEmails).toEqual([]);
  });

  it("previews and accepts an invite link", async () => {
    const code = db.groups.find((g) => g._id === "g_trip")!.inviteCode;
    const femi = as("mock.u_femi");
    expect(await femi.get(`/api/invites/${code}`)).toMatchObject({ group: { name: "Obudu Weekend", memberCount: 4 }, alreadyMember: false });
    await femi.post(`/api/invites/${code}/accept`);
    expect((await femi.get(`/api/invites/${code}`)).alreadyMember).toBe(true);
    await expect(femi.get("/api/invites/NOPE1234")).rejects.toThrow("isn't valid");
  });

  it("adds existing accounts straight away and holds the rest as invites", async () => {
    const group = await you().post("/api/groups/g_lunch/members", { emails: ["ada@example.com", "new@example.com"] });
    expect(group.members.map((m: { _id: string }) => m._id)).toContain("u_ada");
    expect(group.invitedEmails).toEqual(["new@example.com"]);
  });
});

describe("groups", () => {
  it("won't let you leave owing money, or delete someone else's group", async () => {
    await expect(as("mock.u_kemi").post("/api/groups/g_trip/leave")).rejects.toThrow("Settle up before leaving");
    await expect(as("mock.u_kemi").del("/api/groups/g_trip")).rejects.toThrow("Only the person who made this group");
  });

  it("locks the currency once there are expenses", async () => {
    await expect(you().patch("/api/groups/g_trip", { currency: "EUR" })).rejects.toThrow("Currency can't change");
    const fresh = await you().post("/api/groups", { name: "Empty", members: [] });
    expect((await you().patch(`/api/groups/${fresh._id}`, { currency: "NGN" })).currency).toBe("NGN");
  });
});

describe("account deletion", () => {
  it("anonymises the account and keeps the group's history", async () => {
    await as("mock.u_tari").del("/api/auth/me");
    await expect(as("mock.u_tari").get("/api/auth/me")).rejects.toThrow("Invalid token");

    const details = await you().get("/api/groups/g_trip/details");
    expect(details.group.members.map((m: { _id: string }) => m._id)).not.toContain("u_tari");
    expect(details.expenses.find((e: { description: string }) => e.description === "Suya by the lodge").paidBy.name).toBe("Deleted user");
    // Still in the plan so what they owed isn't silently dropped.
    expect(details.suggestedPayments.some((p: { from: { _id: string } }) => p.from._id === "u_tari")).toBe(true);
  });
});
