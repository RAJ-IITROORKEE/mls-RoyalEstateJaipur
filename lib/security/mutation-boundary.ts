import { NextResponse } from "next/server";
import { isSameOriginMutation } from "@/lib/security/request-origin";
import { ServiceUnavailableError } from "@/lib/security/service-unavailable";
import { z } from "zod";

class RequestBodyError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function readBoundedRequest(request: Request, maxBodyBytes: number) {
  const declaredSize = request.headers.get("content-length");
  if (
    declaredSize &&
    (!/^\d+$/.test(declaredSize) || Number(declaredSize) > maxBodyBytes)
  ) {
    throw new RequestBodyError(413, "The request is too large.");
  }
  if (!request.body) return request;
  const contentType = request.headers.get("content-type")?.split(";")[0];
  if (
    !contentType ||
    ![
      "application/json",
      "application/x-www-form-urlencoded",
      "multipart/form-data",
    ].includes(contentType)
  ) {
    throw new RequestBodyError(415, "Use a supported form or JSON request.");
  }
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > maxBodyBytes) {
        await reader.cancel();
        throw new RequestBodyError(413, "The request is too large.");
      }
      chunks.push(chunk.value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const bounded = new Request(request.url, {
    method: request.method,
    headers: request.headers,
    body: bytes.buffer,
    signal: request.signal,
  });
  try {
    if (contentType === "application/json") await bounded.clone().json();
    else await bounded.clone().formData();
  } catch {
    throw new RequestBodyError(
      400,
      "The request could not be read. Check the form and try again.",
    );
  }
  return bounded;
}

export function withMutationBoundary<Context>(
  handler: (request: Request, context: Context) => Promise<Response>,
  { maxBodyBytes = 256 * 1024 }: { maxBodyBytes?: number } = {},
) {
  return async (request: Request, context: Context) => {
    const requestId = crypto.randomUUID();
    let response: Response;
    if (!isSameOriginMutation(request)) {
      response = NextResponse.json(
        { error: "This request must come from this site." },
        { status: 403 },
      );
    } else {
      try {
        if (context && typeof context === "object" && "params" in context) {
          const params: unknown = await context.params;
          if (
            params &&
            typeof params === "object" &&
            "id" in params &&
            !z.object({ id: z.string().uuid() }).safeParse(params).success
          ) {
            throw new RequestBodyError(
              404,
              "The requested record was not found.",
            );
          }
        }
        response = await handler(
          await readBoundedRequest(request, maxBodyBytes),
          context,
        );
      } catch (error) {
        const status =
          error instanceof RequestBodyError
            ? error.status
            : error instanceof ServiceUnavailableError
              ? 503
              : error instanceof SyntaxError
                ? 400
                : 500;
        const message =
          error instanceof RequestBodyError
            ? error.message
            : status === 400
              ? "The request could not be read. Check the form and try again."
              : "The request could not be completed. Please try again.";
        if (status === 500)
          console.error("API mutation failed", {
            requestId,
            path: new URL(request.url).pathname,
          });
        response = NextResponse.json({ error: message, requestId }, { status });
      }
    }
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("X-Request-Id", requestId);
    return response;
  };
}
