"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { issues } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type Status = "open" | "in_progress" | "resolved";

export async function updateIssueStatus(issueId: string, newStatus: Status) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Find the issue to ensure the user is the owner
  const issue = await db.query.issues.findFirst({
    where: eq(issues.id, issueId),
  });

  if (!issue) {
    throw new Error("Issue not found");
  }

  if (issue.userId !== session.user.id) {
    throw new Error("Forbidden: You can only update the status of issues you reported.");
  }

  await db
    .update(issues)
    .set({
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(eq(issues.id, issueId));

  // Revalidate relevant pages
  revalidatePath("/");
  revalidatePath("/feed");
  revalidatePath("/map");
  revalidatePath("/profile");

  return { success: true };
}

export async function deleteIssue(issueId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const issue = await db.query.issues.findFirst({
    where: eq(issues.id, issueId),
  });

  if (!issue) {
    throw new Error("Issue not found");
  }

  if (issue.userId !== session.user.id) {
    throw new Error("Forbidden: You can only delete issues you reported.");
  }

  await db.delete(issues).where(eq(issues.id, issueId));

  revalidatePath("/");
  revalidatePath("/feed");
  revalidatePath("/map");
  revalidatePath("/profile");

  return { success: true };
}
