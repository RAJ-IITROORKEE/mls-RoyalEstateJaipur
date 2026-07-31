import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatInrMinorUnits(paise: number | bigint) {
  const value = typeof paise === "bigint" ? paise : BigInt(Math.trunc(paise));
  const rupees = value / BigInt(100);
  return `₹${formatIndianInteger(rupees)}`;
}

export function formatInrRupees(value: string | number | bigint) {
  const digits = String(value).replace(/\D/g, "");
  return digits ? formatIndianInteger(BigInt(digits)) : "";
}

function formatIndianInteger(value: bigint) {
  const digits = value.toString();
  if (digits.length <= 3) return digits;
  const lastThree = digits.slice(-3);
  const leading = digits.slice(0, -3);
  const groupedLeading = leading.replace(/\d(?=(\d{2})+$)/g, "$&,");
  return `${groupedLeading},${lastThree}`;
}

export function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
    new Date(value),
  );
}
