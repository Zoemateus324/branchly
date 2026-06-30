import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClerkClient, verifyToken } from "@clerk/backend";

// Server middleware: verify the Clerk session token attached by
// `attachClerkAuth` and inject the verified user + primary email into the
// handler context. Server functions must never trust an email or userId
// supplied by the client.
export const requireClerkAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      throw new Error("CLERK_SECRET_KEY is not set on the server");
    }

    const request = getRequest();
    const token = request?.headers?.get("x-clerk-token");
    if (!token) {
      throw new Error("Unauthorized: missing Clerk session token");
    }

    const clerk = createClerkClient({ secretKey });

    let userId: string;
    try {
      const claims = await verifyToken(token, { secretKey });
      userId = claims.sub;
    } catch {
      throw new Error("Unauthorized: invalid Clerk session token");
    }

    const user = await clerk.users.getUser(userId);
    const primaryId = user.primaryEmailAddressId;
    const primary =
      user.emailAddresses.find((e) => e.id === primaryId) ??
      user.emailAddresses[0];
    const email = primary?.emailAddress;
    if (!email) {
      throw new Error("Unauthorized: Clerk user has no email address");
    }

    return next({
      context: { userId, email },
    });
  },
);