import { differenceInYears, format, formatDistance } from "date-fns";

export const calculateAge = (dob: Date) => {
  return differenceInYears(new Date(), dob);
};

export function formatShortDateTime(date: string | number | Date) {
  return format(date, "dd MMM yy h:mm:a").toString();
}

export function formatSinceDate(date: string | number | Date) {
  return format(date, "dd MMM yy");
}

export function timeAgo(date: string | Date) {
  return formatDistance(new Date(date), new Date()) + " ago";
}
