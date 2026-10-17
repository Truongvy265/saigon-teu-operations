import type { CompanyRole } from "@prisma/client";
import type { Request } from "express";
export type AuthUser = { id: string; companyRole: CompanyRole };
export type AuthRequest = Request & { user: AuthUser };
