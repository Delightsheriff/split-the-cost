import type { Cents } from "../domain/money";
import type { Split } from "../domain/splits";

// Every amount from the API is integer cents in the group's currency. Format with formatMoney.

export type GroupMember = {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
};

export type ExpenseType = "food" | "transport" | "supplies" | "fuel" | "other";

export type Group = {
  _id: string;
  name: string;
  currency: string;
  members: GroupMember[];
  invitedEmails: string[];
  inviteCode: string;
  createdBy: string;
  myBalanceCents: Cents;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
};

export type Expense = {
  _id: string;
  groupId: string;
  description: string;
  amountCents: Cents;
  type: ExpenseType;
  paidBy: GroupMember;
  split: Split;
  shares: { user: GroupMember; cents: Cents }[];
  date: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

/** Sent when creating an expense; an edit sends any subset of it. */
export type ExpenseInput = {
  groupId: string;
  description: string;
  amountCents: Cents;
  type: ExpenseType;
  paidBy: string;
  split: Split;
  date?: string;
};

export type Payment = { from: GroupMember; to: GroupMember; cents: Cents };

export type Settlement = {
  _id: string;
  groupId: string;
  paidBy: GroupMember;
  paidTo: GroupMember;
  amountCents: Cents;
  note?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
};

export type GroupDetails = {
  group: Group;
  expenses: Expense[];
  settlements: Settlement[];
  myBalanceCents: Cents; // positive = you're owed overall
  /** Who pays whom to settle the whole group. The app's only view of who owes whom. */
  suggestedPayments: Payment[];
};

export type InvitePreview = {
  group: { _id: string; name: string; currency: string; memberCount: number };
  alreadyMember: boolean;
};
