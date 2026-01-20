export type GroupMember = {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
};

export type Group = {
  _id: string;
  name: string;
  members: GroupMember[];
  invitedEmails: string[];
  createdBy: string;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
};

export type Expense = {
  _id: string;
  groupId: string;
  description: string;
  amount: number;
  type: "food" | "transport" | "supplies" | "fuel" | "other";
  paidBy: GroupMember;
  splitBetween: GroupMember[];
  date: string;
  createdAt: string;
  updatedAt: string;
};

export type PairBalance = {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  balance: number; // positive = they owe you, negative = you owe them
};

export type GroupDetails = {
  group: Group;
  expenses: Expense[];
  currentUserBalance: {
    balance: number;
    isSettled: boolean;
    isOwed: boolean;
  };
  pairBalances: PairBalance[];
};

export type Settlement = {
  _id: string;
  groupId: string;
  paidBy: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  paidTo: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  amount: number;
  note?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
};
