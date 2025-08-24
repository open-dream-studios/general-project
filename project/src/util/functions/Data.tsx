import { Product } from "@/contexts/queryContext";
import crypto from "crypto";

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };
  return date.toLocaleString("en-US", options);
};

export const formatSQLDate = (
  value: string | Date,
  showFullYear = false
): string => {
  const date = typeof value === "string" ? new Date(value) : value;

  if (isNaN(date.getTime())) return "";

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = showFullYear ? date.getFullYear() : date.getFullYear() % 100;

  return `${month}/${day}/${year}`;
};

export const parseDateString = (input: string): string | null => {
  const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/;
  const match = input.match(regex);
  if (!match) return null;

  const [, mm, dd, yy] = match;
  const month = parseInt(mm, 10);
  const day = parseInt(dd, 10);
  let year = parseInt(yy, 10);

  if (year < 100) {
    year += year < 50 ? 2000 : 1900; // 25 => 2025, 90 => 1990
  }

  const date = new Date(year, month - 1, day);
  if (isNaN(date.getTime())) return null;

  return date.toISOString();
};

export const capitalizeFirstLetter = (word: string) => {
  return word.charAt(0).toUpperCase() + word.slice(1);
};

export const validateEmail = (email: string) => {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return regex.test(email);
};

export const removeWhiteSpace = (input: string) => {
  return input.replace(/\s+/g, "");
};

export const generateUniqueId = () => {
  return crypto.randomBytes(15).toString("hex");
};

export function secondsToISO8601(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  let isoString = "PT";
  if (hours) isoString += `${hours}H`;
  if (minutes) isoString += `${minutes}M`;
  if (secs) isoString += `${secs}S`;

  return isoString;
}

export function iso8601ToSeconds(isoString: string): number {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(\.\d+)?)S)?/;
  const match = isoString.match(regex);
  if (!match) return 0;
  const [, hours, minutes, seconds] = match;
  return (
    parseInt(hours || "0") * 3600 +
    parseInt(minutes || "0") * 60 +
    parseFloat(seconds || "0")
  );
}

export const getCurrentTimestamp = () => {
  const now = new Date();
  const pad = (num: number, size = 2) => String(num).padStart(size, "0");
  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-` +
    `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(
      now.getSeconds()
    )}-` +
    `${pad(now.getMilliseconds(), 3)}`
  );
};

export const random8Digits = () => {
  return Math.floor(10000000 + Math.random() * 90000000);
};

export const getNextOrdinal = (productsData: Product[]): number => {
  const ordinals = productsData.map((p) => p.ordinal);
  return ordinals.length > 0 ? Math.max(...ordinals) + 1 : 0;
};
