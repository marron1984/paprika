export const siteName = "DCかいご相談ダイヤル";
export const phoneNumber =
  process.env.NEXT_PUBLIC_CONTACT_PHONE || "06-0000-0000";
export const lineUrl =
  process.env.NEXT_PUBLIC_LINE_URL || "https://line.me/R/ti/p/@example";
export const leadStatuses = [
  "新規相談",
  "初回連絡待ち",
  "ヒアリング中",
  "施設提案中",
  "見学調整中",
  "見学予約済",
  "見学済",
  "申込検討中",
  "申込済",
  "契約準備中",
  "入居予定",
  "入居完了",
  "失注",
  "保留",
] as const;
export const roomStatuses = [
  "入居中",
  "予約中",
  "空室",
  "清掃中",
  "修繕中",
  "申込中",
] as const;
export const careLevels = [
  "未申請",
  "自立",
  "要支援1",
  "要支援2",
  "要介護1",
  "要介護2",
  "要介護3",
  "要介護4",
  "要介護5",
];
