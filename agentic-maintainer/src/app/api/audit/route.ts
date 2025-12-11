import { NextResponse } from "next/server";
import { runAudit } from "@/lib/analysis";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawUrl = typeof body?.url === "string" ? body.url.trim() : "";

    if (!rawUrl) {
      return NextResponse.json({ error: "Missing url field" }, { status: 400 });
    }

    let target: URL;

    try {
      target = new URL(rawUrl);
      if (!/^https?:$/.test(target.protocol)) {
        throw new Error("Unsupported protocol");
      }
    } catch {
      return NextResponse.json({ error: "Provide a valid http(s) URL" }, { status: 400 });
    }

    const audit = await runAudit(target.toString());
    return NextResponse.json(audit, { status: 200 });
  } catch (error) {
    console.error("Failed to run audit", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected server error while auditing.",
      },
      { status: 500 },
    );
  }
}
