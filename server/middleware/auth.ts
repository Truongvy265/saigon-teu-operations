import type { NextFunction, Response } from "express";
import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { prisma } from "../db";
import type { AuthRequest } from "../types";
import { authMode, isProduction } from "../config";
import { forbidden, unauthorized } from "../utils/errors";

export const extractBearerToken = (header?: string) => {
  const match = header?.match(/^Bearer\s+(\S+)$/i);
  return match?.[1] || null;
};
export const developmentIdentityAllowed = (mode: string, production: boolean) =>
  mode === "development" && !production;

const firebaseAuth = () => {
  if (!getApps().length)
    initializeApp({
      credential: applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  return getAuth();
};

async function loadActiveUser(id?: string, email?: string) {
  const user = await prisma.user.findFirst({
    where: id ? { id } : { email: email?.toLowerCase() },
    select: { id: true, companyRole: true, active: true },
  });
  if (!user?.active) throw forbidden("User is not provisioned or is inactive");
  return { id: user.id, companyRole: user.companyRole };
}

export async function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) {
  try {
    if (developmentIdentityAllowed(authMode, isProduction)) {
      const id = req.header("x-user-id");
      if (id) req.user = await loadActiveUser(id);
      else {
        const manager = await prisma.user.findFirst({
          where: { active: true, companyRole: "MANAGER" },
          select: { id: true, companyRole: true },
        });
        if (!manager)
          throw unauthorized("No development manager is provisioned");
        req.user = manager;
      }
      return next();
    }
    const token = extractBearerToken(req.header("authorization"));
    if (!token) throw unauthorized("Firebase ID token is required");
    const decoded = await firebaseAuth().verifyIdToken(token, true);
    if (!decoded.email || decoded.email_verified !== true)
      throw unauthorized("A verified Google email is required");
    req.user = await loadActiveUser(undefined, decoded.email);
    next();
  } catch (error) {
    next(error);
  }
}

export const requireManager = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) =>
  req.user.companyRole === "MANAGER"
    ? next()
    : next(forbidden("Manager permission required"));
