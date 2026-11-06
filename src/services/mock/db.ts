import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Cents } from "@/src/domain/money";
import { computeShares, type Share, type Split } from "@/src/domain/splits";

// The mock backend's data, shaped like the Mongo documents the real API stores.
// It persists to AsyncStorage so groups and expenses survive a reload.

export type ExpenseType = "food" | "transport" | "supplies" | "fuel" | "other";

export type MockUser = { _id: string; name: string; email: string; password: string; deleted?: boolean };
export type MockGroup = {
  _id: string;
  name: string;
  currency: string;
  members: string[];
  invitedEmails: string[];
  inviteCode: string;
  createdBy: string;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
};
export type MockExpense = {
  _id: string;
  groupId: string;
  description: string;
  amountCents: Cents;
  type: ExpenseType;
  /** The biggest payer, kept for one-line summaries; `payers` is what the maths uses. */
  paidBy: string;
  payers: Share[];
  split: Split;
  shares: Share[];
  date: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};
export type MockSettlement = {
  _id: string;
  groupId: string;
  paidBy: string;
  paidTo: string;
  amountCents: Cents;
  note?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
};

export type MockDb = {
  users: MockUser[];
  groups: MockGroup[];
  expenses: MockExpense[];
  settlements: MockSettlement[];
};

// Bumped when the stored shape changes, so old data is replaced by a fresh seed.
const STORAGE_KEY = "mock_db_v3";

/** The account every sign-in falls back to, so any email and password works. */
export const DEMO_USER_ID = "u_you";

let counter = 0;
export const newId = (prefix: string) => `${prefix}_${Date.now().toString(36)}${(counter++).toString(36)}`;

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const newInviteCode = () =>
  Array.from({ length: 8 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join("");

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();

export function seed(): MockDb {
  const users: MockUser[] = [
    { _id: DEMO_USER_ID, name: "Delight Sheriff", email: "you@example.com", password: "password" },
    { _id: "u_tari", name: "Tari Okon", email: "tari@example.com", password: "password" },
    { _id: "u_ada", name: "Ada Nwosu", email: "ada@example.com", password: "password" },
    { _id: "u_kemi", name: "Kemi Bello", email: "kemi@example.com", password: "password" },
    { _id: "u_femi", name: "Femi Ade", email: "femi@example.com", password: "password" },
  ];

  const group = (id: string, name: string, members: string[], days: number, invitedEmails: string[] = []): MockGroup => ({
    _id: id,
    name,
    currency: "USD",
    members,
    invitedEmails,
    inviteCode: id.slice(2).toUpperCase().padEnd(8, "X"),
    createdBy: DEMO_USER_ID,
    lastActivity: daysAgo(days),
    createdAt: daysAgo(days + 10),
    updatedAt: daysAgo(days),
  });

  const groups = [
    group("g_trip", "Obudu Weekend", [DEMO_USER_ID, "u_tari", "u_ada", "u_kemi"], 1),
    group("g_flat", "Flat 4B", [DEMO_USER_ID, "u_femi", "u_ada"], 3, ["zainab@example.com"]),
    group("g_lunch", "Friday Lunch", [DEMO_USER_ID, "u_kemi"], 9),
  ];

  const expense = (
    groupId: string,
    description: string,
    amountCents: Cents,
    type: ExpenseType,
    paidBy: string,
    split: Split,
    days: number,
  ): MockExpense => ({
    _id: newId("e"),
    groupId,
    description,
    amountCents,
    type,
    paidBy,
    payers: [{ userId: paidBy, cents: amountCents }],
    split,
    shares: computeShares(amountCents, split),
    date: daysAgo(days),
    createdBy: paidBy,
    createdAt: daysAgo(days),
    updatedAt: daysAgo(days),
  });

  const trip = groups[0].members;
  const flat = groups[1].members;
  const expenses = [
    expense("g_trip", "Cable car tickets", 12000, "transport", DEMO_USER_ID, { type: "equal", members: trip }, 1),
    expense("g_trip", "Suya by the lodge", 4650, "food", "u_tari", { type: "equal", members: trip }, 2),
    expense("g_trip", "Fuel to Calabar", 9000, "fuel", "u_ada", { type: "equal", members: trip }, 3),
    // The bigger room pays two shares of the electricity.
    expense(
      "g_flat",
      "Electricity token",
      6400,
      "other",
      "u_femi",
      { type: "shares", members: flat, values: { [DEMO_USER_ID]: 2, u_femi: 1, u_ada: 1 } },
      3,
    ),
    expense("g_flat", "Cleaning supplies", 2460, "supplies", DEMO_USER_ID, { type: "equal", members: flat }, 6),
    expense(
      "g_lunch",
      "Amala spot",
      3600,
      "food",
      "u_kemi",
      { type: "exact", members: [DEMO_USER_ID, "u_kemi"], values: { [DEMO_USER_ID]: 2100, u_kemi: 1500 } },
      9,
    ),
  ];

  const settlements: MockSettlement[] = [
    {
      _id: newId("s"),
      groupId: "g_lunch",
      paidBy: DEMO_USER_ID,
      paidTo: "u_kemi",
      amountCents: 1800,
      note: "Lunch is on me next week",
      date: daysAgo(8),
      createdAt: daysAgo(8),
      updatedAt: daysAgo(8),
    },
  ];

  return { users, groups, expenses, settlements };
}

let db: MockDb | null = null;

export async function getDb(): Promise<MockDb> {
  if (db) return db;
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    db = stored ? (JSON.parse(stored) as MockDb) : seed();
  } catch {
    db = seed();
  }
  return db;
}

export async function saveDb() {
  if (db) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

/** Puts the demo data back as it was. */
export async function resetDb() {
  db = seed();
  await saveDb();
}
