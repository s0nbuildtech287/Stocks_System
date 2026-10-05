import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";
import util from "util";

export const dynamic = "force-dynamic";

const execPromise = util.promisify(exec);

// In-memory ticker cache (60 seconds)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION_MS = 60 * 1000;

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  const ticker = (params.ticker || "FPT").toUpperCase().trim();
  const now = Date.now();

  const cached = cache.get(ticker);
  if (cached && now - cached.timestamp < CACHE_DURATION_MS) {
    return NextResponse.json({ source: "cache", data: cached.data });
  }

  const rootDir = path.resolve(process.cwd(), "..");

  try {
    const scriptPath = path.resolve(rootDir, "fetch_stock_deep_dive.py");
    const { stdout } = await execPromise(`python "${scriptPath}" --ticker ${ticker}`, {
      cwd: rootDir,
      timeout: 15000,
      encoding: "utf8",
    });

    const data = JSON.parse(stdout.trim());
    cache.set(ticker, { data, timestamp: now });

    return NextResponse.json({ source: "live", data });
  } catch (error: any) {
    console.error("Error executing fetch_stock_deep_dive.py:", error);
    if (cached) {
      return NextResponse.json({ source: "stale-cache", data: cached.data });
    }
    return NextResponse.json(
      { error: error.message || "Failed to fetch stock insight" },
      { status: 500 }
    );
  }
}
