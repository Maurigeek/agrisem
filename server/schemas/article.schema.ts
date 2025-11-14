import { z } from "zod";
import { ArticleStatusEnum } from "./common";

export const InsertArticleSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  bodyMd: z.string().min(1),
  tags: z.array(z.string()).default([]),
  status: ArticleStatusEnum.default("DRAFT"),
});
