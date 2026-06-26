import { NextResponse } from "next/server";
import { getAllIssues } from "@/lib/issues";

export async function GET() {
  try {
    const issues = await getAllIssues();
    return NextResponse.json(issues);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch issues" },
      { status: 500 }
    );
  }
}