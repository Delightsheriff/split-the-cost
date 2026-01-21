import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "./client";

interface BaseActivity {
  id: string;
  groupId: string;
  groupName: string;
  date: string;
}

export interface ExpenseActivity extends BaseActivity {
  type: "expense";
  description: string;
  amount: number;
  expenseType: string;
  paidBy: {
    id: string;
    name: string;
  };
  paidByCurrentUser: boolean;
}

export interface SettlementActivity extends BaseActivity {
  type: "settlement";
  amount: number;
  note?: string;
  paidBy: {
    id: string;
    name: string;
  };
  paidTo: {
    id: string;
    name: string;
  };
  paidByCurrentUser: boolean;
  paidToCurrentUser: boolean;
}

export type Activity = ExpenseActivity | SettlementActivity;

export const activityKeys = {
  all: ["activities"] as const,
  lists: () => [...activityKeys.all, "list"] as const,
  list: (filter: string) => [...activityKeys.lists(), filter] as const,
};

export function useActivities(filter: string = "All") {
  return useQuery({
    queryKey: activityKeys.list(filter),
    queryFn: () => apiRequest<Activity[]>(`/api/activities?filter=${filter}`),
    staleTime: 0,
  });
}
