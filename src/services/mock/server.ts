import { DEMO_USER_ID, getDb, newId, saveDb, type MockDb, type MockExpense } from "./db";

// An in-memory stand-in for split-the-cost-api. Routes, response shapes, balance
// maths and error messages follow the real server so screens can't tell the difference.

export class MockHttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

const LATENCY_MS = 350;
const TOKEN_PREFIX = "mock.";

const round = (n: number) => Math.round(n * 100) / 100;
const now = () => new Date().toISOString();

function userFromToken(db: MockDb, token: string | null) {
  const id = token?.startsWith(TOKEN_PREFIX) ? token.slice(TOKEN_PREFIX.length) : null;
  const user = db.users.find((u) => u._id === id);
  if (!user) throw new MockHttpError(401, "Invalid token");
  return user;
}

function publicUser(db: MockDb, id: string) {
  const u = db.users.find((x) => x._id === id);
  return { _id: id, name: u?.name ?? "Unknown", email: u?.email ?? "" };
}

function memberGroup(db: MockDb, groupId: string, userId: string, denied = "Access denied to this group") {
  const group = db.groups.find((g) => g._id === groupId);
  if (!group) throw new MockHttpError(404, "Group not found");
  if (!group.members.includes(userId)) throw new MockHttpError(403, denied);
  return group;
}

/** Positive = they owe you, negative = you owe them, as in the server's calculatePairBalances. */
function pairBalances(db: MockDb, groupId: string, me: string, members: string[]) {
  const pairs = new Map(members.filter((m) => m !== me).map((m) => [m, 0]));
  for (const e of db.expenses.filter((x) => x.groupId === groupId)) {
    const share = e.amount / e.splitBetween.length;
    if (e.paidBy === me) {
      for (const m of e.splitBetween) if (m !== me) pairs.set(m, (pairs.get(m) ?? 0) + share);
    }
    if (e.splitBetween.includes(me) && e.paidBy !== me) pairs.set(e.paidBy, (pairs.get(e.paidBy) ?? 0) - share);
  }
  for (const s of db.settlements.filter((x) => x.groupId === groupId)) {
    if (s.paidBy === me) pairs.set(s.paidTo, (pairs.get(s.paidTo) ?? 0) + s.amount);
    if (s.paidTo === me) pairs.set(s.paidBy, (pairs.get(s.paidBy) ?? 0) - s.amount);
  }
  return [...pairs].map(([userId, balance]) => ({ ...publicUser(db, userId), userId, balance: round(balance) }));
}

/** total paid - total owed + settlements made - settlements received. */
function netBalance(db: MockDb, groupId: string, userId: string) {
  let balance = 0;
  for (const e of db.expenses.filter((x) => x.groupId === groupId)) {
    if (e.paidBy === userId) balance += e.amount;
    if (e.splitBetween.includes(userId)) balance -= e.amount / e.splitBetween.length;
  }
  for (const s of db.settlements.filter((x) => x.groupId === groupId)) {
    if (s.paidBy === userId) balance += s.amount;
    if (s.paidTo === userId) balance -= s.amount;
  }
  return round(balance);
}

function populateGroup(db: MockDb, groupId: string) {
  const g = db.groups.find((x) => x._id === groupId)!;
  return { ...g, members: g.members.map((m) => publicUser(db, m)) };
}

type Body = Record<string, any>;

async function handle(db: MockDb, method: string, path: string, query: Map<string, string>, body: Body, token: string | null) {
  // Auth is simulated: any password works, and an email nobody has signs in as the demo account.
  if (method === "POST" && path === "/api/auth/login") {
    const user = db.users.find((u) => u.email === String(body.email).toLowerCase()) ?? publicUser(db, DEMO_USER_ID);
    return { token: TOKEN_PREFIX + user._id };
  }
  if (method === "POST" && path === "/api/auth/signup") {
    const email = String(body.email).toLowerCase();
    if (db.users.some((u) => u.email === email)) throw new MockHttpError(400, "Email already registered");
    const user = { _id: newId("u"), name: String(body.name), email, password: String(body.password) };
    db.users.push(user);
    // Stand in for an invite: the new account joins the demo trip so its screens aren't empty.
    db.groups[0]?.members.push(user._id);
    return { token: TOKEN_PREFIX + user._id };
  }

  const me = userFromToken(db, token);

  if (method === "GET" && path === "/api/auth/me") return { user: publicUser(db, me._id) };

  if (method === "GET" && path === "/api/groups") {
    return db.groups
      .filter((g) => g.members.includes(me._id))
      .sort((a, b) => b.lastActivity.localeCompare(a.lastActivity))
      .map((g) => populateGroup(db, g._id));
  }

  if (method === "POST" && path === "/api/groups") {
    const emails = [...new Set([me.email, ...(body.members as string[]).map((e) => e.toLowerCase().trim())])];
    const existing = db.users.filter((u) => emails.includes(u.email));
    const group = {
      _id: newId("g"),
      name: String(body.name).trim(),
      members: existing.map((u) => u._id),
      invitedEmails: emails.filter((e) => !existing.some((u) => u.email === e)),
      createdBy: me._id,
      lastActivity: now(),
      createdAt: now(),
      updatedAt: now(),
    };
    db.groups.push(group);
    return populateGroup(db, group._id);
  }

  const details = path.match(/^\/api\/groups\/([^/]+)\/details$/);
  if (method === "GET" && details) {
    const group = memberGroup(db, details[1], me._id, "Access denied");
    const balance = netBalance(db, group._id, me._id);
    return {
      group: populateGroup(db, group._id),
      expenses: db.expenses
        .filter((e) => e.groupId === group._id)
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((e) => ({ ...e, paidBy: publicUser(db, e.paidBy), splitBetween: e.splitBetween.map((m) => publicUser(db, m)) })),
      currentUserBalance: { balance, isSettled: Math.abs(balance) < 0.01, isOwed: balance > 0.01 },
      pairBalances: pairBalances(db, group._id, me._id, group.members),
    };
  }

  if (method === "POST" && path === "/api/expenses") {
    const group = memberGroup(db, body.groupId, me._id);
    const split = body.splitBetween as string[];
    if (!split?.length || !(body.amount > 0) || !body.description) throw new MockHttpError(400, "Validation failed");
    if (split.some((id) => !group.members.includes(id))) throw new MockHttpError(400, "Cannot split with users not in the group");
    const expense: MockExpense = {
      _id: newId("e"),
      groupId: group._id,
      description: String(body.description).trim(),
      amount: Number(body.amount),
      type: body.type ?? "other",
      paidBy: body.paidBy || me._id,
      splitBetween: split,
      date: now(),
      createdBy: me._id,
      createdAt: now(),
      updatedAt: now(),
    };
    db.expenses.push(expense);
    group.lastActivity = now();
    return { ...expense, paidBy: publicUser(db, expense.paidBy), splitBetween: split.map((m) => publicUser(db, m)) };
  }

  if (method === "POST" && path === "/api/settlements") {
    if (body.paidTo === me._id) throw new MockHttpError(400, "Cannot settle with yourself");
    const group = memberGroup(db, body.groupId, me._id);
    if (!group.members.includes(body.paidTo)) throw new MockHttpError(400, "Cannot settle with user not in the group");
    const pair = pairBalances(db, group._id, me._id, group.members).find((p) => p.userId === body.paidTo);
    if (!pair) throw new MockHttpError(400, "Invalid settlement");
    if (pair.balance >= 0) throw new MockHttpError(400, "You don't owe this person money. They owe you.");
    const owed = Math.abs(pair.balance);
    if (body.amount > owed + 0.01) throw new MockHttpError(400, `Cannot settle more than you owe. You owe $${owed.toFixed(2)}`);
    const settlement = {
      _id: newId("s"),
      groupId: group._id,
      paidBy: me._id,
      paidTo: String(body.paidTo),
      amount: Number(body.amount),
      note: body.note,
      date: now(),
      createdAt: now(),
      updatedAt: now(),
    };
    db.settlements.push(settlement);
    group.lastActivity = now();
    return { ...settlement, paidBy: publicUser(db, me._id), paidTo: publicUser(db, settlement.paidTo) };
  }

  if (method === "GET" && path === "/api/activities") {
    const groups = db.groups.filter((g) => g.members.includes(me._id));
    const nameOf = (id: string) => groups.find((g) => g._id === id)?.name ?? "";
    const inMine = (id: string) => groups.some((g) => g._id === id);
    const activities = [
      ...db.expenses.filter((e) => inMine(e.groupId)).map((e) => ({
        id: e._id,
        type: "expense" as const,
        groupId: e.groupId,
        groupName: nameOf(e.groupId),
        date: e.date,
        description: e.description,
        amount: e.amount,
        expenseType: e.type,
        paidBy: { id: e.paidBy, name: publicUser(db, e.paidBy).name },
        paidByCurrentUser: e.paidBy === me._id,
      })),
      ...db.settlements.filter((s) => inMine(s.groupId)).map((s) => ({
        id: s._id,
        type: "settlement" as const,
        groupId: s.groupId,
        groupName: nameOf(s.groupId),
        date: s.date,
        amount: s.amount,
        note: s.note,
        paidBy: { id: s.paidBy, name: publicUser(db, s.paidBy).name },
        paidTo: { id: s.paidTo, name: publicUser(db, s.paidTo).name },
        paidByCurrentUser: s.paidBy === me._id,
        paidToCurrentUser: s.paidTo === me._id,
      })),
    ].sort((a, b) => b.date.localeCompare(a.date));

    const days = { "This Week": 7, "This Month": 30 }[query.get("filter") ?? "All"];
    if (!days) return activities;
    const cutoff = new Date(Date.now() - days * 86_400_000).toISOString();
    return activities.filter((a) => a.date >= cutoff);
  }

  throw new MockHttpError(404, `No mock route for ${method} ${path}`);
}

export async function mockRequest<T>(endpoint: string, options: RequestInit, token: string | null): Promise<T> {
  await new Promise((r) => setTimeout(r, LATENCY_MS));
  const db = await getDb();
  // Parsed by hand: React Native's URL lacks pathname and searchParams.
  const [path, search = ""] = endpoint.split("?");
  const query = new Map(
    search
      .split("&")
      .filter(Boolean)
      .map((pair) => pair.split("=").map(decodeURIComponent) as [string, string]),
  );
  const body = typeof options.body === "string" ? JSON.parse(options.body) : {};
  const result = await handle(db, (options.method ?? "GET").toUpperCase(), path, query, body, token);
  await saveDb();
  // Round-trip through JSON like a real response, so callers never share objects with the store.
  return JSON.parse(JSON.stringify(result)) as T;
}
