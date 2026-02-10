import { errorResponse } from "../utils/response.js";

export const authorize =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(res, "Forbidden", 403);
    }
    next();
  };
