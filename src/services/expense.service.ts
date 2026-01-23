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
    onSuccess: async (_, variables) => {
      // First, remove any stale data from cache to prevent showing old data
      queryClient.removeQueries({
        queryKey: groupKeys.detail(variables.groupId),
      });

      // Force immediate refetch with fresh data from server
      await queryClient.refetchQueries({
        queryKey: groupKeys.detail(variables.groupId),
        type: "active", // Only refetch currently active queries
      });

      // Invalidate and refetch group lists immediately for mobile responsiveness
      queryClient.invalidateQueries({
        queryKey: groupKeys.lists(),
        refetchType: "all", // Force refetch of all matching queries
      });

      // Remove and invalidate all group detail queries to ensure fresh data everywhere
      queryClient.removeQueries({
        queryKey: groupKeys.details(),
      });
      queryClient.invalidateQueries({
        queryKey: groupKeys.details(),
        refetchType: "all",
      });
    },
  });
}
