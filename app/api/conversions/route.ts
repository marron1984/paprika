import { NextResponse } from "next/server";
import { supabaseFetch } from "@/lib/supabase-rest";

const publicConversionTypes = new Set(["CV2", "CV3"]);

function trimText(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim().slice(0, 300) : fallback;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const eventType = trimText(body?.eventType);

  if (!publicConversionTypes.has(eventType)) {
    return NextResponse.json(
      { message: "Invalid conversion type" },
      { status: 400 },
    );
  }

  await supabaseFetch(
    "conversion_events",
    {
      method: "POST",
      body: JSON.stringify({
        event_type: eventType,
        label: trimText(body?.label, eventType),
        page_path: trimText(body?.path, "/"),
        referrer: trimText(request.headers.get("referer")),
        user_agent: trimText(request.headers.get("user-agent")),
        metadata:
          body?.metadata && typeof body.metadata === "object"
            ? body.metadata
            : {},
      }),
    },
    true,
  );

  return NextResponse.json({ ok: true });
}
