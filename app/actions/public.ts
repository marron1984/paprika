"use server";
import { redirect } from "next/navigation";
import { supabaseFetch } from "@/lib/supabase-rest";

function value(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function createInquiry(formData: FormData) {
  const hp = value(formData, "company_name");
  if (hp) redirect("/thanks");
  const consultant_name = value(formData, "consultant_name");
  const consultant_phone = value(formData, "consultant_phone");
  if (!consultant_name || !consultant_phone)
    throw new Error("相談者氏名と電話番号は必須です。");
  const resident_age = Number(value(formData, "resident_age")) || null;
  const insertedLeads = await supabaseFetch<{ id: string }[]>(
    "leads",
    {
      method: "POST",
      body: JSON.stringify({
        status: "新規相談",
        source: value(formData, "utm_source") || "WEB",
        consultant_name,
        consultant_kana: value(formData, "consultant_kana"),
        consultant_phone,
        consultant_email: value(formData, "consultant_email"),
        relationship: value(formData, "relationship"),
        consultant_area: value(formData, "consultant_area"),
        resident_name: value(formData, "resident_name"),
        resident_age,
        resident_gender: value(formData, "resident_gender"),
        current_address: value(formData, "current_address"),
        care_level: value(formData, "care_level"),
        dementia_status: value(formData, "dementia_status"),
        welfare_status: value(formData, "welfare_status"),
        medical_needs: value(formData, "medical_needs"),
        mental_illness: value(formData, "mental_illness"),
        guarantor_status: value(formData, "guarantor_status"),
        desired_move_in_date: value(formData, "desired_move_in_date"),
        budget: value(formData, "budget"),
        desired_area:
          value(formData, "desired_area") || value(formData, "consultant_area"),
        note: value(formData, "note"),
        lp_name: value(formData, "lp_name"),
        utm_source: value(formData, "utm_source"),
        utm_medium: value(formData, "utm_medium"),
        utm_campaign: value(formData, "utm_campaign"),
        utm_term: value(formData, "utm_term"),
        utm_content: value(formData, "utm_content"),
        gclid: value(formData, "gclid"),
      }),
    },
    true,
  );

  await supabaseFetch(
    "notifications",
    {
      method: "POST",
      body: JSON.stringify({
        notification_type: "new_inquiry",
        title: "新規問い合わせが届きました",
        body: `${consultant_name}様 / ${consultant_phone}`,
        lead_id: insertedLeads[0]?.id || null,
        priority: "high",
      }),
    },
    true,
  );

  await supabaseFetch(
    "conversion_events",
    {
      method: "POST",
      body: JSON.stringify({
        event_type: "CV1",
        lead_id: insertedLeads[0]?.id || null,
        label: "inquiry_form_submit",
        page_path: value(formData, "lp_name") || "問い合わせフォーム",
        metadata: {
          lp_name: value(formData, "lp_name"),
          utm_source: value(formData, "utm_source"),
          utm_medium: value(formData, "utm_medium"),
          utm_campaign: value(formData, "utm_campaign"),
          gclid: value(formData, "gclid"),
        },
      }),
    },
    true,
  );
  redirect("/thanks");
}
