import { useMutation } from "@tanstack/react-query";
import { Cents } from "../domain/money";
import { Settlement } from "../types";
import { apiRequest } from "./client";
import { useRefreshGroup } from "./group.service";

export function useCreateSettlement() {
  const refresh = useRefreshGroup();
  return useMutation({
    mutationFn: (data: { groupId: string; paidTo: string; amountCents: Cents; note?: string }) =>
      apiRequest<Settlement>("/api/settlements", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: (_, variables) => refresh(variables.groupId),
  });
}

export function useDeleteSettlement() {
  const refresh = useRefreshGroup();
  return useMutation({
    mutationFn: ({ id }: { id: string; groupId: string }) =>
      apiRequest<{ deleted: true }>(`/api/settlements/${id}`, { method: "DELETE" }),
    onSuccess: (_, variables) => refresh(variables.groupId),
  });
}
