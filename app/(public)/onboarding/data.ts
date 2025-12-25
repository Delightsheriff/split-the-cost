import { OnboardingInterface } from "@/src/types/onboarding";

const onboardingData: OnboardingInterface[] = [
  {
    id: 1,
    heading: "Track Expenses",
    sub: "Together",
    description:
      "Keep track of shared bills and IOUs with roommates, trips, and friends effortlessly.",
    image: require("../../../assets/bg2.png"),
  },
  {
    id: 2,
    heading: "Create Groups",
    sub: "& Invite Friends",
    description:
      "Start a group and invite your friends to split expenses together for trips, meals, and more.",
    image: require("../../../assets/bg3.jpg"),
  },
  {
    id: 3,
    heading: "Add Expenses",
    sub: "Instantly",
    description:
      "Quickly add expenses with details like amount, who paid, and who participated in the cost.",
    image: require("../../../assets/bg4.jpg"),
  },
  {
    id: 4,
    heading: "View Split",
    sub: "Breakdown",
    description:
      "See exactly who owes what and settle up with friends with a clear breakdown of all costs.",
    image: require("../../../assets/bg5.jpg"),
  },
];

export default onboardingData;
