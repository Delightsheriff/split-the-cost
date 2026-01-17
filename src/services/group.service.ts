import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./client";

export type CreateGroupRequest = {
  name: string;
  members: string[]; // emails
};

export type CreateGroupResponse = {
  group: {
    _id: string;
    name: string;
    members: string[];
    invitedEmails: string[];
    createdBy: string;
    balance: number;
    lastActivity: string;
    createdAt: string;
    updatedAt: string;
  };
  meta: {
    existingMemberCount: number;
    invitedCount: number;
  };
};

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGroupRequest) =>
      apiRequest<CreateGroupResponse>("/api/groups", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

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

export const groupKeys = {
  all: ["groups"] as const,
  lists: () => [...groupKeys.all, "list"] as const,
};

export function useGroups() {
  return useQuery({
    queryKey: groupKeys.lists(),
    queryFn: () => apiRequest<Group[]>("/api/groups"),
  });
}
