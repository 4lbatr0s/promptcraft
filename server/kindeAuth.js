import { jwtVerify } from '@kinde-oss/kinde-node-express';
import { findUserByKindeId, updateLastLogin } from './services/userService.js';

// Initialize the JWT verifier.
// The error "Cannot destructure property 'audience' of 't' as it is undefined"
// indicates that the 'jwtVerify' function expects an 'audience' property.
// We are explicitly providing it here.
// Replace "https://jiro.kinde.com" with your actual Kinde domain.
// If you have a specific API audience configured in Kinde, use that instead.
const verifier = jwtVerify("https://jiro.kinde.com", {
  audience: process.env.VITE_KINDE_AUDIENCE // Set the audience to your Kinde domain or your API identifier
});

/**
 * Express middleware for Kinde authentication.
 * Verifies the JWT token, integrates Kinde user data with your database,
 * and attaches user information to the request object.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 */
export async function authMiddleware(req, res, next) {
  try {
    // The 'verifier' function returned by 'jwtVerify' is an Express middleware.
    // It handles token extraction and validation, then calls the provided callback.
    verifier(req, res, async (err) => {
      // If the Kinde verifier encounters an error (e.g., invalid token, expired token)
      if (err) {
        console.error('Kinde token verification error:', err);
        // Respond with a 401 Unauthorized status.
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      // After successful verification, Kinde SDK populates req.user with basic Kinde ID.
      // Ensure req.user and req.user.id are present.
      if (!req.user || !req.user.id) {
        console.error('Kinde user ID not found after verification.');
        return res.status(401).json({ error: 'Authentication failed: Kinde user ID missing' });
      }

      try {
        // Attempt to find the user in your database using their Kinde ID.
        const dbUser = await findUserByKindeId(req.user.id);

        if (dbUser) {
          // If the user exists in your database, update their last login time.
          await updateLastLogin(req.user.id);
          // Overwrite req.user with comprehensive data from your database.
          req.user = {
            kindeId: dbUser.kindeId,
            email: dbUser.email,
            givenName: dbUser.givenName,
            familyName: dbUser.familyName,
            picture: dbUser.picture,
            isEmailVerified: dbUser.isEmailVerified,
            id: dbUser.kindeId // Ensure 'id' property is consistent
          };
        } else {
          // If the user is not found in your database,
          // initialize req.user with the Kinde ID and default empty values.
          // This might happen for new users on their first login.
          req.user = {
            kindeId: req.user.id, // Kinde's ID is available as req.user.id
            email: '',
            givenName: '',
            familyName: '',
            picture: null,
            isEmailVerified: false,
            id: req.user.id
          };
        }
        // Proceed to the next middleware or route handler.
        next();
      } catch (dbError) {
        // Handle any database-related errors during user lookup or update.
        console.error('Database error in auth middleware:', dbError);
        // Even if there's a DB error, we still want to proceed with basic Kinde user info
        // to avoid blocking the request entirely if authentication itself was successful.
        req.user = {
          kindeId: req.user.id,
          email: '',
          givenName: '',
          familyName: '',
          picture: null,
          isEmailVerified: false,
          id: req.user.id
        };
        next();
      }
    });
  } catch (error) {
    // Catch any synchronous errors that might occur before the verifier is called,
    // or unexpected errors within the middleware setup itself.
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed due to an unexpected server error' });
  }
}
