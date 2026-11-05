import type { Cents } from "./money";
import type { Share } from "./splits";

export type LedgerExpense = { paidBy: string; shares: Share[] };
export type LedgerSettlement = { paidBy: string; paidTo: string; cents: Cents };
export type Ledger = { expenses: LedgerExpense[]; settlements: LedgerSettlement[] };

export type Payment = { from: string; to: string; cents: Cents };

const add = (map: Map<string, Cents>, id: string, cents: Cents) => map.set(id, (map.get(id) ?? 0) + cents);

/** Each person's position in the group: positive = they are owed, negative = they owe. Always sums to zero. */
export function netBalances(ledger: Ledger): Map<string, Cents> {
  const net = new Map<string, Cents>();
  for (const e of ledger.expenses) {
    for (const s of e.shares) {
      add(net, e.paidBy, s.cents);
      add(net, s.userId, -s.cents);
    }
  }
  for (const s of ledger.settlements) {
    add(net, s.paidBy, s.cents);
    add(net, s.paidTo, -s.cents);
  }
  return net;
}

/**
 * A short list of payments that settles everyone: repeatedly pay the biggest creditor from the biggest debtor.
 * Needs at most n - 1 payments and never makes anyone pay more than they owe overall.
 */
export function simplifyDebts(net: Map<string, Cents>): Payment[] {
  const byAmount = (a: [string, Cents], b: [string, Cents]) => b[1] - a[1] || a[0].localeCompare(b[0]);
  const creditors = [...net].filter(([, c]) => c > 0).sort(byAmount);
  const debtors = [...net].filter(([, c]) => c < 0).map(([id, c]): [string, Cents] => [id, -c]).sort(byAmount);

  const payments: Payment[] = [];
  while (creditors.length && debtors.length) {
    const [to, owed] = creditors[0];
    const [from, owes] = debtors[0];
    const cents = Math.min(owed, owes);
    payments.push({ from, to, cents });
    creditors[0] = [to, owed - cents];
    debtors[0] = [from, owes - cents];
    if (creditors[0][1] === 0) creditors.shift();
    if (debtors[0][1] === 0) debtors.shift();
    creditors.sort(byAmount);
    debtors.sort(byAmount);
  }
  return payments;
}
