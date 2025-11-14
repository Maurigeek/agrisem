import { z } from "zod";

export const PaginatedResponseSchema = z.object({
  count: z.number(),
  page: z.number(),
  page_size: z.number(),
  results: z.array(z.any()),
});
