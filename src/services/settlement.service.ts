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
    onSuccess: async (_, variables) => {
      // Remove stale cache data for immediate UI updates in mobile
      queryClient.removeQueries({
        queryKey: groupKeys.detail(variables.groupId),
      });

      // Force immediate refetch of group details
      await queryClient.refetchQueries({
        queryKey: groupKeys.detail(variables.groupId),
        type: "active",
      });

      // Aggressively invalidate group lists for mobile responsiveness
      queryClient.invalidateQueries({
        queryKey: groupKeys.lists(),
        refetchType: "all",
      });
    },
  });
}
