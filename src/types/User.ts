export interface User {
    id: number;
    username: string;
    email?: string;
    password: string;
    isAdmin: boolean;
    createdAt: string;
    deletedAt?: string | null;
  }
