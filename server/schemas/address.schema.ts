import { z } from "zod";

export const AddressSchema = z.object({
  id: z.number().optional(),
  userId: z.number().optional(),
  label: z.string().min(1),
  country: z.string().min(1),
  region: z.string().min(1),
  city: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isDefault: z.boolean().default(false),
});

export const InsertAddress = AddressSchema.omit({ id: true, userId: true });
