// // src/services/settlements.ts

// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { apiRequest } from "./client";
// import { expenseKeys } from "./expense.service";
// import { groupKeys } from "./group.service";

// export type Settlement = {
//   _id: string;
//   groupId: string;
//   paidBy: {
//     _id: string;
//     name: string;
//     email: string;
//     avatar?: string;
//   };
//   paidTo: {
//     _id: string;
//     name: string;
//     email: string;
//     avatar?: string;
//   };
//   amount: number;
//   note?: string;
//   date: string;
//   createdBy: string;
//   createdAt: string;
//   updatedAt: string;
// };

// export type MemberBalance = {
//   userId: string;
//   name: string;
//   email: string;
//   avatar?: string;
//   balance: number;
// };

// export type CreateSettlementRequest = {
//   groupId: string;
//   paidTo: string; // User ID
//   amount: number;
//   note?: string;
//   date?: string;
// };

// export const settlementKeys = {
//   all: ["settlements"] as const,
//   byGroup: (groupId: string) =>
//     [...settlementKeys.all, "group", groupId] as const,
// };

// export const balanceKeys = {
//   all: ["balances"] as const,
//   byGroup: (groupId: string) => [...balanceKeys.all, "group", groupId] as const,
// };

// export function useGroupBalances(groupId: string) {
//   return useQuery({
//     queryKey: balanceKeys.byGroup(groupId),
//     queryFn: () =>
//       apiRequest<MemberBalance[]>(`/api/groups/${groupId}/balances`),
//     enabled: !!groupId,
//   });
// }

// export function usePairBalances(groupId: string, userId: string) {
//   return useQuery({
//     queryKey: [...balanceKeys.byGroup(groupId), "pair", userId],
//     queryFn: () =>
//       apiRequest<MemberBalance[]>(
//         `/api/groups/${groupId}/pair-balances/${userId}`,
//       ),
//     enabled: !!groupId && !!userId,
//   });
// }

// export function useCreateSettlement() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (data: CreateSettlementRequest) =>
//       apiRequest<Settlement>("/api/settlements", {
//         method: "POST",
//         body: JSON.stringify(data),
//       }),
//     onSuccess: (_, variables) => {
//       // Invalidate all related queries to refresh the UI
//       queryClient.invalidateQueries({
//         queryKey: balanceKeys.byGroup(variables.groupId),
//       });
//       queryClient.invalidateQueries({
//         queryKey: [...balanceKeys.byGroup(variables.groupId), "pair"],
//       });
//       queryClient.invalidateQueries({
//         queryKey: expenseKeys.byGroup(variables.groupId),
//       });
//       queryClient.invalidateQueries({
//         queryKey: groupKeys.detail(variables.groupId),
//       });
//       queryClient.invalidateQueries({
//         queryKey: groupKeys.all,
//       });
//       queryClient.invalidateQueries({
//         queryKey: settlementKeys.byGroup(variables.groupId),
//       });
//     },
//   });
// }

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
    mutationFn: (data: any) =>
      apiRequest<any>("/api/settlements", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      // CRITICAL: Invalidate Group, Expenses, and Balances
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
      queryClient.invalidateQueries({
        queryKey: expenseKeys.byGroup(variables.groupId),
      });
      queryClient.invalidateQueries({
        queryKey: balanceKeys.byGroup(variables.groupId),
      });
    },
  });
}
