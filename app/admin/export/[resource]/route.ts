import { NextResponse } from "next/server";
import { requireSession, supabaseFetch } from "@/lib/supabase-rest";

type CsvColumn = {
  key: string;
  label: string;
};

type ExportConfig = {
  path: string;
  filename: string;
  columns: CsvColumn[];
};

const exportConfigs: Record<string, ExportConfig> = {
  leads: {
    path: "leads?select=*&order=created_at.desc",
    filename: "leads.csv",
    columns: [
      { key: "created_at", label: "登録日" },
      { key: "status", label: "ステータス" },
      { key: "consultant_name", label: "相談者氏名" },
      { key: "consultant_phone", label: "電話番号" },
      { key: "consultant_email", label: "メール" },
      { key: "relationship", label: "続柄" },
      { key: "resident_name", label: "入居予定者" },
      { key: "resident_age", label: "年齢" },
      { key: "care_level", label: "要介護度" },
      { key: "dementia_status", label: "認知症" },
      { key: "welfare_status", label: "生活保護" },
      { key: "desired_area", label: "希望地域" },
      { key: "budget", label: "月額予算" },
      { key: "utm_source", label: "UTM source" },
      { key: "utm_campaign", label: "UTM campaign" },
      { key: "gclid", label: "GCLID" },
      { key: "loss_reason", label: "失注理由" },
      { key: "reapproach_date", label: "再アプローチ日" },
    ],
  },
  facilities: {
    path: "facilities?select=*&order=name.asc",
    filename: "facilities.csv",
    columns: [
      { key: "name", label: "施設名" },
      { key: "address", label: "所在地" },
      { key: "area", label: "エリア" },
      { key: "nearest_station", label: "最寄駅" },
      { key: "type", label: "施設種別" },
      { key: "capacity", label: "定員" },
      { key: "vacancy_count", label: "空室数" },
      { key: "monthly_fee", label: "月額費用" },
      { key: "initial_fee", label: "初期費用" },
      { key: "accepts_dementia", label: "認知症対応" },
      { key: "accepts_welfare", label: "生活保護対応" },
      { key: "medical_support", label: "医療対応" },
    ],
  },
  rooms: {
    path: "rooms?select=*,facilities(name)&order=updated_at.desc",
    filename: "rooms.csv",
    columns: [
      { key: "facilities.name", label: "施設名" },
      { key: "room_number", label: "部屋番号" },
      { key: "floor", label: "階数" },
      { key: "rent", label: "家賃" },
      { key: "common_fee", label: "共益費" },
      { key: "meal_fee", label: "食費" },
      { key: "management_fee", label: "管理費" },
      { key: "status", label: "空室状況" },
      { key: "updated_at", label: "更新日" },
    ],
  },
  tours: {
    path: "tours?select=*,leads(consultant_name,resident_name),facilities(name)&order=scheduled_at.desc",
    filename: "tours.csv",
    columns: [
      { key: "scheduled_at", label: "見学日時" },
      { key: "leads.consultant_name", label: "相談者" },
      { key: "leads.resident_name", label: "入居予定者" },
      { key: "facilities.name", label: "施設名" },
      { key: "participants", label: "参加者" },
      { key: "meeting_place", label: "集合場所" },
      { key: "result", label: "見学結果" },
      { key: "next_action", label: "次回アクション" },
    ],
  },
  ads: {
    path: "ad_reports?select=*&order=date.desc,campaign_name.asc",
    filename: "ad_reports.csv",
    columns: [
      { key: "date", label: "日付" },
      { key: "campaign_name", label: "キャンペーン名" },
      { key: "ad_group_name", label: "広告グループ名" },
      { key: "keyword", label: "キーワード" },
      { key: "cost", label: "広告費" },
      { key: "impressions", label: "表示回数" },
      { key: "clicks", label: "クリック数" },
      { key: "conversions", label: "問い合わせ数" },
      { key: "tours", label: "見学数" },
      { key: "move_ins", label: "入居数" },
      { key: "cpa", label: "CPA" },
      { key: "move_in_unit_cost", label: "入居単価" },
    ],
  },

  conversions: {
    path: "conversion_events?select=*,leads(consultant_name,resident_name)&order=created_at.desc",
    filename: "conversion_events.csv",
    columns: [
      { key: "created_at", label: "発生日時" },
      { key: "event_type", label: "CV種別" },
      { key: "label", label: "ラベル" },
      { key: "page_path", label: "ページ" },
      { key: "leads.consultant_name", label: "相談者" },
      { key: "leads.resident_name", label: "入居予定者" },
      { key: "referrer", label: "リファラー" },
      { key: "user_agent", label: "User Agent" },
    ],
  },
  referrers: {
    path: "referrers?select=*&order=name.asc",
    filename: "referrers.csv",
    columns: [
      { key: "type", label: "紹介元種別" },
      { key: "name", label: "紹介元名" },
      { key: "contact_person", label: "担当者名" },
      { key: "phone", label: "電話番号" },
      { key: "email", label: "メール" },
      { key: "address", label: "所在地" },
      { key: "referral_count", label: "紹介件数" },
      { key: "tour_count", label: "見学件数" },
      { key: "contract_count", label: "成約件数" },
      { key: "last_contact_date", label: "最終接触日" },
    ],
  },
};

function getValue(row: Record<string, unknown>, path: string) {
  return path.split(".").reduce<unknown>((value, key) => {
    if (value && typeof value === "object") {
      return (value as Record<string, unknown>)[key];
    }
    return undefined;
  }, row);
}

function escapeCsv(value: unknown) {
  if (value === null || value === undefined) return "";
  const text = String(value).replaceAll('"', '""');
  return /[",\n\r]/.test(text) ? `"${text}"` : text;
}

function toCsv(rows: Record<string, unknown>[], columns: CsvColumn[]) {
  const header = columns.map((column) => escapeCsv(column.label)).join(",");
  const body = rows.map((row) =>
    columns.map((column) => escapeCsv(getValue(row, column.key))).join(","),
  );
  return `\uFEFF${[header, ...body].join("\n")}`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ resource: string }> },
) {
  if (!(await requireSession())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { resource } = await params;
  const config = exportConfigs[resource];
  if (!config) {
    return NextResponse.json(
      { message: "Unknown export resource" },
      { status: 404 },
    );
  }

  const rows = await supabaseFetch<Record<string, unknown>[]>(
    config.path,
    {},
    true,
  );
  return new NextResponse(toCsv(rows, config.columns), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${config.filename}"`,
    },
  });
}
