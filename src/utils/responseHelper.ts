import type { Context } from "hono";
import type { StatusCode } from "hono/utils/http-status";

export const MESSAGES = {
  // Success
  CREATED: "Resource created successfully.",
  UPDATED: "Resource updated successfully.",
  DELETED: "Resource deleted successfully.",
  FETCHED: "Data fetched successfully.",
  OPERATION_SUCCESS: "Operation completed successfully.",

  // Client Errors
  BAD_REQUEST: "Invalid request data.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  FORBIDDEN: "Access denied.",
  NOT_FOUND: "Requested resource not found.",
  VALIDATION_FAILED: "Validation failed.",

  // Server Errors
  INTERNAL_ERROR: "Something went wrong. Please try again later.",
};

type SuccessResponse<T = unknown> = {
  success: true;
  message: string;
  data?: T;
};

type ErrorResponse<T = unknown> = {
  success: false;
  message: string;
  error?: T;
};

export const successResponse = <T>({
  c,
  message = "",
  data = undefined,
  statusCode = 200,
}: {
  c: Context;
  message: string;
  data?: T;
  statusCode: Number;
}) => {
  const response: SuccessResponse<T> = {
    success: true,
    message,
    ...(data !== undefined && { data }),
  };
  c.status(statusCode as StatusCode);
  return c.json(response);
};

export const errorResponse = <T>({
  c,
  message,
  statusCode = 400,
  error,
}: {
  c: Context;
  message: string;
  statusCode: Number;
  error?: T;
}) => {
  const response: ErrorResponse = {
    success: false,
    message,
    ...(error && { error }),
  };
  c.status(statusCode as StatusCode);
  return c.json(response);
};
