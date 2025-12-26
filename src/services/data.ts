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
  {
    id: "4",
    name: "Office Lunch",
    category: "FOOD & DINING",
    balance: 23.75,
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
  {
    id: "5",
    name: "Office Lunch",
    category: "FOOD & DINING",
    balance: 23.75,
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
  {
    id: "6",
    name: "Office Lunch",
    category: "FOOD & DINING",
    balance: 23.75,
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
  {
    id: "7",
    name: "Office Lunch",
    category: "FOOD & DINING",
    balance: 23.75,
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
  {
    id: "8",
    name: "Office Lunch",
    category: "FOOD & DINING",
    balance: 23.75,
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
  {
    id: "9",
    name: "Office Lunch",
    category: "FOOD & DINING",
    balance: 23.75,
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
  {
    id: "10",
    name: "Office Lunch",
    category: "FOOD & DINING",
    balance: 23.75,
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
  {
    id: "11",
    name: "Office Lunch",
    category: "FOOD & DINING",
    balance: 23.75,
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
  {
    id: "12",
    name: "Office Lunch",
    category: "FOOD & DINING",
    balance: 23.75,
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
  {
    id: "13",
    name: "Office Lunch",
    category: "FOOD & DINING",
    balance: 23.75,
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
