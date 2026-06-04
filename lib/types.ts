export type Lead = {
  id: string;
  status: string;
  source?: string;
  assigned_user_id?: string;
  consultant_name: string;
  consultant_kana?: string;
  consultant_phone: string;
  consultant_email?: string;
  relationship?: string;
  consultant_area?: string;
  resident_name?: string;
  resident_age?: number;
  resident_gender?: string;
  current_address?: string;
  care_level?: string;
  dementia_status?: string;
  welfare_status?: string;
  medical_needs?: string;
  mental_illness?: string;
  guarantor_status?: string;
  budget?: string;
  desired_area?: string;
  desired_move_in_date?: string;
  note?: string;
  lp_name?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  loss_reason?: string;
  reapproach_date?: string;
  created_at: string;
  updated_at?: string;
};
export type Activity = {
  id: string;
  lead_id: string;
  user_id?: string;
  activity_type: string;
  content: string;
  next_action_date?: string;
  created_at: string;
};
export type Facility = {
  id: string;
  name: string;
  address: string;
  area?: string;
  nearest_station?: string;
  type?: string;
  capacity?: number;
  vacancy_count?: number;
  monthly_fee?: number;
  initial_fee?: number;
  acceptable_care_levels?: string;
  accepts_dementia?: boolean;
  accepts_welfare?: boolean;
  medical_support?: string;
  end_of_life_care?: boolean;
  photo_url?: string;
  description?: string;
  management_note?: string;
  created_at?: string;
};
export type Room = {
  id: string;
  facility_id: string;
  room_number: string;
  floor?: string;
  rent?: number;
  common_fee?: number;
  meal_fee?: number;
  management_fee?: number;
  status: string;
  note?: string;
  facilities?: { name: string };
  updated_at?: string;
};
export type Tour = {
  id: string;
  lead_id: string;
  facility_id: string;
  scheduled_at: string;
  participants?: string;
  staff_id?: string;
  meeting_place?: string;
  result?: string;
  impression?: string;
  next_action?: string;
  note?: string;
  leads?: { consultant_name: string; resident_name?: string };
  facilities?: { name: string };
  created_at?: string;
};

export type Referrer = {
  id: string;
  type?: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  referral_count?: number;
  tour_count?: number;
  contract_count?: number;
  expected_sales?: number;
  last_contact_date?: string;
  note?: string;
};

export type AdReport = {
  id: string;
  date: string;
  campaign_name?: string;
  ad_group_name?: string;
  keyword?: string;
  cost?: number;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  tours?: number;
  move_ins?: number;
  cpa?: number;
  move_in_unit_cost?: number;
};

export type LpPage = {
  id: string;
  title: string;
  slug: string;
  target_keyword?: string;
  hero_copy?: string;
  body?: { target?: string; worries?: string; faq?: string };
  status?: string;
  created_at?: string;
  updated_at?: string;
};

export type SiteSettings = {
  siteName: string;
  phoneNumber: string;
  lineUrl: string;
  gtmId?: string;
  googleAdsConversionId?: string;
  googleAdsConversionLabel?: string;
};

export type SiteSettingsRow = {
  key: string;
  value: SiteSettings;
  updated_at?: string;
};

export type ConversionEvent = {
  id: string;
  event_type: "CV1" | "CV2" | "CV3" | "CV4" | "CV5" | string;
  lead_id?: string | null;
  label?: string;
  page_path?: string;
  referrer?: string;
  user_agent?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
};

export type Notification = {
  id: string;
  notification_type: string;
  title: string;
  body?: string;
  lead_id?: string | null;
  tour_id?: string | null;
  due_at?: string | null;
  priority: "low" | "normal" | "high" | string;
  read_at?: string | null;
  created_at: string;
  leads?: { consultant_name: string; resident_name?: string };
};
