import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { upvotes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json([]);

  const rows = await db
    .select({ issueId: upvotes.issueId })
    .from(upvotes)
    .where(eq(upvotes.userId, session.user.id));

  return NextResponse.json(rows.map((r) => r.issueId));
}