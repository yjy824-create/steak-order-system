export const tableNumbers = ["A1", "A2", "A3", "A4", "B1", "B2", "B3", "B4"];

export function getValidTableNumber(value: string | null | undefined) {
  const normalized = value?.trim().toUpperCase() || "";

  return tableNumbers.includes(normalized) ? normalized : "";
}

export function withTableParam(path: string, tableNumber: string) {
  if (!tableNumber) {
    return path;
  }

  return `${path}?table=${encodeURIComponent(tableNumber)}`;
}
