import { db } from "@/lib/db";
import { issues, users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export async function getAllIssues() {
  return db
    .select({
      id: issues.id,
      title: issues.title,
      description: issues.description,
      category: issues.category,
      status: issues.status,
      lat: issues.lat,
      lng: issues.lng,
      address: issues.address,
      imageUrl: issues.imageUrl,
      upvoteCount: issues.upvoteCount,
      createdAt: issues.createdAt,
      userId: issues.userId,
      userName: users.name,
      userImage: users.image,
    })
    .from(issues)
    .leftJoin(users, eq(issues.userId, users.id))
    .orderBy(desc(issues.createdAt));
}

export type IssueWithUser = Awaited<ReturnType<typeof getAllIssues>>[number];