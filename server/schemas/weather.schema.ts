import { z } from "zod";
import { AlertTypeEnum, AlertChannelEnum } from "./common";

export const InsertWeatherAlertSchema = z.object({
  type: AlertTypeEnum,
  threshold: z.record(z.unknown()),
  channel: AlertChannelEnum,
  isActive: z.boolean().default(true),
});
