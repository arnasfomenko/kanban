export interface ColumnTheme {
  accent: string;
  soft: string;
  border: string;
}

export const COLUMN_THEMES: Record<string, ColumnTheme> = {
  todo: {
    accent: '#3b82f6',
    soft: '#eff6ff',
    border: '#bfdbfe'
  },
  in_progress: {
    accent: '#f59e0b',
    soft: '#fffbeb',
    border: '#fde68a'
  },
  review: {
    accent: '#8b5cf6',
    soft: '#f5f3ff',
    border: '#ddd6fe'
  },
  done: {
    accent: '#10b981',
    soft: '#ecfdf5',
    border: '#a7f3d0'
  }
};

export const defaultColumnTheme: ColumnTheme = {
  accent: '#64748b',
  soft: '#f8fafc',
  border: '#e2e8f0'
};

export function getColumnTheme(columnId: string): ColumnTheme {
  return COLUMN_THEMES[columnId] ?? defaultColumnTheme;
}
