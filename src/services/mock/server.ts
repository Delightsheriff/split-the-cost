import { netBalances, simplifyDebts, type Ledger } from "@/src/domain/balances";
import { DEFAULT_CURRENCY } from "@/src/domain/money";
import { checkPayers, computeShares, mainPayer, SplitError, type Share, type Split } from "@/src/domain/splits";
import {
  DEMO_USER_ID,
  getDb,
  newId,
  newInviteCode,
  saveDb,
  type MockDb,
  type MockExpense,
  type MockGroup,
  type MockUser,
} from "./db";

// An in-memory stand-in for split-the-cost-api. Amounts are integer cents, and every
// balance comes from src/domain so the maths is the same tested code the API will run.

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
const EXPENSE_TYPES = ["food", "transport", "supplies", "fuel", "other"];

const now = () => new Date().toISOString();
const fail = (status: number, message: string): never => {
  throw new MockHttpError(status, message);
};

function userFromToken(db: MockDb, token: string | null) {
  const id = token?.startsWith(TOKEN_PREFIX) ? token.slice(TOKEN_PREFIX.length) : null;
  const user = db.users.find((u) => u._id === id && !u.deleted);
  return user ?? fail(401, "Invalid token");
}

function publicUser(db: MockDb, id: string) {
  const u = db.users.find((x) => x._id === id);
  if (!u || u.deleted) return { _id: id, name: "Deleted user", email: "" };
  return { _id: id, name: u.name, email: u.email };
}

function findGroup(db: MockDb, groupId: string, userId: string) {
  const group = db.groups.find((g) => g._id === groupId) ?? fail(404, "Group not found");
  if (!group.members.includes(userId)) fail(403, "Access denied to this group");
  return group;
}

function ledger(db: MockDb, groupId: string): Ledger {
  return {
    expenses: db.expenses.filter((e) => e.groupId === groupId),
    settlements: db.settlements
      .filter((s) => s.groupId === groupId)
      .map((s) => ({ paidBy: s.paidBy, paidTo: s.paidTo, cents: s.amountCents })),
  };
}

const myBalance = (db: MockDb, groupId: string, userId: string) => netBalances(ledger(db, groupId)).get(userId) ?? 0;

function populateGroup(db: MockDb, g: MockGroup, me: string) {
  return { ...g, members: g.members.map((m) => publicUser(db, m)), myBalanceCents: myBalance(db, g._id, me) };
}

function populateExpense(db: MockDb, e: MockExpense) {
  return {
    ...e,
    paidBy: publicUser(db, e.paidBy),
    payers: e.payers.map((p) => ({ user: publicUser(db, p.userId), cents: p.cents })),
    shares: e.shares.map((s) => ({ user: publicUser(db, s.userId), cents: s.cents })),
  };
}

const touch = (group: MockGroup) => {
  group.lastActivity = now();
  group.updatedAt = now();
};

/** Checks an expense body against the group and works out everyone's share. */
function readExpense(group: MockGroup, body: Body, me: string) {
  const description = String(body.description ?? "").trim();
  if (!description) fail(400, "Add a description");
  const amountCents = Number(body.amountCents);
  if (!Number.isSafeInteger(amountCents) || amountCents <= 0) fail(400, "Amount must be more than zero");
  const type = EXPENSE_TYPES.includes(body.type) ? body.type : "other";
  // One payer by `paidBy`, or several by `payers`.
  const payersIn: Share[] = Array.isArray(body.payers)
    ? body.payers.map((p: Body) => ({ userId: String(p.userId), cents: Number(p.cents) }))
    : [{ userId: String(body.paidBy || me), cents: amountCents }];
  if (!payersIn.every((p) => group.members.includes(p.userId))) fail(400, "The payer isn't in this group");
  const split = body.split as Split;
  if (!split?.members?.every((id) => group.members.includes(id))) fail(400, "Cannot split with users not in the group");
  try {
    const payers = checkPayers(amountCents, payersIn);
    return { description, amountCents, type, paidBy: mainPayer(payers), payers, split, shares: computeShares(amountCents, split) };
  } catch (e) {
    return fail(400, e instanceof SplitError ? e.message : "Invalid split");
  }
}

/** Someone with an account joins straight away; anyone else waits in invitedEmails until they sign up. */
function addMembersByEmail(db: MockDb, group: MockGroup, emails: string[]) {
  for (const email of emails.map((e) => e.toLowerCase().trim()).filter(Boolean)) {
    const user = db.users.find((u) => u.email === email && !u.deleted);
    if (user) {
      if (!group.members.includes(user._id)) group.members.push(user._id);
    } else if (!group.invitedEmails.includes(email)) {
      group.invitedEmails.push(email);
    }
  }
}

/** Moves a new account into every group that invited its email. Returns how many it joined. */
function acceptEmailInvites(db: MockDb, user: MockUser) {
  const groups = db.groups.filter((g) => g.invitedEmails.includes(user.email));
  for (const g of groups) {
    g.invitedEmails = g.invitedEmails.filter((e) => e !== user.email);
    g.members.push(user._id);
  }
  return groups.length;
}

type Body = Record<string, any>;

async function handle(db: MockDb, method: string, path: string, query: Map<string, string>, body: Body, token: string | null) {
  const route = (m: string, pattern: RegExp) => (method === m ? path.match(pattern) : null);
  let match: RegExpMatchArray | null;

  // Auth is simulated: any password works, and an email nobody has signs in as the demo account.
  if (route("POST", /^\/api\/auth\/login$/)) {
    const email = String(body.email).toLowerCase();
    const user = db.users.find((u) => u.email === email && !u.deleted) ?? publicUser(db, DEMO_USER_ID);
    return { token: TOKEN_PREFIX + user._id };
  }
  if (route("POST", /^\/api\/auth\/signup$/)) {
    const email = String(body.email).toLowerCase();
    if (db.users.some((u) => u.email === email && !u.deleted)) fail(400, "Email already registered");
    const user = { _id: newId("u"), name: String(body.name), email, password: String(body.password) };
    db.users.push(user);
    // With no invites waiting, join the demo trip so the new account's screens aren't empty.
    if (acceptEmailInvites(db, user) === 0) db.groups[0]?.members.push(user._id);
    return { token: TOKEN_PREFIX + user._id };
  }

  // Invite previews are public so a link can show the group before signing in.
  if ((match = route("GET", /^\/api\/invites\/([A-Z0-9]+)$/))) {
    const group = db.groups.find((g) => g.inviteCode === match![1]) ?? fail(404, "This invite link isn't valid");
    const me = token ? db.users.find((u) => TOKEN_PREFIX + u._id === token) : undefined;
    return {
      group: { _id: group._id, name: group.name, currency: group.currency, memberCount: group.members.length },
      alreadyMember: !!me && group.members.includes(me._id),
    };
  }

  const me = userFromToken(db, token);

  if (route("GET", /^\/api\/auth\/me$/)) return { user: publicUser(db, me._id) };

  // Apple requires in-app account deletion. Past expenses stay so the group's maths still adds up,
  // but the account is anonymised and leaves every group.
  if (route("DELETE", /^\/api\/auth\/me$/)) {
    Object.assign(me, { deleted: true, name: "Deleted user", email: "", password: "" });
    for (const g of db.groups) g.members = g.members.filter((m) => m !== me._id);
    const empty = new Set(db.groups.filter((g) => g.members.length === 0).map((g) => g._id));
    db.groups = db.groups.filter((g) => !empty.has(g._id));
    db.expenses = db.expenses.filter((e) => !empty.has(e.groupId));
    db.settlements = db.settlements.filter((s) => !empty.has(s.groupId));
    return { deleted: true };
  }

  if ((match = route("POST", /^\/api\/invites\/([A-Z0-9]+)\/accept$/))) {
    const group = db.groups.find((g) => g.inviteCode === match![1]) ?? fail(404, "This invite link isn't valid");
    if (!group.members.includes(me._id)) {
      group.members.push(me._id);
      touch(group);
    }
    return populateGroup(db, group, me._id);
  }

  if (route("GET", /^\/api\/groups$/)) {
    return db.groups
      .filter((g) => g.members.includes(me._id))
      .sort((a, b) => b.lastActivity.localeCompare(a.lastActivity))
      .map((g) => populateGroup(db, g, me._id));
  }

  if (route("POST", /^\/api\/groups$/)) {
    const name = String(body.name ?? "").trim();
    if (name.length < 2) fail(400, "Group name must be at least 2 characters");
    const group: MockGroup = {
      _id: newId("g"),
      name,
      currency: String(body.currency || DEFAULT_CURRENCY),
      members: [me._id],
      invitedEmails: [],
      inviteCode: newInviteCode(),
      createdBy: me._id,
      lastActivity: now(),
      createdAt: now(),
      updatedAt: now(),
    };
    addMembersByEmail(db, group, (body.members as string[]) ?? []);
    db.groups.push(group);
    return populateGroup(db, group, me._id);
  }

  if ((match = route("GET", /^\/api\/groups\/([^/]+)\/details$/))) {
    const group = findGroup(db, match[1], me._id);
    const l = ledger(db, group._id);
    const net = netBalances(l);
    return {
      group: populateGroup(db, group, me._id),
      expenses: db.expenses
        .filter((e) => e.groupId === group._id)
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((e) => populateExpense(db, e)),
      settlements: db.settlements
        .filter((s) => s.groupId === group._id)
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((s) => ({ ...s, paidBy: publicUser(db, s.paidBy), paidTo: publicUser(db, s.paidTo) })),
      myBalanceCents: net.get(me._id) ?? 0,
      // Who pays whom. This is the only view of debts, so it includes people who have since left.
      suggestedPayments: simplifyDebts(net).map((p) => ({
        from: publicUser(db, p.from),
        to: publicUser(db, p.to),
        cents: p.cents,
      })),
    };
  }

  if ((match = route("PATCH", /^\/api\/groups\/([^/]+)$/))) {
    const group = findGroup(db, match[1], me._id);
    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (name.length < 2) fail(400, "Group name must be at least 2 characters");
      group.name = name;
    }
    if (body.currency !== undefined && body.currency !== group.currency) {
      if (db.expenses.some((e) => e.groupId === group._id)) fail(400, "Currency can't change once there are expenses");
      group.currency = String(body.currency);
    }
    touch(group);
    return populateGroup(db, group, me._id);
  }

  if ((match = route("POST", /^\/api\/groups\/([^/]+)\/members$/))) {
    const group = findGroup(db, match[1], me._id);
    addMembersByEmail(db, group, (body.emails as string[]) ?? []);
    touch(group);
    return populateGroup(db, group, me._id);
  }

  if ((match = route("POST", /^\/api\/groups\/([^/]+)\/leave$/))) {
    const group = findGroup(db, match[1], me._id);
    if (myBalance(db, group._id, me._id) !== 0) fail(400, "Settle up before leaving this group");
    group.members = group.members.filter((m) => m !== me._id);
    return { left: true };
  }

  if ((match = route("DELETE", /^\/api\/groups\/([^/]+)$/))) {
    const group = findGroup(db, match[1], me._id);
    if (group.createdBy !== me._id) fail(403, "Only the person who made this group can delete it");
    db.groups = db.groups.filter((g) => g._id !== group._id);
    db.expenses = db.expenses.filter((e) => e.groupId !== group._id);
    db.settlements = db.settlements.filter((s) => s.groupId !== group._id);
    return { deleted: true };
  }

  if (route("POST", /^\/api\/expenses$/)) {
    const group = findGroup(db, body.groupId, me._id);
    const expense: MockExpense = {
      _id: newId("e"),
      groupId: group._id,
      ...readExpense(group, body, me._id),
      date: body.date ? new Date(body.date).toISOString() : now(),
      createdBy: me._id,
      createdAt: now(),
      updatedAt: now(),
    };
    db.expenses.push(expense);
    touch(group);
    return populateExpense(db, expense);
  }

  if ((match = route("PATCH", /^\/api\/expenses\/([^/]+)$/))) {
    const expense = db.expenses.find((e) => e._id === match![1]) ?? fail(404, "Expense not found");
    const group = findGroup(db, expense.groupId, me._id);
    // Fill in anything the edit leaves out, so changing only the description keeps the split.
    const merged = {
      description: expense.description,
      amountCents: expense.amountCents,
      type: expense.type,
      paidBy: expense.paidBy,
      // Several payers carry over untouched; a single payer follows a new amount.
      payers: expense.payers.length > 1 ? expense.payers : undefined,
      split: expense.split,
      ...body,
    };
    if (body.paidBy !== undefined && body.payers === undefined) merged.payers = undefined;
    Object.assign(expense, readExpense(group, merged, me._id), {
      date: body.date ? new Date(body.date).toISOString() : expense.date,
      updatedAt: now(),
    });
    touch(group);
    return populateExpense(db, expense);
  }

  if ((match = route("DELETE", /^\/api\/expenses\/([^/]+)$/))) {
    const expense = db.expenses.find((e) => e._id === match![1]) ?? fail(404, "Expense not found");
    const group = findGroup(db, expense.groupId, me._id);
    db.expenses = db.expenses.filter((e) => e._id !== expense._id);
    touch(group);
    return { deleted: true };
  }

  if (route("POST", /^\/api\/settlements$/)) {
    const group = findGroup(db, body.groupId, me._id);
    const paidTo = String(body.paidTo);
    if (paidTo === me._id) fail(400, "Cannot settle with yourself");
    if (!group.members.includes(paidTo)) fail(400, "Cannot settle with user not in the group");
    const amountCents = Number(body.amountCents);
    if (!Number.isSafeInteger(amountCents) || amountCents <= 0) fail(400, "Amount must be more than zero");

    // Debts are simplified across the group, so a payment can go to anyone in it,
    // up to what you owe overall.
    const limit = Math.max(0, -myBalance(db, group._id, me._id));
    if (limit === 0) fail(400, "You don't owe anything in this group");
    if (amountCents > limit) fail(400, `Cannot settle more than you owe (${limit} cents)`);

    const settlement = {
      _id: newId("s"),
      groupId: group._id,
      paidBy: me._id,
      paidTo,
      amountCents,
      note: body.note ? String(body.note) : undefined,
      date: now(),
      createdAt: now(),
      updatedAt: now(),
    };
    db.settlements.push(settlement);
    touch(group);
    return { ...settlement, paidBy: publicUser(db, me._id), paidTo: publicUser(db, paidTo) };
  }

  if ((match = route("DELETE", /^\/api\/settlements\/([^/]+)$/))) {
    const settlement = db.settlements.find((s) => s._id === match![1]) ?? fail(404, "Payment not found");
    findGroup(db, settlement.groupId, me._id);
    if (settlement.paidBy !== me._id && settlement.paidTo !== me._id) fail(403, "Only the two people in a payment can undo it");
    db.settlements = db.settlements.filter((s) => s._id !== settlement._id);
    return { deleted: true };
  }

  if (route("GET", /^\/api\/activities$/)) {
    const groups = db.groups.filter((g) => g.members.includes(me._id));
    const groupOf = (id: string) => groups.find((g) => g._id === id);
    const activities = [
      ...db.expenses.filter((e) => groupOf(e.groupId)).map((e) => ({
        id: e._id,
        type: "expense" as const,
        groupId: e.groupId,
        groupName: groupOf(e.groupId)!.name,
        currency: groupOf(e.groupId)!.currency,
        date: e.date,
        description: e.description,
        amountCents: e.amountCents,
        expenseType: e.type,
        paidBy: { id: e.paidBy, name: publicUser(db, e.paidBy).name },
        paidByCurrentUser: e.paidBy === me._id,
      })),
      ...db.settlements.filter((s) => groupOf(s.groupId)).map((s) => ({
        id: s._id,
        type: "settlement" as const,
        groupId: s.groupId,
        groupName: groupOf(s.groupId)!.name,
        currency: groupOf(s.groupId)!.currency,
        date: s.date,
        amountCents: s.amountCents,
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

  return fail(404, `No mock route for ${method} ${path}`);
}

/** Runs one request against a given store. Exported for tests; the app goes through mockRequest. */
export async function handleMock(db: MockDb, method: string, endpoint: string, body: Body = {}, token: string | null = null) {
  // Parsed by hand: React Native's URL lacks pathname and searchParams.
  const [path, search = ""] = endpoint.split("?");
  const query = new Map(
    search
      .split("&")
      .filter(Boolean)
      .map((pair) => pair.split("=").map(decodeURIComponent) as [string, string]),
  );
  const result = await handle(db, method.toUpperCase(), path, query, body, token);
  // Round-trip through JSON like a real response, so callers never share objects with the store.
  return JSON.parse(JSON.stringify(result));
}

export async function mockRequest<T>(endpoint: string, options: RequestInit, token: string | null): Promise<T> {
  await new Promise((r) => setTimeout(r, LATENCY_MS));
  const db = await getDb();
  const body = typeof options.body === "string" ? JSON.parse(options.body) : {};
  const result = await handleMock(db, options.method ?? "GET", endpoint, body, token);
  await saveDb();
  return result as T;
}
