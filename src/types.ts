export interface Column {
  id: string;
  name: string;
  order: number;
  default?: boolean;
}

export interface Author {
  id: number;
  name: string;
}

export interface Task {
  id: number;
  title: string;
  authorId: number;
  status: string;
  createdAt: string;
  order: number;
}

export interface BoardPayload {
  columns: Column[];
  authors: Author[];
  tasks: Task[];
}
