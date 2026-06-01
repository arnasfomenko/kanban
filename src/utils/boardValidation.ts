import type { Author, BoardPayload, Column, Task } from '../types';

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: string[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function parseColumn(value: unknown, index: number): ValidationResult<Column> {
  if (!isRecord(value)) {
    return { ok: false, errors: [`columns[${index}] must be an object`] };
  }

  const errors: string[] = [];

  if (!isNonEmptyString(value.id)) {
    errors.push(`columns[${index}].id must be a non-empty string`);
  }

  if (!isNonEmptyString(value.name)) {
    errors.push(`columns[${index}].name must be a non-empty string`);
  }

  if (!isFiniteNumber(value.order)) {
    errors.push(`columns[${index}].order must be a number`);
  }

  if (value.default !== undefined && typeof value.default !== 'boolean') {
    errors.push(`columns[${index}].default must be a boolean when present`);
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      id: value.id as string,
      name: value.name as string,
      order: value.order as number,
      ...(value.default === true ? { default: true } : {})
    }
  };
}

function parseAuthor(value: unknown, index: number): ValidationResult<Author> {
  if (!isRecord(value)) {
    return { ok: false, errors: [`authors[${index}] must be an object`] };
  }

  const errors: string[] = [];

  if (!isFiniteNumber(value.id)) {
    errors.push(`authors[${index}].id must be a number`);
  }

  if (!isNonEmptyString(value.name)) {
    errors.push(`authors[${index}].name must be a non-empty string`);
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      id: value.id as number,
      name: value.name as string
    }
  };
}

function parseTask(value: unknown, index: number): ValidationResult<Task> {
  if (!isRecord(value)) {
    return { ok: false, errors: [`tasks[${index}] must be an object`] };
  }

  const errors: string[] = [];

  if (!isFiniteNumber(value.id)) {
    errors.push(`tasks[${index}].id must be a number`);
  }

  if (!isNonEmptyString(value.title)) {
    errors.push(`tasks[${index}].title must be a non-empty string`);
  }

  if (!isFiniteNumber(value.authorId)) {
    errors.push(`tasks[${index}].authorId must be a number`);
  }

  if (!isNonEmptyString(value.status)) {
    errors.push(`tasks[${index}].status must be a non-empty string`);
  }

  if (!isNonEmptyString(value.createdAt)) {
    errors.push(`tasks[${index}].createdAt must be a non-empty string`);
  } else if (Number.isNaN(Date.parse(value.createdAt as string))) {
    errors.push(`tasks[${index}].createdAt must be a valid date string`);
  }

  if (!isFiniteNumber(value.order)) {
    errors.push(`tasks[${index}].order must be a number`);
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      id: value.id as number,
      title: (value.title as string).trim(),
      authorId: value.authorId as number,
      status: value.status as string,
      createdAt: value.createdAt as string,
      order: value.order as number
    }
  };
}

export function parseBoardPayload(value: unknown): ValidationResult<BoardPayload> {
  if (!isRecord(value)) {
    return { ok: false, errors: ['Board payload must be an object'] };
  }

  if (!Array.isArray(value.columns)) {
    return { ok: false, errors: ['columns must be an array'] };
  }

  if (!Array.isArray(value.authors)) {
    return { ok: false, errors: ['authors must be an array'] };
  }

  if (!Array.isArray(value.tasks)) {
    return { ok: false, errors: ['tasks must be an array'] };
  }

  const errors: string[] = [];
  const columns: Column[] = [];
  const authors: Author[] = [];
  const tasks: Task[] = [];

  for (let index = 0; index < value.columns.length; index += 1) {
    const parsed = parseColumn(value.columns[index], index);
    if (parsed.ok) {
      columns.push(parsed.data);
    } else {
      errors.push(...parsed.errors);
    }
  }

  for (let index = 0; index < value.authors.length; index += 1) {
    const parsed = parseAuthor(value.authors[index], index);
    if (parsed.ok) {
      authors.push(parsed.data);
    } else {
      errors.push(...parsed.errors);
    }
  }

  for (let index = 0; index < value.tasks.length; index += 1) {
    const parsed = parseTask(value.tasks[index], index);
    if (parsed.ok) {
      tasks.push(parsed.data);
    } else {
      errors.push(...parsed.errors);
    }
  }

  if (columns.length === 0) {
    errors.push('columns must contain at least one column');
  }

  if (authors.length === 0) {
    errors.push('authors must contain at least one author');
  }

  const columnIds = new Set(columns.map((column) => column.id));
  const authorIds = new Set(authors.map((author) => author.id));
  const taskIds = new Set<number>();

  for (const task of tasks) {
    if (!columnIds.has(task.status)) {
      errors.push(`task ${task.id} references unknown status "${task.status}"`);
    }

    if (!authorIds.has(task.authorId)) {
      errors.push(`task ${task.id} references unknown authorId ${task.authorId}`);
    }

    if (taskIds.has(task.id)) {
      errors.push(`duplicate task id ${task.id}`);
    }

    taskIds.add(task.id);
  }

  const columnIdList = columns.map((column) => column.id);
  if (new Set(columnIdList).size !== columnIdList.length) {
    errors.push('column ids must be unique');
  }

  const authorIdList = authors.map((author) => author.id);
  if (new Set(authorIdList).size !== authorIdList.length) {
    errors.push('author ids must be unique');
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: { columns, authors, tasks }
  };
}
