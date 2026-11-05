import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Group, GroupDetails, InvitePreview } from "../types";
import { activityKeys } from "./activity.service";
import { apiRequest } from "./client";

export const groupKeys = {
  all: ["groups"] as const,
  lists: () => [...groupKeys.all, "list"] as const,
  details: () => [...groupKeys.all, "detail"] as const,
  detail: (id: string) => [...groupKeys.details(), id] as const,
  invite: (code: string) => [...groupKeys.all, "invite", code] as const,
};

/** Refetches everything a change inside a group can affect: its details, the group list and activity. */
export function useRefreshGroup() {
  const queryClient = useQueryClient();
  return (groupId: string) =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) }),
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() }),
      queryClient.invalidateQueries({ queryKey: activityKeys.all }),
    ]);
}

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
    mutationFn: (data: { name: string; members: string[]; currency?: string }) =>
      apiRequest<Group>("/api/groups", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: groupKeys.lists() }),
  });
}

export function useUpdateGroup() {
  const refresh = useRefreshGroup();
  return useMutation({
    mutationFn: ({ id, ...changes }: { id: string; name?: string; currency?: string }) =>
      apiRequest<Group>(`/api/groups/${id}`, { method: "PATCH", body: JSON.stringify(changes) }),
    onSuccess: (group) => refresh(group._id),
  });
}

export function useAddMembers() {
  const refresh = useRefreshGroup();
  return useMutation({
    mutationFn: ({ id, emails }: { id: string; emails: string[] }) =>
      apiRequest<Group>(`/api/groups/${id}/members`, { method: "POST", body: JSON.stringify({ emails }) }),
    onSuccess: (group) => refresh(group._id),
  });
}

export function useLeaveGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiRequest<{ left: true }>(`/api/groups/${id}/leave`, { method: "POST" }),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: groupKeys.detail(id) });
      return queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
    },
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiRequest<{ deleted: true }>(`/api/groups/${id}`, { method: "DELETE" }),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: groupKeys.detail(id) });
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: groupKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: activityKeys.all }),
      ]);
    },
  });
}

export function useInvite(code: string) {
  return useQuery({
    queryKey: groupKeys.invite(code),
    queryFn: () => apiRequest<InvitePreview>(`/api/invites/${code}`),
    enabled: !!code,
  });
}

export function useAcceptInvite() {
  const refresh = useRefreshGroup();
  return useMutation({
    mutationFn: (code: string) => apiRequest<Group>(`/api/invites/${code}/accept`, { method: "POST" }),
    onSuccess: (group) => refresh(group._id),
  });
}
