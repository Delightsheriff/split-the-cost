import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Expense } from "../types";
import { apiRequest } from "./client";
import { groupKeys } from "./group.service";

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      groupId: string;
      description: string;
      amount: number;
      type: "food" | "transport" | "supplies" | "fuel" | "other";
      paidBy: string;
      splitBetween: string[];
    }) =>
      apiRequest<Expense>("/api/expenses", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      // Invalidate group details to refresh balances and expenses
      queryClient.invalidateQueries({
        queryKey: groupKeys.detail(variables.groupId),
      });
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
    },
  });
}
