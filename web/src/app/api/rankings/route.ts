import { NextResponse } from "next/server";
import initialData from "@/data/marketData.json";

export async function GET() {
  return NextResponse.json(initialData);
}
