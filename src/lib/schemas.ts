import { z } from 'zod';

export const bookingRequestSchema = z.object({
  hotel: z.string().min(1).max(100),
  email: z.string().email().max(200),
  arrival: z.string().min(1).max(20),
  departure: z.string().min(1).max(20),
  nights: z.number().int().min(1).max(365),
  adults: z.number().int().min(1).max(50),
  children: z.number().int().min(0).max(50).optional().default(0),
  selected_apartments: z.string().min(1).max(500),
  salutation: z.string().max(20).optional().default(''),
  firstname: z.string().max(100).optional().default(''),
  lastname: z.string().min(1).max(100),
  country: z.string().max(100).optional().default(''),
  message: z.string().max(3000).optional().default(''),
  newsletter: z.boolean().optional().default(false),
  bookingType: z.enum(['request', 'booking']).optional().default('request'),
  browserLanguage: z.string().max(10).optional().default(''),
  extras: z.union([
    z.array(z.string().max(100)),
    z.record(z.string().max(100), z.boolean()),
  ]).optional(),
});

export const availabilitySchema = z.object({
  hotel: z.string().min(1).max(100),
  arrival: z.string().min(1).max(20),
  departure: z.string().min(1).max(20),
  selected_apartments: z.string().min(1).max(500),
});

export const checkoutSchema = z.object({
  plan: z.string().min(1).max(50),
  hotelId: z.number().int().positive().optional(),
  interval: z.enum(['month', 'year']).optional().default('month'),
});

export const switchPlanSchema = z.object({
  plan: z.string().min(1).max(50),
});

export const switchHotelSchema = z.object({
  hotelId: z.number().int().positive(),
});

export const resetTrialSchema = z.object({
  hotelId: z.number().int().positive(),
});

export const settingsPresetSchema = z.object({
  hotelId: z.number().int().positive().optional(),
  name: z.string().max(100).optional(),
  accentColor: z.string().max(25).nullable().optional(),
  backgroundColor: z.string().max(25).nullable().optional(),
  cardBackground: z.string().max(25).nullable().optional(),
  textColor: z.string().max(25).nullable().optional(),
  mutedTextColor: z.string().max(25).nullable().optional(),
  borderColor: z.string().max(25).nullable().optional(),
  cardRadius: z.number().min(0).max(999).nullable().optional(),
  buttonRadius: z.number().min(0).max(999).nullable().optional(),
});
