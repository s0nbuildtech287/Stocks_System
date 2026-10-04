import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";
import util from "util";

export const dynamic = "force-dynamic";

const execPromise = util.promisify(exec);

// In-memory cache for 60 seconds
let cachedData: any = null;
let lastFetchTime: number = 0;
const CACHE_DURATION_MS = 60 * 1000;

export async function GET(request: NextRequest) {
  const now = Date.now();
  if (cachedData && now - lastFetchTime < CACHE_DURATION_MS) {
    return NextResponse.json({ source: "cache", data: cachedData });
  }

  try {
    const scriptPath = path.resolve(process.cwd(), "..", "fetch_live_quotes.py");
    const { stdout } = await execPromise(`python "${scriptPath}"`, {
      timeout: 15000,
    });

    const data = JSON.parse(stdout.trim());
    cachedData = data;
    lastFetchTime = now;

    return NextResponse.json({ source: "live", data });
  } catch (error: any) {
    if (cachedData) {
      return NextResponse.json({ source: "stale-cache", data: cachedData });
    }
    return NextResponse.json(
      { error: error.message || "Failed to fetch live quotes" },
      { status: 500 }
    );
  }
}
