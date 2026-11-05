import type { Cents } from "./money";

/** What the amount keypad can type. */
export type Key = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "." | "+" | "−" | "×" | "÷" | "back";

export const OPERATORS = ["+", "−", "×", "÷"] as const;
type Operator = (typeof OPERATORS)[number];

const isOperator = (s: string): s is Operator => (OPERATORS as readonly string[]).includes(s);

/** Splits "143×2" into ["143", "×", "2"]. */
function tokens(expression: string) {
  return expression.split(/([+−×÷])/).filter((t) => t !== "");
}

/**
 * Applies one key to the expression, refusing keys that would make it
 * nonsense: two operators in a row, a second decimal point, a third decimal
 * place, or more than 9 digits in a number.
 */
export function press(expression: string, key: Key): string {
  if (key === "back") return expression.slice(0, -1);

  const parts = tokens(expression);
  const last = parts.at(-1) ?? "";

  if (isOperator(key)) {
    if (expression === "") return expression;
    // Typing a new operator swaps the one just typed.
    return isOperator(last) ? expression.slice(0, -1) + key : expression + key;
  }

  const number = isOperator(last) ? "" : last;
  if (key === ".") {
    if (number.includes(".")) return expression;
    return expression + (number === "" ? "0." : ".");
  }
  if (number.includes(".") && number.split(".")[1].length >= 2) return expression;
  if (number.replace(".", "").length >= 9) return expression;
  // No leading zeros: "0" then "5" is "5".
  if (number === "0") return expression.slice(0, -1) + key;
  return expression + key;
}

/** Whole cents for a number typed as "12.5". */
const toCents = (number: string) => {
  const [whole, fraction = ""] = number.split(".");
  return Number(whole || "0") * 100 + Number(fraction.padEnd(2, "0"));
};

/**
 * Works the expression out in cents, × and ÷ before + and −, rounding each
 * product or quotient to the nearest cent. A trailing operator is ignored so
 * the total shows while you type. Returns null for nothing typed or ÷ 0.
 */
export function evaluate(expression: string): Cents | null {
  const parts = tokens(expression);
  if (parts.length > 0 && isOperator(parts.at(-1)!)) parts.pop();
  if (parts.length === 0) return null;

  // First pass: fold × and ÷ into the term on their left. Multipliers and
  // divisors are plain numbers ("× 2"), not money.
  const terms: (number | Operator)[] = [toCents(parts[0])];
  for (let i = 1; i < parts.length; i += 2) {
    const op = parts[i] as Operator;
    const operand = parts[i + 1];
    if (op === "×" || op === "÷") {
      const factor = Number(operand);
      if (op === "÷" && factor === 0) return null;
      const left = terms.pop() as number;
      terms.push(Math.round(op === "×" ? left * factor : left / factor));
    } else {
      terms.push(op, toCents(operand));
    }
  }

  let total = terms[0] as number;
  for (let i = 1; i < terms.length; i += 2) {
    total = terms[i] === "+" ? total + (terms[i + 1] as number) : total - (terms[i + 1] as number);
  }
  return total;
}

/** True once the expression has an operator, so there is a result worth showing apart. */
export const hasOperator = (expression: string) => tokens(expression).some(isOperator);
