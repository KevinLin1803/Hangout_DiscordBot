import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseDateRangeToDays(startStr: string, endStr: string): { short: string, date: string }[] {
    const currentYear = new Date().getFullYear();

    const parseToDate = (dateStr: string): Date => {
      const [day, month] = dateStr.split("/").map(Number);
      return new Date(currentYear, month - 1, day); // Month is 0-based
    };

    const formatDate = (date: Date): string => {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      return `${day}/${month}`;
    };

    const getShortDay = (date: Date): string => {
      return date.toLocaleDateString("en-AU", { weekday: "short" }); // e.g., "Tue"
    };

    const startDate = parseToDate(startStr);
    const endDate = parseToDate(endStr);
    const result: { short: string; date: string }[] = [];

    const current = new Date(startDate);

    while (current <= endDate) {
      result.push({
        short: getShortDay(current),
        date: formatDate(current),
      });

      // Increment by 1 day
      current.setDate(current.getDate() + 1);
    }

    return result;
  }
