// Dummy data for the MVP

export interface Profile {
  id: string;
  name: string;
  department: string;
  batch: string;
  campus: string;
  skills: string[];
  interests: string[];
  domain: string;
  lookingFor: string; // e.g., "Research", "Product", "Startup", "Easy FYP"
  availability: string; // e.g., "Looking actively", "Just exploring"
  bio: string;
}

export const dummyProfiles: Profile[] = [
  {
    id: "1",
    name: "Ahmed Khan",
    department: "CS",
    batch: "2021",
    campus: "Islamabad",
    skills: ["React", "Node.js", "UI/UX"],
    interests: ["Web Dev", "Design"],
    domain: "Full Stack Development",
    lookingFor: "Product",
    availability: "Looking actively",
    bio: "Will carry the team if you make memes"
  },
  {
    id: "2",
    name: "Sara Malik",
    department: "AI",
    batch: "2022",
    campus: "Lahore",
    skills: ["Python", "ML", "Data Analysis"],
    interests: ["AI", "NLP"],
    domain: "Machine Learning",
    lookingFor: "Research",
    availability: "Looking actively",
    bio: "I promise I won't make it too complicated"
  },
  {
    id: "3",
    name: "Hassan Ali",
    department: "SE",
    batch: "2021",
    campus: "Karachi",
    skills: ["Flutter", "Firebase", "Dart"],
    interests: ["Mobile Dev", "Startups"],
    domain: "Mobile Development",
    lookingFor: "Startup",
    availability: "Just exploring",
    bio: "Building the next Uber but for [insert idea]"
  },
  {
    id: "4",
    name: "Fatima Zahra",
    department: "CS",
    batch: "2022",
    campus: "Islamabad",
    skills: ["UI/UX", "Figma", "React"],
    interests: ["Design", "Creative Tech"],
    domain: "Product Design",
    lookingFor: "Product",
    availability: "Looking actively",
    bio: "Designer who codes > designer who doesn't"
  },
  {
    id: "5",
    name: "Bilal Ahmed",
    department: "CS",
    batch: "2021",
    campus: "Peshawar",
    skills: ["Blockchain", "Solidity", "Web3"],
    interests: ["Blockchain", "Crypto"],
    domain: "Blockchain",
    lookingFor: "Research",
    availability: "Just exploring",
    bio: "Not a crypto bro, just here for the tech"
  },
  {
    id: "6",
    name: "Ayesha Siddiqui",
    department: "SE",
    batch: "2022",
    campus: "Lahore",
    skills: ["Java", "Spring Boot", "SQL"],
    interests: ["Backend", "Cloud"],
    domain: "Backend Development",
    lookingFor: "Easy FYP",
    availability: "Looking actively",
    bio: "Just wanna pass and go home tbh"
  },
  {
    id: "7",
    name: "Usman Tariq",
    department: "CY",
    batch: "2021",
    campus: "Islamabad",
    skills: ["Cybersecurity", "Pentesting", "Python"],
    interests: ["Security", "Hacking"],
    domain: "Cybersecurity",
    lookingFor: "Research",
    availability: "Looking actively",
    bio: "Ethical hacker. Emphasis on ethical."
  },
  {
    id: "8",
    name: "Zainab Hassan",
    department: "CS",
    batch: "2022",
    campus: "Karachi",
    skills: ["iOS", "Swift", "SwiftUI"],
    interests: ["iOS", "Design"],
    domain: "iOS Development",
    lookingFor: "Product",
    availability: "Just exploring",
    bio: "Making apps that don't crash (hopefully)"
  }
];

export const departments = [
  "CS", "SE", "AI", "DS", "CY"
];

export const domains = [
  "Full Stack Development",
  "Mobile Development",
  "Machine Learning",
  "Data Science",
  "Blockchain",
  "Cybersecurity",
  "Product Design",
  "Backend Development",
  "Frontend Development",
  "iOS Development",
  "Android Development"
];

export const lookingForOptions = [
  "Research",
  "Product",
  "Startup",
  "Easy FYP",
  "Something Cool"
];

export const availabilityOptions = [
  "Looking actively",
  "Just exploring",
  "Open to offers"
];

export const campuses = [
  "Islamabad",
  "Lahore",
  "Karachi",
  "Peshawar",
  "Faisalabad"
];

export const skillsList = [
  "C / C++",
  "Java",
  "Python",
  "JavaScript",
  "TypeScript",
  "HTML & CSS",
  "React",
  "Next.js",
  "Tailwind CSS",
  "UI/UX Design",
  "Figma",
  "Node.js",
  "Express.js",
  "REST APIs",
  "Authentication",
  "Databases (General)",
  "Flutter",
  "React Native",
  "Android (Native)",
  "iOS (Native)",
  "SQL (PostgreSQL / MySQL)",
  "MongoDB",
  "Firebase",
  "Supabase",
  "Machine Learning",
  "Deep Learning",
  "Artificial Intelligence",
  "Data Science",
  "Computer Vision",
  "NLP",
  "DevOps",
  "Cloud (AWS / GCP)",
  "Docker",
  "Cybersecurity",
  "Operating Systems",
  "Blockchain",
  "Solidity",
  "Web3 Development",
  "Smart Contracts"
];

export const interestsList = [
  "Web Development",
  "Mobile App Development",
  "Artificial Intelligence",
  "Machine Learning",
  "Data Science",
  "UI/UX & Product Design",
  "Backend & Systems",
  "Cloud & DevOps",
  "Cybersecurity",
  "Blockchain & Web3",
  "Startups & Entrepreneurship",
  "Research & Academia",
  "Open Source",
  "Creative Tech",
  "IoT & Embedded Systems"
];
