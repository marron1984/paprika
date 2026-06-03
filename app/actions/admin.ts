"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { signInWithPassword, supabaseFetch } from "@/lib/supabase-rest";

const v = (fd: FormData, k: string) => String(fd.get(k) || "").trim();
const n = (fd: FormData, k: string) => Number(v(fd, k)) || null;

export async function login(formData: FormData) {
  const auth = await signInWithPassword(v(formData, "email"), v(formData, "password"));
  const jar = await cookies();
  jar.set("sb-access-token", auth.access_token, { httpOnly: true, secure: true, sameSite: "lax", path: "/" });
  jar.set("sb-refresh-token", auth.refresh_token, { httpOnly: true, secure: true, sameSite: "lax", path: "/" });
  redirect("/admin");
}
export async function logout() { (await cookies()).delete("sb-access-token"); redirect("/admin/login"); }
export async function updateLeadStatus(formData: FormData) { const id = v(formData,"id"); await supabaseFetch(`leads?id=eq.${id}`, { method:"PATCH", body: JSON.stringify({ status: v(formData,"status"), assigned_user_id: v(formData,"assigned_user_id") || null, loss_reason: v(formData,"loss_reason") || null, reapproach_date: v(formData,"reapproach_date") || null, updated_at: new Date().toISOString() }) }, true); revalidatePath(`/admin/leads/${id}`); revalidatePath("/admin"); }
export async function addActivity(formData: FormData) { const lead_id = v(formData,"lead_id"); await supabaseFetch("lead_activities", { method:"POST", body: JSON.stringify({ lead_id, activity_type: v(formData,"activity_type"), content: v(formData,"content"), next_action_date: v(formData,"next_action_date") || null }) }, true); revalidatePath(`/admin/leads/${lead_id}`); }
export async function createFacility(formData: FormData) { await supabaseFetch("facilities", { method:"POST", body: JSON.stringify({ name:v(formData,"name"), address:v(formData,"address"), area:v(formData,"area"), nearest_station:v(formData,"nearest_station"), type:v(formData,"type"), capacity:n(formData,"capacity"), vacancy_count:n(formData,"vacancy_count"), monthly_fee:n(formData,"monthly_fee"), initial_fee:n(formData,"initial_fee"), acceptable_care_levels:v(formData,"acceptable_care_levels"), accepts_dementia: v(formData,"accepts_dementia")==="on", accepts_welfare: v(formData,"accepts_welfare")==="on", medical_support:v(formData,"medical_support"), end_of_life_care: v(formData,"end_of_life_care")==="on", photo_url:v(formData,"photo_url"), description:v(formData,"description"), management_note:v(formData,"management_note") }) }, true); revalidatePath("/admin/facilities"); }
export async function createRoom(formData: FormData) { await supabaseFetch("rooms", { method:"POST", body: JSON.stringify({ facility_id:v(formData,"facility_id"), room_number:v(formData,"room_number"), floor:v(formData,"floor"), rent:n(formData,"rent"), common_fee:n(formData,"common_fee"), meal_fee:n(formData,"meal_fee"), management_fee:n(formData,"management_fee"), status:v(formData,"status"), note:v(formData,"note"), updated_at:new Date().toISOString() }) }, true); revalidatePath("/admin/rooms"); }
export async function createTour(formData: FormData) { await supabaseFetch("tours", { method:"POST", body: JSON.stringify({ lead_id:v(formData,"lead_id"), facility_id:v(formData,"facility_id"), scheduled_at:v(formData,"scheduled_at"), participants:v(formData,"participants"), meeting_place:v(formData,"meeting_place"), result:v(formData,"result"), impression:v(formData,"impression"), next_action:v(formData,"next_action"), note:v(formData,"note") }) }, true); revalidatePath("/admin/tours"); }
