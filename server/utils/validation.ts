import { badRequest } from "./errors";
export const requiredText = (value: unknown, label: string) => {
  if (typeof value !== "string" || !value.trim())
    throw badRequest(`${label} is required`);
  return value.trim();
};
export const optionalText = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : null;
export const validDate = (value: unknown, label = "date") => {
  const d = new Date(String(value));
  if (!value || Number.isNaN(d.getTime())) throw badRequest(`Invalid ${label}`);
  return d;
};
export const enumValue = <T extends Record<string, string>>(
  values: T,
  value: unknown,
  label: string,
) => {
  if (!Object.values(values).includes(value as string))
    throw badRequest(`Invalid ${label}`);
  return value as T[keyof T];
};
export const validHttpsUrl = (value: unknown) => {
  try {
    const u = new URL(String(value));
    if (u.protocol !== "https:") throw new Error();
    return u.toString();
  } catch {
    throw badRequest("A valid HTTPS URL is required");
  }
};
