"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { upvotes, issues } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";

export async function toggleUpvote(issueId: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const userId = session.user.id;

  // check if already upvoted
  const existing = await db
    .select()
    .from(upvotes)
    .where(and(eq(upvotes.userId, userId), eq(upvotes.issueId, issueId)))
    .limit(1);

  if (existing.length > 0) {
    // remove upvote
    await db
      .delete(upvotes)
      .where(and(eq(upvotes.userId, userId), eq(upvotes.issueId, issueId)));

    await db
      .update(issues)
      .set({ upvoteCount: sql`upvote_count - 1` })
      .where(eq(issues.id, issueId));

    return { upvoted: false };
  } else {
    // add upvote
    await db.insert(upvotes).values({ userId, issueId });

    await db
      .update(issues)
      .set({ upvoteCount: sql`upvote_count + 1` })
      .where(eq(issues.id, issueId));

    return { upvoted: true };
  }
}