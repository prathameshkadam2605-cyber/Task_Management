import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

/**
 * Formats an ISO date ("YYYY-MM-DD") or ISO datetime string into "MMM D, YYYY"
 * without timezone drift or locale discrepancy across environments.
 */
export function formatDisplayDate(dateInput?: string | null): string {
  if (!dateInput) return "—";

  try {
    // If it's a simple YYYY-MM-DD date
    if (dateInput.includes("-") && dateInput.length === 10) {
      const [yearStr, monthStr, dayStr] = dateInput.split("-");
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10) - 1;
      const day = parseInt(dayStr, 10);

      if (!isNaN(year) && !isNaN(month) && !isNaN(day) && month >= 0 && month < 12) {
        return `${MONTH_NAMES[month]} ${day}, ${year}`;
      }
    }

    // For datetime timestamps
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return dateInput;

    const month = MONTH_NAMES[d.getUTCMonth()];
    const day = d.getUTCDate();
    const year = d.getUTCFullYear();

    return `${month} ${day}, ${year}`;
  } catch {
    return dateInput || "—";
  }
}
