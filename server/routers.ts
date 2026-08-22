import { COOKIE_NAME } from "@shared/const";
import { nanoid } from "nanoid";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { getSmartTripDraft } from "./smartDraft";

const tripInput = z.object({
  name: z.string().min(2).max(160),
  description: z.string().max(1000).optional(),
  startDate: z.string(),
  endDate: z.string(),
  travelers: z.number().int().min(1).max(20),
  budget: z.number().min(0),
  currency: z.string().length(3),
  preferences: z.string().max(1500).optional(),
  visibility: z.enum(["private", "friends", "public"]),
  stops: z.array(z.object({ city: z.string().min(1).max(120), country: z.string().min(1).max(120), latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180) })).min(1).max(12),
});

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  trip: router({
    list: protectedProcedure.query(({ ctx }) => db.getTripsByOwner(ctx.user.id)),
    workspace: protectedProcedure.input(z.object({ tripId: z.number().int().positive() })).query(({ ctx, input }) => db.getTripWorkspace(ctx.user.id, input.tripId)),
    create: protectedProcedure.input(tripInput).mutation(async ({ ctx, input }) => {
      if (new Date(input.endDate).getTime() < new Date(input.startDate).getTime()) throw new Error("End date must follow start date");
      const { stops, ...tripData } = input;
      const tripId = await db.createTrip(ctx.user.id, {
        ...tripData,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        budget: String(input.budget),
      });
      await db.createTripStops(ctx.user.id, tripId, stops.map((stop, position) => ({ ...stop, latitude: String(stop.latitude), longitude: String(stop.longitude), position })));
      return { tripId };
    }),
    addItinerary: protectedProcedure.input(z.object({ tripId: z.number().int().positive(), title: z.string().min(1).max(180), startTime: z.string().optional(), itineraryDate: z.string().max(10).optional(), type: z.enum(["activity", "transport", "stay"]), notes: z.string().max(1200).optional() })).mutation(({ ctx, input }) => db.createItineraryItem(ctx.user.id, input.tripId, { title: input.title, startTime: input.startTime, itineraryDate: input.itineraryDate ? new Date(`${input.itineraryDate}T00:00:00`) : undefined, type: input.type, notes: input.notes })),
    deleteItinerary: protectedProcedure.input(z.object({ tripId: z.number().int().positive(), itemId: z.number().int().positive() })).mutation(({ ctx, input }) => db.deleteItineraryItem(ctx.user.id, input.tripId, input.itemId)),
    updateItinerary: protectedProcedure.input(z.object({ tripId: z.number().int().positive(), itemId: z.number().int().positive(), title: z.string().min(1).max(180).optional(), startTime: z.string().max(8).optional(), itineraryDate: z.string().max(10).optional(), type: z.enum(["activity", "transport", "stay"]).optional(), notes: z.string().max(1200).optional() }).refine(input => Object.keys(input).some(key => !["tripId", "itemId"].includes(key)), { message: "Provide at least one itinerary change" })).mutation(({ ctx, input }) => db.updateItineraryItem(ctx.user.id, input.tripId, input.itemId, { title: input.title, startTime: input.startTime, type: input.type, notes: input.notes, ...(input.itineraryDate !== undefined ? { itineraryDate: new Date(`${input.itineraryDate}T00:00:00`) } : {}) })),
    reorderItinerary: protectedProcedure.input(z.object({ tripId: z.number().int().positive(), orderedItemIds: z.array(z.number().int().positive()).min(1) })).mutation(({ ctx, input }) => db.reorderItinerary(ctx.user.id, input.tripId, input.orderedItemIds)),
    addExpense: protectedProcedure.input(z.object({ tripId: z.number().int().positive(), title: z.string().min(1).max(180), category: z.enum(["transport", "stay", "activities", "meals", "misc"]), amount: z.number().positive() })).mutation(({ ctx, input }) => db.createExpense(ctx.user.id, input.tripId, { title: input.title, category: input.category, amount: String(input.amount) })),
    createShare: protectedProcedure.input(z.object({ tripId: z.number().int().positive() })).mutation(async ({ ctx, input }) => ({ shareCode: await db.createShare(ctx.user.id, input.tripId, nanoid(10)) })),
    publicTrip: publicProcedure.input(z.object({ shareCode: z.string().min(1).max(32) })).query(({ input }) => db.getPublicTripByShareCode(input.shareCode)),
    copyPublic: protectedProcedure.input(z.object({ shareCode: z.string().min(1).max(32) })).mutation(async ({ ctx, input }) => ({ tripId: await db.copyPublicTrip(ctx.user.id, input.shareCode) })),
  }),
  preferences: router({
    me: protectedProcedure.query(({ ctx }) => db.getUserPreferences(ctx.user.id)),
    save: protectedProcedure.input(z.object({ travelStyle: z.string().max(500).optional(), budgetStyle: z.string().max(60).optional(), favoriteCategories: z.string().max(500).optional() })).mutation(({ ctx, input }) => db.saveUserPreferences(ctx.user.id, input)),
  }),
  favorite: router({
    list: protectedProcedure.query(({ ctx }) => db.getUserFavorites(ctx.user.id)),
    toggle: protectedProcedure.input(z.object({ city: z.string().min(1).max(120), country: z.string().min(1).max(120), latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180), coverImage: z.string().max(512).optional() })).mutation(({ ctx, input }) => db.toggleFavoriteDestination(ctx.user.id, { ...input, latitude: String(input.latitude), longitude: String(input.longitude) })),
  }),
  smartDraft: router({
    generate: protectedProcedure.input(z.object({ intent: z.string().min(12).max(800), variation: z.number().int().min(0).max(12).optional() })).mutation(({ input }) => getSmartTripDraft(input.intent.trim(), input.variation ?? 0)),
    createTrip: protectedProcedure.input(z.object({ intent: z.string().min(12).max(800), days: z.number().int().min(2).max(10), budget: z.number().positive(), destinationIds: z.array(z.number().int().positive()).min(1).max(3), schedule: z.array(z.object({ day: z.number().int().min(1).max(10), destinationId: z.number().int().positive(), activityId: z.number().int().positive() })).min(1).max(30) })).mutation(async ({ ctx, input }) => ({ tripId: await db.applySmartTripDraft(ctx.user.id, input) })),
  }),
  admin: router({
    metrics: adminProcedure.query(() => db.getAdminMetrics()),
    destinations: adminProcedure.query(() => db.getAdminDestinations()),
    createDestination: adminProcedure.input(z.object({ city: z.string().min(1).max(120), country: z.string().min(1).max(120), latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180), description: z.string().max(1200).optional() })).mutation(({ input }) => db.createAdminDestination({ ...input, latitude: String(input.latitude), longitude: String(input.longitude) })),
    createActivity: adminProcedure.input(z.object({ destinationId: z.number().int().positive(), title: z.string().min(1).max(180), category: z.string().min(1).max(80), description: z.string().max(1200).optional(), estimatedCost: z.number().min(0), durationMinutes: z.number().int().min(1).max(1440).optional() })).mutation(({ input }) => db.createAdminActivity({ ...input, estimatedCost: String(input.estimatedCost) })),
  }),
});

export type AppRouter = typeof appRouter;
