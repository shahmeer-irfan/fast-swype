// Proposals data structure and dummy data

export interface Proposal {
  id: string;
  fromUser: {
    id: string;
    name: string;
    department: string;
    batch: string;
  };
  toUser: {
    id: string;
    name: string;
  };
  message: string;
  timestamp: Date;
  status: "pending" | "accepted" | "rejected";
  direction: "sent" | "received"; // Whether current user sent or received this
}

export const dummyProposals: Proposal[] = [
  // Received proposals
  {
    id: "p1",
    fromUser: {
      id: "u2",
      name: "Sara Malik",
      department: "AI",
      batch: "2022",
    },
    toUser: {
      id: "u1",
      name: "You",
    },
    message: "Your React skills + my ML model = unstoppable combo! Let's build something that actually works 🚀",
    timestamp: new Date("2026-01-24T10:30:00"),
    status: "pending",
    direction: "received",
  },
  {
    id: "p2",
    fromUser: {
      id: "u3",
      name: "Hassan Ali",
      department: "SE",
      batch: "2021",
    },
    toUser: {
      id: "u1",
      name: "You",
    },
    message: "Need someone who knows backend. I do Flutter, you do magic? 🪄",
    timestamp: new Date("2026-01-23T15:45:00"),
    status: "pending",
    direction: "received",
  },
  {
    id: "p3",
    fromUser: {
      id: "u4",
      name: "Fatima Noor",
      department: "CS",
      batch: "2021",
    },
    toUser: {
      id: "u1",
      name: "You",
    },
    message: "Blockchain + your skills = A+ guaranteed. Also I make good chai ☕",
    timestamp: new Date("2026-01-22T09:20:00"),
    status: "accepted",
    direction: "received",
  },
  // Sent proposals
  {
    id: "p4",
    fromUser: {
      id: "u1",
      name: "You",
      department: "CS",
      batch: "2021",
    },
    toUser: {
      id: "u5",
      name: "Ali Raza",
    },
    message: "Your IoT skills are 🔥! I can help with the backend. Let's make something cool?",
    timestamp: new Date("2026-01-21T14:10:00"),
    status: "pending",
    direction: "sent",
  },
  {
    id: "p5",
    fromUser: {
      id: "u1",
      name: "You",
      department: "CS",
      batch: "2021",
    },
    toUser: {
      id: "u6",
      name: "Zainab Khan",
    },
    message: "Computer vision + web = something cool? I'm in! When can we discuss?",
    timestamp: new Date("2026-01-20T11:00:00"),
    status: "accepted",
    direction: "sent",
  },
  {
    id: "p6",
    fromUser: {
      id: "u1",
      name: "You",
      department: "CS",
      batch: "2021",
    },
    toUser: {
      id: "u7",
      name: "Omar Sheikh",
    },
    message: "Saw your design portfolio. Need a dev for your next project? 👨‍💻",
    timestamp: new Date("2026-01-19T16:30:00"),
    status: "rejected",
    direction: "sent",
  },
];
