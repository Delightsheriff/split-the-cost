import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./client";
import { groupKeys } from "./group.service";
import { balanceKeys } from "./settlement.service";

export const expenseKeys = {
  all: ["expenses"] as const,
  byGroup: (groupId: string) => [...expenseKeys.all, "group", groupId] as const,
};

export function useGroupExpenses(groupId: string) {
  return useQuery({
    queryKey: expenseKeys.byGroup(groupId),
    queryFn: () => apiRequest<any[]>(`/api/expenses/group/${groupId}`),
    enabled: !!groupId,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) =>
      apiRequest<any>("/api/expenses", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      // Invalidate everything related to this group
      queryClient.invalidateQueries({
        queryKey: expenseKeys.byGroup(variables.groupId),
      });
      queryClient.invalidateQueries({
        queryKey: balanceKeys.byGroup(variables.groupId),
      });
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
    },
  });
}
