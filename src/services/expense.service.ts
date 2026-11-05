import { useMutation } from "@tanstack/react-query";
import { Expense, ExpenseInput } from "../types";
import { apiRequest } from "./client";
import { useRefreshGroup } from "./group.service";

export function useCreateExpense() {
  const refresh = useRefreshGroup();
  return useMutation({
    mutationFn: (data: ExpenseInput) =>
      apiRequest<Expense>("/api/expenses", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: (_, variables) => refresh(variables.groupId),
  });
}

export function useUpdateExpense() {
  const refresh = useRefreshGroup();
  return useMutation({
    mutationFn: ({ id, ...changes }: Partial<ExpenseInput> & { id: string }) =>
      apiRequest<Expense>(`/api/expenses/${id}`, { method: "PATCH", body: JSON.stringify(changes) }),
    onSuccess: (expense) => refresh(expense.groupId),
  });
}

export function useDeleteExpense() {
  const refresh = useRefreshGroup();
  return useMutation({
    mutationFn: ({ id }: { id: string; groupId: string }) =>
      apiRequest<{ deleted: true }>(`/api/expenses/${id}`, { method: "DELETE" }),
    onSuccess: (_, variables) => refresh(variables.groupId),
  });
}
