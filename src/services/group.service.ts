import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./client";

export type Group = {
  _id: string;
  name: string;
  members: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  }[];
  invitedEmails: string[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  balance: number;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateGroupRequest = {
  name: string;
  members: string[];
};

export type CreateGroupResponse = {
  group: Group;
  meta: {
    existingMemberCount: number;
    invitedCount: number;
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
    queryFn: () => apiRequest<Group>(`/api/groups/${groupId}`),
    enabled: !!groupId,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGroupRequest) =>
      apiRequest<CreateGroupResponse>("/api/groups", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
    },
  });
}
