export enum TaskType {
  CODE = 'code',
  FIX_BUG = 'fix_bug',
  EXPLAIN = 'explain',
  OPTIMIZE_CODE = 'optimize_code',
}

export interface GeminiResponse {
  status: 'ok' | 'error';
  content: string;
}

export interface HistoryItem {
  id: string;
  prompt: string;
  response: GeminiResponse;
  task: TaskType;
  timestamp: string;
  warnings?: string[];
}
