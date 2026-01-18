import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./client";
import { groupKeys } from "./group.service";

export type Expense = {
  _id: string;
  groupId: string;
  description: string;
  amount: number;
  type: "food" | "transport" | "supplies" | "fuel" | "other";
  paidBy: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  splitBetween: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  }[];
  date: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateExpenseRequest = {
  groupId: string;
  description: string;
  amount: number;
  type: "food" | "transport" | "supplies" | "fuel" | "other";
  paidBy: string; // User ID
  splitBetween: string[]; // User IDs
  date?: string;
};

export const expenseKeys = {
  all: ["expenses"] as const,
  byGroup: (groupId: string) => [...expenseKeys.all, "group", groupId] as const,
};

export function useGroupExpenses(groupId: string) {
  return useQuery({
    queryKey: expenseKeys.byGroup(groupId),
    queryFn: () => apiRequest<Expense[]>(`/api/expenses/group/${groupId}`),
    enabled: !!groupId,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseRequest) =>
      apiRequest<Expense>("/api/expenses", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      // Invalidate group expenses list
      queryClient.invalidateQueries({
        queryKey: expenseKeys.byGroup(variables.groupId),
      });
      // Update group's lastActivity
      queryClient.invalidateQueries({
        queryKey: groupKeys.all,
      });
    },
  });
}
