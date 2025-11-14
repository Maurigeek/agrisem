import { z } from "zod";
import { TopicTypeEnum } from "./common";

export const InsertThreadSchema = z.object({
  topicType: TopicTypeEnum,
  topicId: z.number(),
  supplierId: z.number(),
});

export const InsertMessageSchema = z.object({
  body: z.string().min(1),
  attachments: z.array(z.string()).optional(),
});
