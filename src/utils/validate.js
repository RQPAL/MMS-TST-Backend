import { ZodError } from "zod";
import { errorResponse } from "./response.js";

export const validateRequest = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      params: req.params,
      query: req.query
    });
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(
        res,
        error.errors.map(e => e.message).join(", "),
        400
      );
    }
    next(error);
  }
};
