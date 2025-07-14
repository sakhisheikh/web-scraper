
export interface TableData {
  headers: string[];
  rows: (string | number)[][];
}

// TableCard component for displaying generic tables. No import path changes needed as TableData is defined locally.
export default function TableCard({ data }: { data: TableData }) {
  // Render your table here
}