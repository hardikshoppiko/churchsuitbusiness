import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query("SELECT * FROM `customer` WHERE store_id=15");
    return NextResponse.json({ success: true, rows });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err?.message || "DB error" },
      { status: 500 }
    );
  }
}