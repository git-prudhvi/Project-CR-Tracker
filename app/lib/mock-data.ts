export interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

export interface Task {
  id: string;
  description: string;
  status: "not-started" | "in-progress" | "completed";
  assignedTo: User;
}

export interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "blocked";
  owner: User;
  assignedDevelopers: User[];
  dueDate: string;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export const mockUsers: User[] = [
  {
    id: "user-1",
    name: "Subhadeep Basu",
    avatar: "/placeholder.svg?height=32&width=32",
    email: "alice@company.com",
  },
  {
    id: "user-2",
    name: "Nikith B",
    avatar: "/placeholder.svg?height=32&width=32",
    email: "bob@company.com",
  },
  {
    id: "user-3",
    name: "Prudhvi Raj",
    avatar: "/placeholder.svg?height=32&width=32",
    email: "carol@company.com",
  },
  {
    id: "user-4",
    name: "Sushanth Kumar",
    avatar: "/placeholder.svg?height=32&width=32",
    email: "david@company.com",
  },
  {
    id: "user-5",
    name: "Shubojit Halder",
    avatar: "/placeholder.svg?height=32&width=32",
    email: "eva@company.com",
  },
  {
    id: "user-5",
    name: "Prinan Sil",
    avatar: "/placeholder.svg?height=32&width=32",
    email: "eva@company.com",
  },
  {
    id: "user-5",
    name: "Shreya Singh",
    avatar: "/placeholder.svg?height=32&width=32",
    email: "eva@company.com",
  },
];

export const mockCRs: ChangeRequest[] = [
  {
    id: "cr-1",
    title: "Implement User Authentication System",
    description:
      "Add comprehensive user authentication with login, registration, password reset, and session management.",
    status: "in-progress",
    owner: mockUsers[0],
    assignedDevelopers: [mockUsers[0], mockUsers[1]],
    dueDate: "2024-02-15",
    tasks: [
      {
        id: "task-1",
        description: "Design authentication database schema",
        status: "completed",
        assignedTo: mockUsers[0],
      },
      {
        id: "task-2",
        description: "Implement login API endpoint",
        status: "in-progress",
        assignedTo: mockUsers[1],
      },
      {
        id: "task-3",
        description: "Create registration form UI",
        status: "not-started",
        assignedTo: mockUsers[0],
      },
      {
        id: "task-4",
        description: "Add password reset functionality",
        status: "not-started",
        assignedTo: mockUsers[1],
      },
    ],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
  },
  {
    id: "cr-2",
    title: "Dashboard Performance Optimization",
    description:
      "Optimize dashboard loading times and implement caching strategies for better user experience.",
    status: "pending",
    owner: mockUsers[2],
    assignedDevelopers: [mockUsers[2], mockUsers[3]],
    dueDate: "2024-02-10",
    tasks: [
      {
        id: "task-5",
        description: "Analyze current performance bottlenecks",
        status: "completed",
        assignedTo: mockUsers[2],
      },
      {
        id: "task-6",
        description: "Implement Redis caching layer",
        status: "not-started",
        assignedTo: mockUsers[3],
      },
      {
        id: "task-7",
        description: "Optimize database queries",
        status: "not-started",
        assignedTo: mockUsers[2],
      },
    ],
    createdAt: "2024-01-18T09:15:00Z",
    updatedAt: "2024-01-19T16:45:00Z",
  },
  {
    id: "cr-3",
    title: "Mobile App API Integration",
    description:
      "Create REST API endpoints for mobile application integration with proper documentation.",
    status: "completed",
    owner: mockUsers[4],
    assignedDevelopers: [mockUsers[4]],
    dueDate: "2024-01-30",
    tasks: [
      {
        id: "task-8",
        description: "Design API specification",
        status: "completed",
        assignedTo: mockUsers[4],
      },
      {
        id: "task-9",
        description: "Implement user endpoints",
        status: "completed",
        assignedTo: mockUsers[4],
      },
      {
        id: "task-10",
        description: "Add API documentation",
        status: "completed",
        assignedTo: mockUsers[4],
      },
      {
        id: "task-11",
        description: "Write integration tests",
        status: "completed",
        assignedTo: mockUsers[4],
      },
    ],
    createdAt: "2024-01-10T11:30:00Z",
    updatedAt: "2024-01-28T17:20:00Z",
  },
  {
    id: "cr-4",
    title: "Security Audit Implementation",
    description:
      "Conduct comprehensive security audit and implement recommended security measures.",
    status: "blocked",
    owner: mockUsers[1],
    assignedDevelopers: [mockUsers[1], mockUsers[3]],
    dueDate: "2024-02-05",
    tasks: [
      {
        id: "task-12",
        description: "Run automated security scan",
        status: "completed",
        assignedTo: mockUsers[1],
      },
      {
        id: "task-13",
        description: "Review third-party dependencies",
        status: "in-progress",
        assignedTo: mockUsers[3],
      },
      {
        id: "task-14",
        description: "Implement HTTPS enforcement",
        status: "not-started",
        assignedTo: mockUsers[1],
      },
    ],
    createdAt: "2024-01-12T14:00:00Z",
    updatedAt: "2024-01-22T10:15:00Z",
  },
  {
    id: "cr-5",
    title: "Email Notification System",
    description:
      "Build automated email notification system for user actions and system events.",
    status: "in-progress",
    owner: mockUsers[3],
    assignedDevelopers: [mockUsers[3], mockUsers[4]],
    dueDate: "2024-02-20",
    tasks: [
      {
        id: "task-15",
        description: "Set up email service provider",
        status: "completed",
        assignedTo: mockUsers[3],
      },
      {
        id: "task-16",
        description: "Create email templates",
        status: "in-progress",
        assignedTo: mockUsers[4],
      },
      {
        id: "task-17",
        description: "Implement notification triggers",
        status: "not-started",
        assignedTo: mockUsers[3],
      },
      {
        id: "task-18",
        description: "Add unsubscribe functionality",
        status: "not-started",
        assignedTo: mockUsers[4],
      },
    ],
    createdAt: "2024-01-16T13:45:00Z",
    updatedAt: "2024-01-21T09:30:00Z",
  },
  {
    id: "cr-6",
    title: "Data Export Feature",
    description:
      "Allow users to export their data in multiple formats (CSV, PDF, Excel).",
    status: "pending",
    owner: mockUsers[0],
    assignedDevelopers: [mockUsers[0]],
    dueDate: "2024-02-25",
    tasks: [
      {
        id: "task-19",
        description: "Design export UI components",
        status: "not-started",
        assignedTo: mockUsers[0],
      },
      {
        id: "task-20",
        description: "Implement CSV export",
        status: "not-started",
        assignedTo: mockUsers[0],
      },
      {
        id: "task-21",
        description: "Implement PDF export",
        status: "not-started",
        assignedTo: mockUsers[0],
      },
    ],
    createdAt: "2024-01-20T08:20:00Z",
    updatedAt: "2024-01-20T08:20:00Z",
  },
];
