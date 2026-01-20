import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Settlement } from "../types";
import { apiRequest } from "./client";
import { groupKeys } from "./group.service";

export function useCreateSettlement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      groupId: string;
      paidTo: string;
      amount: number;
      note?: string;
    }) => {
      return apiRequest<Settlement>("/api/settlements", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate group details to refresh balances
      queryClient.invalidateQueries({
        queryKey: groupKeys.detail(variables.groupId),
      });
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
    },
  });
}
