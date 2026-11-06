// Copy for the help and privacy pages. Plain text, one paragraph per string.

export type Section = { title: string; body: string[] };

export const PRIVACY_UPDATED = "6 November 2026";

export const PRIVACY: Section[] = [
  {
    title: "The short version",
    body: [
      "Split the Cost keeps what it needs to work out who owes whom, and nothing else. No ads, no tracking, no analytics, and nothing is sold or shared for marketing.",
    ],
  },
  {
    title: "What we keep",
    body: [
      "Your account: your name, your email address and your password. The password is stored only as a salted hash, so nobody can read it back.",
      "Your groups: their names, currencies and members, the expenses and payments you or your group add, and how each expense was split.",
      "Pending invites: when you invite someone by email who isn't on Split the Cost yet, we keep that address so they join the group when they sign up.",
    ],
  },
  {
    title: "Who sees it",
    body: [
      "People in a group see that group's members, expenses and payments, including your name and email. People outside your groups see nothing.",
      "Your data is stored with the hosting provider that runs our server, only to run the app. We don't send it anywhere else.",
    ],
  },
  {
    title: "On your phone",
    body: [
      "The app keeps your sign-in token in the phone's secure storage so you stay signed in. Signing out removes it.",
    ],
  },
  {
    title: "Deleting your account",
    body: [
      "Profile › Delete account removes your account and takes you out of every group straight away. Expenses you were part of stay in their groups, so everyone else's balances still add up.",
    ],
  },
  {
    title: "Children",
    body: ["Split the Cost isn't meant for children under 13, and we don't knowingly keep their data."],
  },
  {
    title: "Changes",
    body: ["If this policy changes, the date at the top changes with it, and anything significant is announced in the app."],
  },
];

export const HELP: Section[] = [
  {
    title: "How are balances worked out?",
    body: [
      "Every expense records who paid and each person's share. Your balance in a group is what you paid for others minus what others paid for you. Green means you're owed, orange means you owe.",
    ],
  },
  {
    title: "Why do I pay someone I didn't borrow from?",
    body: [
      "Debts are simplified across the group, so everyone settles in as few payments as possible. You might pay Ada for something Tari covered, but everyone still ends up even.",
    ],
  },
  {
    title: "Can I split unevenly?",
    body: ["Yes. When adding an expense, split it equally, by exact amounts, by percentage or by shares, and leave anyone out who wasn't part of it."],
  },
  {
    title: "How do I add people?",
    body: [
      "Add them by email when you create a group, or open a group, tap ••• and share the invite link. Anyone with the link can join after signing in.",
    ],
  },
  {
    title: "I made a mistake",
    body: [
      "Open an expense to edit or delete it. Recorded a payment by mistake? Press and hold it in the group's timeline to undo it, and the balances go back to how they were.",
    ],
  },
  {
    title: "Does the app move money?",
    body: [
      "No. Split the Cost keeps track of who owes whom. Pay each other however you normally do, then record the payment with Settle up.",
    ],
  },
];
