import { addDays as addDateFnsDays, eachDayOfInterval, format, parseISO } from "date-fns";

export function addDays(date: Date, days: number) {
  return addDateFnsDays(date, days);
}

export function toInputDate(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function displayDate(date: string) {
  return format(parseISO(date), "MMM d, yyyy");
}

export function displayShortDate(date: string) {
  return format(parseISO(date), "MMM d");
}

export function displayDateRange(startDate: string, endDate: string) {
  if (startDate === endDate) return displayDate(startDate);
  return `${displayShortDate(startDate)} - ${displayDate(endDate)}`;
}

export function buildDateRange(startDate: string, endDate: string) {
  return eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) }).map(toInputDate);
}

export function dayCount(startDate: string, endDate: string) {
  return buildDateRange(startDate, endDate).length;
}
