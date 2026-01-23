import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Group, GroupDetails } from "../types";
import { apiRequest } from "./client";

export const groupKeys = {
  all: ["groups"] as const,
  lists: () => [...groupKeys.all, "list"] as const,
  details: () => [...groupKeys.all, "detail"] as const,
  detail: (id: string) => [...groupKeys.details(), id] as const,
};

export function useGroups() {
  return useQuery({
    queryKey: groupKeys.lists(),
    queryFn: () => apiRequest<Group[]>("/api/groups"),
    staleTime: 30_000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useGroupDetails(groupId: string) {
  return useQuery({
    queryKey: groupKeys.detail(groupId),
    queryFn: () => apiRequest<GroupDetails>(`/api/groups/${groupId}/details`),
    enabled: !!groupId,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; members: string[] }) =>
      apiRequest<Group>("/api/groups", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
    },
  });
}
