import { createClient } from "@/lib/supabase/client";
import type { CalendarEvent, CalendarEventType, CalendarStatus, LinkedDocRef } from "../types/calendar.types";
import { CALENDAR_COLORS } from "../types/calendar.types";

async function getSupabase() {
  const mod = await import("@/lib/supabase/client");
  return mod.createClient();
}

// Helper function to get current user's organization ID
const getOrganizationId = async (): Promise<string> => {
  if (process.env.NODE_ENV === 'development') {
    return '00000000-0000-0000-0000-000000000001'
  }
  const sb = await getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  
  const { data: profile } = await sb
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();
    
  if (!profile?.organization_id) throw new Error("User not associated with organization");
  return profile.organization_id;
};

export const createCalendarEvent = async (e: Omit<CalendarEvent,"id"|"createdAt"|"updatedAt"|"color"> & { color?: string }) => {
  const organizationId = await getOrganizationId();
  
  const payload = {
    title: e.title,
    type: e.type,
    status: e.status,
    resource: e.resource,
    sku: e.sku,
    linked_collection: e.linked?.collection,
    linked_id: e.linked?.id,
    starts_at: e.startsAt,
    ends_at: e.endsAt,
    all_day: e.allDay,
    timezone: e.timezone,
    notes: e.notes,
    color: e.color ?? CALENDAR_COLORS[e.type] ?? "#64748b",
    organization_id: organizationId,
  };
  
  const sb = await getSupabase();
  const { data, error } = await sb
    .from("calendar_events")
    .insert(payload)
    .select()
    .single();
    
  if (error) throw error;
  
  // Convert Supabase format to CalendarEvent format
  return {
    id: data.id,
    title: data.title,
    type: data.type as CalendarEventType,
    status: data.status as CalendarStatus,
    resource: data.resource,
    sku: data.sku,
    linked: data.linked_collection && data.linked_id ? {
      collection: data.linked_collection as any,
      id: data.linked_id
    } : undefined,
    startsAt: data.starts_at,
    endsAt: data.ends_at,
    allDay: data.all_day,
    timezone: data.timezone as "Australia/Brisbane",
    notes: data.notes,
    color: data.color,
    createdAt: new Date(data.created_at!).getTime(),
    updatedAt: new Date(data.updated_at!).getTime(),
  } as CalendarEvent;
};

export const updateCalendarEvent = async (id: string, patch: Partial<CalendarEvent>) => {
  const updateData: any = {};
  
  if (patch.title !== undefined) updateData.title = patch.title;
  if (patch.type !== undefined) updateData.type = patch.type;
  if (patch.status !== undefined) updateData.status = patch.status;
  if (patch.resource !== undefined) updateData.resource = patch.resource;
  if (patch.sku !== undefined) updateData.sku = patch.sku;
  if (patch.linked !== undefined) {
    updateData.linked_collection = patch.linked?.collection;
    updateData.linked_id = patch.linked?.id;
  }
  if (patch.startsAt !== undefined) updateData.starts_at = patch.startsAt;
  if (patch.endsAt !== undefined) updateData.ends_at = patch.endsAt;
  if (patch.allDay !== undefined) updateData.all_day = patch.allDay;
  if (patch.timezone !== undefined) updateData.timezone = patch.timezone;
  if (patch.notes !== undefined) updateData.notes = patch.notes;
  if (patch.color !== undefined) updateData.color = patch.color;
  
  const sb = await getSupabase();
  const { error } = await sb
    .from("calendar_events")
    .update(updateData)
    .eq("id", id);
    
  if (error) throw error;
};

export const deleteCalendarEvent = async (id: string) => {
  const sb = await getSupabase();
  const { error } = await sb
    .from("calendar_events")
    .delete()
    .eq("id", id);
    
  if (error) throw error;
};

export const listCalendarEvents = async (opts?: { 
  from?: string; 
  to?: string; 
  type?: CalendarEventType; 
  status?: CalendarStatus;
  resource?: string;
  sku?: string;
}) => {
  let organizationId: string | null = null;
  try {
    organizationId = await getOrganizationId();
  } catch (err) {
    // In cases where the user is not signed in or profile/org is missing,
    // return an empty list so the UI can continue gracefully.
    const message = err instanceof Error ? err.message : JSON.stringify(err || {});
     
    console.warn("listCalendarEvents: no organization context, returning []:", message);
    return [] as CalendarEvent[];
  }
  
  const sb = await getSupabase();
  let query = sb
    .from("calendar_events")
    .select("*")
    .eq("organization_id", organizationId)
    .order("starts_at", { ascending: true });
  
  // Add filters if provided
  if (opts?.from) {
    query = query.gte("starts_at", opts.from);
  }
  if (opts?.to) {
    query = query.lte("starts_at", opts.to);
  }
  if (opts?.type) {
    query = query.eq("type", opts.type);
  }
  if (opts?.status) {
    query = query.eq("status", opts.status);
  }
  if (opts?.resource) {
    query = query.eq("resource", opts.resource);
  }
  if (opts?.sku) {
    query = query.eq("sku", opts.sku);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  
  return (data ?? []).map((d: any) => ({
    id: d.id,
    title: d.title,
    type: d.type as CalendarEventType,
    status: d.status as CalendarStatus,
    resource: d.resource,
    sku: d.sku,
    linked: d.linked_collection && d.linked_id ? {
      collection: d.linked_collection as any,
      id: d.linked_id
    } : undefined,
    startsAt: d.starts_at,
    endsAt: d.ends_at,
    allDay: d.all_day,
    timezone: d.timezone as "Australia/Brisbane",
    notes: d.notes,
    color: d.color,
    createdAt: new Date(d.created_at!).getTime(),
    updatedAt: new Date(d.updated_at!).getTime(),
  })) as CalendarEvent[];
};

export const getCalendarEvent = async (id: string): Promise<CalendarEvent | null> => {
  const sb = await getSupabase();
  const { data, error } = await sb
    .from("calendar_events")
    .select("*")
    .eq("id", id)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') return null; // No rows returned
    throw error;
  }
  
  return {
    id: data.id,
    title: data.title,
    type: data.type as CalendarEventType,
    status: data.status as CalendarStatus,
    resource: data.resource,
    sku: data.sku,
    linked: data.linked_collection && data.linked_id ? {
      collection: data.linked_collection as any,
      id: data.linked_id
    } : undefined,
    startsAt: data.starts_at,
    endsAt: data.ends_at,
    allDay: data.all_day,
    timezone: data.timezone as "Australia/Brisbane",
    notes: data.notes,
    color: data.color,
    createdAt: new Date(data.created_at!).getTime(),
    updatedAt: new Date(data.updated_at!).getTime(),
  } as CalendarEvent;
};

export const findCalendarEventByLink = async (
  collection: LinkedDocRef['collection'],
  id: string
): Promise<CalendarEvent | null> => {
  const sb = await getSupabase();
  const { data, error } = await sb
    .from("calendar_events")
    .select("*")
    .eq("linked_collection", collection)
    .eq("linked_id", id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows returned
    throw error;
  }

  return {
    id: data.id,
    title: data.title,
    type: data.type as CalendarEventType,
    status: data.status as CalendarStatus,
    resource: data.resource,
    sku: data.sku,
    linked: data.linked_collection && data.linked_id ? {
      collection: data.linked_collection as any,
      id: data.linked_id
    } : undefined,
    startsAt: data.starts_at,
    endsAt: data.ends_at,
    allDay: data.all_day,
    timezone: data.timezone as "Australia/Brisbane",
    notes: data.notes,
    color: data.color,
    createdAt: new Date(data.created_at!).getTime(),
    updatedAt: new Date(data.updated_at!).getTime(),
  } as CalendarEvent;
}
