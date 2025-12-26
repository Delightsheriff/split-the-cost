export interface Group {
  id: string;
  name: string;
  category: string;
  members: Member[];
  balance: number; // positive = you owe, negative = you're owed
}

export interface Member {
  id: string;
  name: string;
  avatar: string; // URL or local require()
}
