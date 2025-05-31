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
  assigned_to: string;
}

export interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "blocked";
  owner: User;
  assignedDevelopers: User[];
  due_date: string;
  tasks: Task[];
  created_at: string;
  updated_at: string;
}

export const mockUsers: User[] = [
  {
    id: "user-1",
    name: "Subhadeep Basu",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Subhadeep",
    email: "subhadeep@company.com",
  },
  {
    id: "user-2",
    name: "Nikith B",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nikith",
    email: "nikith@company.com",
  },
  {
    id: "user-3",
    name: "Prudhvi Raj",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Prudhvi",
    email: "prudhvi@company.com",
  },
  {
    id: "user-4",
    name: "Sushanth Kumar",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sushanth",
    email: "sushanth@company.com",
  },
  {
    id: "user-5",
    name: "Shubojit Halder",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Shubojit",
    email: "shubojit@company.com",
  },
];