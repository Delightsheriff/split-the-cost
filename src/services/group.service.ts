import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./client";

export type GroupMember = {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
};

export type Group = {
  _id: string;
  name: string;
  members: GroupMember[];
  invitedEmails: string[];
  createdBy: string;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
};

export type GroupDetail = Group & {
  currentUserState: {
    balance: number;
    isOwed: boolean;
    isSettled: boolean;
  };
};

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
  });
}

export function useGroup(groupId: string) {
  return useQuery({
    queryKey: groupKeys.detail(groupId),
    queryFn: () => apiRequest<GroupDetail>(`/api/groups/${groupId}`),
    enabled: !!groupId,
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
