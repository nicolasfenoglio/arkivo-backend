import { getAuth } from "firebase-admin/auth";

function getBearerToken(authorizationHeader) {
  const bearerPrefix = "Bearer ";

  if (!authorizationHeader?.startsWith(bearerPrefix)) {
    return null;
  }

  const token = authorizationHeader.slice(bearerPrefix.length).trim();
  return token || null;
}

function setAuthenticatedSession(req, token, decodedToken) {
  req.user = decodedToken;
  req.auth = {
    source: "bearer",
    authenticated: true,
    token,
  };
}

export function createSessionMiddleware() {
  return async function sessionMiddleware(req, res, next) {
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
