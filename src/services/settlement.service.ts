import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./client";
import { expenseKeys } from "./expense.service";
import { groupKeys } from "./group.service";

export const balanceKeys = {
  all: ["balances"] as const,
  byGroup: (groupId: string) => [...balanceKeys.all, "group", groupId] as const,
};

export function useGroupBalances(groupId: string) {
  return useQuery({
    queryKey: balanceKeys.byGroup(groupId),
    queryFn: () => apiRequest<any[]>(`/api/groups/${groupId}/balances`),
    enabled: !!groupId,
  });
}

export function usePairBalances(groupId: string, userId: string) {
  return useQuery({
    queryKey: [...balanceKeys.byGroup(groupId), "pair", userId],
    queryFn: () =>
      apiRequest<any[]>(`/api/groups/${groupId}/pair-balances/${userId}`),
    enabled: !!groupId && !!userId,
  });
}

export function useCreateSettlement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      groupId: string;
      paidTo: string;
      amount: number;
      note?: string;
    }) => {
      return apiRequest<any>("/api/settlements", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: async (_, variables) => {
      // Invalidate all related queries to force refetch
      // This ensures the UI shows updated balances immediately
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: groupKeys.all }),
        queryClient.invalidateQueries({
          queryKey: expenseKeys.byGroup(variables.groupId),
        }),
        queryClient.invalidateQueries({
          queryKey: balanceKeys.byGroup(variables.groupId),
        }),
      ]);
    },
  });
}
