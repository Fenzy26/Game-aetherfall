import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { gameEndings } from "@/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

const VALID_ENDINGS = new Set(["true", "good", "normal", "bad", "secret"]);

// GET: returns aggregate counts for every ending, used to render the global
// "Ending Codex" board on the ending screen.
export async function GET() {
  try {
    const rows = await db
      .select({
        endingKey: gameEndings.endingKey,
        count: sql<number>`count(*)::int`,
      })
      .from(gameEndings)
      .groupBy(gameEndings.endingKey);

    const counts: Record<string, number> = { true: 0, good: 0, normal: 0, bad: 0, secret: 0 };
    for (const row of rows) {
      if (VALID_ENDINGS.has(row.endingKey)) {
        counts[row.endingKey] = row.count;
      }
    }
    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    return NextResponse.json({ counts, total });
  } catch (error) {
    console.error("GET /api/endings failed", error);
    return NextResponse.json({ counts: { true: 0, good: 0, normal: 0, bad: 0, secret: 0 }, total: 0 });
  }
}

// POST: records a finished playthrough's ending so the codex can grow.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const endingKey = typeof body?.endingKey === "string" ? body.endingKey : "";
    if (!VALID_ENDINGS.has(endingKey)) {
      return NextResponse.json({ error: "invalid ending" }, { status: 400 });
    }

    const playerName =
      typeof body?.playerName === "string" && body.playerName.trim().length > 0
        ? body.playerName.trim().slice(0, 40)
        : null;
    const finalHp = Number.isFinite(body?.finalHp) ? Math.round(body.finalHp) : 0;
    const finalMp = Number.isFinite(body?.finalMp) ? Math.round(body.finalMp) : 0;
    const finalKarma = Number.isFinite(body?.finalKarma) ? Math.round(body.finalKarma) : 0;
    const fragments = Number.isFinite(body?.fragments) ? Math.round(body.fragments) : 0;

    await db.insert(gameEndings).values({
      endingKey,
      playerName,
      finalHp,
      finalMp,
      finalKarma,
      fragments,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/endings failed", error);
    return NextResponse.json({ error: "failed to save ending" }, { status: 500 });
  }
}
