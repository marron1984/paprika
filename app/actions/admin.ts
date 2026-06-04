"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  requireSession,
  signInWithPassword,
  supabaseFetch,
} from "@/lib/supabase-rest";

const v = (fd: FormData, k: string) => String(fd.get(k) || "").trim();
const n = (fd: FormData, k: string) => Number(v(fd, k)) || null;
const secureCookie = process.env.NODE_ENV === "production";

async function requireAdminSession() {
  if (!(await requireSession())) redirect("/admin/login");
}

export async function login(formData: FormData) {
  const auth = await signInWithPassword(
    v(formData, "email"),
    v(formData, "password"),
  );
  const jar = await cookies();
  jar.set("sb-access-token", auth.access_token, {
    httpOnly: true,
    secure: secureCookie,
    sameSite: "lax",
    path: "/",
    maxAge: auth.expires_in,
  });
  jar.set("sb-refresh-token", auth.refresh_token, {
    httpOnly: true,
    secure: secureCookie,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/admin");
}
export async function logout() {
  const jar = await cookies();
  jar.delete("sb-access-token");
  jar.delete("sb-refresh-token");
  redirect("/admin/login");
}
export async function updateLeadStatus(formData: FormData) {
  await requireAdminSession();
  const id = v(formData, "id");
  const status = v(formData, "status");
  await supabaseFetch(
    `leads?id=eq.${id}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
        assigned_user_id: v(formData, "assigned_user_id") || null,
        loss_reason: v(formData, "loss_reason") || null,
        reapproach_date: v(formData, "reapproach_date") || null,
        updated_at: new Date().toISOString(),
      }),
    },
    true,
  );
  if (status === "入居完了") {
    await supabaseFetch(
      "conversion_events",
      {
        method: "POST",
        body: JSON.stringify({
          event_type: "CV5",
          lead_id: id,
          label: "move_in_completed",
          page_path: `/admin/leads/${id}`,
        }),
      },
      true,
    );
  }

  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin");
}
export async function addActivity(formData: FormData) {
  await requireAdminSession();
  const lead_id = v(formData, "lead_id");
  await supabaseFetch(
    "lead_activities",
    {
      method: "POST",
      body: JSON.stringify({
        lead_id,
        activity_type: v(formData, "activity_type"),
        content: v(formData, "content"),
        next_action_date: v(formData, "next_action_date") || null,
      }),
    },
    true,
  );
  revalidatePath(`/admin/leads/${lead_id}`);
}
export async function createFacility(formData: FormData) {
  await requireAdminSession();
  await supabaseFetch(
    "facilities",
    {
      method: "POST",
      body: JSON.stringify({
        name: v(formData, "name"),
        address: v(formData, "address"),
        area: v(formData, "area"),
        nearest_station: v(formData, "nearest_station"),
        type: v(formData, "type"),
        capacity: n(formData, "capacity"),
        vacancy_count: n(formData, "vacancy_count"),
        monthly_fee: n(formData, "monthly_fee"),
        initial_fee: n(formData, "initial_fee"),
        acceptable_care_levels: v(formData, "acceptable_care_levels"),
        accepts_dementia: v(formData, "accepts_dementia") === "on",
        accepts_welfare: v(formData, "accepts_welfare") === "on",
        medical_support: v(formData, "medical_support"),
        end_of_life_care: v(formData, "end_of_life_care") === "on",
        photo_url: v(formData, "photo_url"),
        description: v(formData, "description"),
        management_note: v(formData, "management_note"),
      }),
    },
    true,
  );
  revalidatePath("/admin/facilities");
}
export async function createRoom(formData: FormData) {
  await requireAdminSession();
  await supabaseFetch(
    "rooms",
    {
      method: "POST",
      body: JSON.stringify({
        facility_id: v(formData, "facility_id"),
        room_number: v(formData, "room_number"),
        floor: v(formData, "floor"),
        rent: n(formData, "rent"),
        common_fee: n(formData, "common_fee"),
        meal_fee: n(formData, "meal_fee"),
        management_fee: n(formData, "management_fee"),
        status: v(formData, "status"),
        note: v(formData, "note"),
        updated_at: new Date().toISOString(),
      }),
    },
    true,
  );
  revalidatePath("/admin/rooms");
}
export async function createTour(formData: FormData) {
  await requireAdminSession();
  const lead_id = v(formData, "lead_id");
  const facility_id = v(formData, "facility_id");
  const scheduled_at = v(formData, "scheduled_at");

  await supabaseFetch(
    "tours",
    {
      method: "POST",
      body: JSON.stringify({
        lead_id,
        facility_id,
        scheduled_at,
        participants: v(formData, "participants"),
        meeting_place: v(formData, "meeting_place"),
        result: v(formData, "result"),
        impression: v(formData, "impression"),
        next_action: v(formData, "next_action"),
        note: v(formData, "note"),
      }),
    },
    true,
  );

  await supabaseFetch(
    "conversion_events",
    {
      method: "POST",
      body: JSON.stringify({
        event_type: "CV4",
        lead_id,
        label: "tour_reserved",
        page_path: "/admin/tours",
        metadata: { facility_id, scheduled_at },
      }),
    },
    true,
  );

  revalidatePath("/admin/tours");
}

export async function createReferrer(formData: FormData) {
  await requireAdminSession();
  await supabaseFetch(
    "referrers",
    {
      method: "POST",
      body: JSON.stringify({
        type: v(formData, "type"),
        name: v(formData, "name"),
        contact_person: v(formData, "contact_person"),
        phone: v(formData, "phone"),
        email: v(formData, "email"),
        address: v(formData, "address"),
        last_contact_date: v(formData, "last_contact_date") || null,
        note: v(formData, "note"),
      }),
    },
    true,
  );
  revalidatePath("/admin/referrers");
}

export async function createAdReport(formData: FormData) {
  await requireAdminSession();
  const cost = n(formData, "cost") || 0;
  const clicks = n(formData, "clicks") || 0;
  const conversions = n(formData, "conversions") || 0;
  const moveIns = n(formData, "move_ins") || 0;

  await supabaseFetch(
    "ad_reports",
    {
      method: "POST",
      body: JSON.stringify({
        date: v(formData, "date"),
        campaign_name: v(formData, "campaign_name"),
        ad_group_name: v(formData, "ad_group_name"),
        keyword: v(formData, "keyword"),
        cost,
        impressions: n(formData, "impressions") || 0,
        clicks,
        conversions,
        tours: n(formData, "tours") || 0,
        move_ins: moveIns,
        cpa: conversions > 0 ? Math.round(cost / conversions) : null,
        move_in_unit_cost: moveIns > 0 ? Math.round(cost / moveIns) : null,
      }),
    },
    true,
  );
  revalidatePath("/admin/ads");
}

export async function createLpPage(formData: FormData) {
  await requireAdminSession();
  const slug = v(formData, "slug")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  await supabaseFetch(
    "lp_pages",
    {
      method: "POST",
      body: JSON.stringify({
        title: v(formData, "title"),
        slug,
        target_keyword: v(formData, "target_keyword"),
        hero_copy: v(formData, "hero_copy"),
        body: {
          target: v(formData, "target"),
          worries: v(formData, "worries"),
          faq: v(formData, "faq"),
        },
        status: v(formData, "status") || "draft",
        updated_at: new Date().toISOString(),
      }),
    },
    true,
  );
  revalidatePath("/admin/lps");
}

export async function updateSiteSettings(formData: FormData) {
  await requireAdminSession();
  const settings = {
    siteName: v(formData, "siteName") || "DCかいご相談ダイヤル",
    phoneNumber: v(formData, "phoneNumber"),
    lineUrl: v(formData, "lineUrl"),
    gtmId: v(formData, "gtmId"),
    googleAdsConversionId: v(formData, "googleAdsConversionId"),
    googleAdsConversionLabel: v(formData, "googleAdsConversionLabel"),
  };

  await supabaseFetch(
    "site_settings",
    {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({
        key: "site",
        value: settings,
        updated_at: new Date().toISOString(),
      }),
    },
    true,
  );
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
}
