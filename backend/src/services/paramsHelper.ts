import { Request } from "express";

export function getParamString(req: Request, key: string): string | undefined {
  const value = req.params[key];

  if (typeof value === "string") return value;

  return undefined;
}