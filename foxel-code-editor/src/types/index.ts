export interface CodeTheme {
  name: string;
  background: string;
  foreground: string;
  keyword: string;
  string: string;
  comment: string;
  number: string;
  function: string;
  variable: string;
  type: string;
  operator: string;
  punctuation: string;
}

export interface SearchResult {
  line: number;
  column: number;
  text: string;
}

export interface FileInfo {
  name: string;
  size: number;
  lines: number;
  language: string;
}