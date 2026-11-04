import { defineMiddleware } from "astro:middleware";
import { applySeoResponseHeaders, getSeoPolicy } from "@/config/seo";

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  const policy = getSeoPolicy(import.meta.env, context.url);

  applySeoResponseHeaders(response.headers, policy);
  return response;
});
