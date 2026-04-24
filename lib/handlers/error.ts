import { NextResponse } from "next/server";
import { RequestError, ValidationError } from "../http-errors";
import { ZodError } from "zod";
import logger from "../logger";

export type ResponseType = "api" | "server";

const formatResponse = (
  responseType: ResponseType,
  status: number,
  message: string,
  errors?: Record<string, string[]> | undefined
) => {
  const responseContent = {
    success: false,
    error: {
      message,
      details: errors,
    },
  };

  return responseType === "api"
    ? NextResponse.json(responseContent, { status })
    : { status, ...responseContent };
};

const handleError = (error: unknown, responseType: ResponseType = "server") => {
  if (error instanceof RequestError) {
    logger.error(
      { err: error },
      `${responseType.toUpperCase()} Error: ${error.message}`
    );
    return formatResponse(
      responseType,
      error.statusCode,
      error.message,
      error.errors
    );
  }

  if (error instanceof ZodError) {
    const validationErrors = new ValidationError(
      error.flatten().fieldErrors as Record<string, string[]>
    );

    logger.error(
      {
        err: error,
      },
      `Validation Error: ${validationErrors.message}`
    );
    return formatResponse(
      responseType,
      validationErrors.statusCode,
      validationErrors.message,
      validationErrors.errors
    );
  }

  if (error instanceof Error) {
    logger.error(error.message);

    return formatResponse(responseType, 500, error.message);
  }
  logger.error("An unexpected error occurred");
  return formatResponse(responseType, 500, "An unexpected error occurred");
};

export default handleError;
