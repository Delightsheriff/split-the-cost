import AsyncStorage from "@react-native-async-storage/async-storage";

// The mock backend's data, shaped like the Mongo documents the real API stores.
// It persists to AsyncStorage so groups and expenses survive a reload.

export type MockUser = { _id: string; name: string; email: string; password: string };
export type MockGroup = {
  _id: string;
  name: string;
  members: string[];
  invitedEmails: string[];
  createdBy: string;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
};
export type MockExpense = {
  _id: string;
  groupId: string;
  description: string;
  amount: number;
  type: "food" | "transport" | "supplies" | "fuel" | "other";
  paidBy: string;
  splitBetween: string[];
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
  amount: number;
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

const STORAGE_KEY = "mock_db_v1";

/** The account every sign-in falls back to, so any email and password works. */
export const DEMO_USER_ID = "u_you";

let counter = 0;
export const newId = (prefix: string) => `${prefix}_${Date.now().toString(36)}${(counter++).toString(36)}`;

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();

function seed(): MockDb {
  const users: MockUser[] = [
    { _id: DEMO_USER_ID, name: "Delight Sheriff", email: "you@example.com", password: "password" },
    { _id: "u_tari", name: "Tari Okon", email: "tari@example.com", password: "password" },
    { _id: "u_ada", name: "Ada Nwosu", email: "ada@example.com", password: "password" },
    { _id: "u_kemi", name: "Kemi Bello", email: "kemi@example.com", password: "password" },
    { _id: "u_femi", name: "Femi Ade", email: "femi@example.com", password: "password" },
  ];

  const group = (id: string, name: string, members: string[], days: number): MockGroup => ({
    _id: id,
    name,
    members,
    invitedEmails: [],
    createdBy: DEMO_USER_ID,
    lastActivity: daysAgo(days),
    createdAt: daysAgo(days + 10),
    updatedAt: daysAgo(days),
  });

  const groups = [
    group("g_trip", "Obudu Weekend", [DEMO_USER_ID, "u_tari", "u_ada", "u_kemi"], 1),
    group("g_flat", "Flat 4B", [DEMO_USER_ID, "u_femi", "u_ada"], 3),
    group("g_lunch", "Friday Lunch", [DEMO_USER_ID, "u_kemi"], 9),
  ];

  const expense = (
    groupId: string,
    description: string,
    amount: number,
    type: MockExpense["type"],
    paidBy: string,
    splitBetween: string[],
    days: number,
  ): MockExpense => ({
    _id: newId("e"),
    groupId,
    description,
    amount,
    type,
    paidBy,
    splitBetween,
    date: daysAgo(days),
    createdBy: paidBy,
    createdAt: daysAgo(days),
    updatedAt: daysAgo(days),
  });

  const trip = groups[0].members;
  const flat = groups[1].members;
  const expenses = [
    expense("g_trip", "Cable car tickets", 120, "transport", DEMO_USER_ID, trip, 1),
    expense("g_trip", "Suya by the lodge", 46.5, "food", "u_tari", trip, 2),
    expense("g_trip", "Fuel to Calabar", 90, "fuel", "u_ada", trip, 3),
    expense("g_flat", "Electricity token", 64, "other", "u_femi", flat, 3),
    expense("g_flat", "Cleaning supplies", 24.6, "supplies", DEMO_USER_ID, flat, 6),
    expense("g_lunch", "Amala spot", 36, "food", "u_kemi", [DEMO_USER_ID, "u_kemi"], 9),
  ];

  const settlements: MockSettlement[] = [
    {
      _id: newId("s"),
      groupId: "g_lunch",
      paidBy: DEMO_USER_ID,
      paidTo: "u_kemi",
      amount: 18,
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
