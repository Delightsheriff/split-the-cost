import { OnboardingInterface } from "@/src/types/onboarding";
import { Group } from "../types/groups";

const onboardingData: OnboardingInterface[] = [
  {
    id: 1,
    heading: "Track Expenses",
    sub: "Together",
    description:
      "Keep track of shared bills and IOUs with roommates, trips, and friends effortlessly.",
    image: require("../../assets/bg2.png"),
  },
  {
    id: 2,
    heading: "Create Groups",
    sub: "& Invite Friends",
    description:
      "Start a group and invite your friends to split expenses together for trips, meals, and more.",
    image: require("../../assets/bg3.jpg"),
  },
  {
    id: 3,
    heading: "Add Expenses",
    sub: "Instantly",
    description:
      "Quickly add expenses with details like amount, who paid, and who participated in the cost.",
    image: require("../../assets/bg4.jpg"),
  },
  {
    id: 4,
    heading: "View Split",
    sub: "Breakdown",
    description:
      "See exactly who owes what and settle up with friends with a clear breakdown of all costs.",
    image: require("../../assets/bg5.jpg"),
  },
];

export default onboardingData;

export const DUMMY_GROUPS: Group[] = [
  {
    id: "1",
    name: "Apartment 4B",
    category: "RENT & UTILITIES",
    balance: 45.0,
    createdBy: "usr_2",
    lastActivity: "2024-05-22T14:30:00Z",
    members: [
      {
        id: "1",
        name: "John",
        avatar: "https://i.pravatar.cc/150?img=1",
      },
      {
        id: "2",
        name: "Sarah",
        avatar: "https://i.pravatar.cc/150?img=2",
      },
      {
        id: "3",
        name: "Mike",
        avatar: "https://i.pravatar.cc/150?img=3",
      },
    ],
  },
  {
    id: "2",
    name: "Weekend Trip",
    category: "TRAVEL",
    balance: -120.5,
    createdBy: "usr_1",
    lastActivity: "2024-05-20T10:00:00Z",
    members: [
      {
        id: "4",
        name: "Emma",
        avatar: "https://i.pravatar.cc/150?img=4",
      },
      {
        id: "5",
        name: "David",
        avatar: "https://i.pravatar.cc/150?img=5",
      },
      {
        id: "6",
        name: "Lisa",
        avatar: "https://i.pravatar.cc/150?img=6",
      },
      {
        id: "7",
        name: "Tom",
        avatar: "https://i.pravatar.cc/150?img=7",
      },
    ],
  },
  {
    id: "3",
    name: "Office Lunch",
    category: "FOOD & DINING",
    balance: 23.75,
    createdBy: "usr_3",
    lastActivity: "2024-05-18T12:15:00Z",
    members: [
      {
        id: "8",
        name: "Alex",
        avatar: "https://i.pravatar.cc/150?img=8",
      },
      {
        id: "9",
        name: "Kim",
        avatar: "https://i.pravatar.cc/150?img=9",
      },
    ],
  },
];

export const expenses = [
  {
    id: "1",
    description: "Dinner at Mario's",
    amount: 80.0,
    paidBy: "You",
    date: "Oct 24",
    youOwe: 26.67,
    type: "food",
  },
  {
    id: "2",
    description: "Uber to Hotel",
    amount: 24.5,
    paidBy: "You",
    date: "Oct 23",
    youGet: 12.25,
    type: "transport",
  },
  {
    id: "3",
    description: "Supplies",
    amount: 56.0,
    paidBy: "Bob",
    date: "Oct 22",
    youOwe: 18.67,
    type: "supplies",
  },
  {
    id: "4",
    description: "Fuel Stop",
    amount: 40.0,
    paidBy: "Alice",
    date: "Oct 20",
    youOwe: 13.33,
    type: "fuel",
  },
];
