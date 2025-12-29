export interface Group {
  id: string;
  name: string;
  category: string;
  members: Member[];
  balance: number;
  createdBy: string; // Added: Needed to identify who can edit/delete group
  lastActivity: string; // Added: Helpful for sorting the list by recent use
}

export interface Member {
  id: string;
  name: string;
  avatar: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string; // Member ID or "You"
  date: string;
  type: "food" | "transport" | "supplies" | "fuel" | "other";
  splits: {
    memberId: string;
    amount: number;
  }[];
}
