import type { Request, Response, NextFunction } from "express";
import { getAuth } from "firebase-admin/auth";
import type { DecodedIdToken } from "firebase-admin/auth";

declare global {
  namespace Express {
    interface Request {
      user?: DecodedIdToken;
      auth?: {
        source: string;
        authenticated: boolean;
        token: string;
      };
    }
  }
}

function getBearerToken(authorizationHeader?: string): string | null {
  const bearerPrefix = "Bearer ";

  if (!authorizationHeader?.startsWith(bearerPrefix)) {
    return null;
  }

  const token = authorizationHeader.slice(bearerPrefix.length).trim();
  return token || null;
}

function setAuthenticatedSession(
  req: Request,
  token: string,
  decodedToken: DecodedIdToken,
): void {
  req.user = decodedToken;
  req.auth = {
    source: "bearer",
    authenticated: true,
    token,
  };
}

export function createSessionMiddleware() {
  return async function sessionMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void | Response> {
    const token = getBearerToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized",
        error: "missing_bearer_token",
      });
    }

    try {
      const auth = getAuth();
      const decodedToken = await auth.verifyIdToken(token, true);

      setAuthenticatedSession(req, token, decodedToken);
      return next();
    } catch {
      return res.status(401).json({
        message: "Unauthorized",
        error: "invalid_bearer_token",
      });
    }
  };
}

export const sessionMiddleware = createSessionMiddleware();

export default createSessionMiddleware;
