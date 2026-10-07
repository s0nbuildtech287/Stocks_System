import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";
import util from "util";

export const dynamic = "force-dynamic";

const execPromise = util.promisify(exec);

// In-memory cache for peer comparisons
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION_MS = 60 * 1000;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tickers = (searchParams.get("tickers") || "HPG,NKG,HSG").toUpperCase().trim();
  const now = Date.now();

  const cached = cache.get(tickers);
  if (cached && now - cached.timestamp < CACHE_DURATION_MS) {
    return NextResponse.json({ source: "cache", data: cached.data });
  }

  const rootDir = path.resolve(process.cwd(), "..");

  try {
    const scriptPath = path.resolve(rootDir, "calc_peer_comparison.py");
    const { stdout } = await execPromise(`python "${scriptPath}" --tickers "${tickers}"`, {
      cwd: rootDir,
      timeout: 15000,
      encoding: "utf8",
    });

    const data = JSON.parse(stdout.trim());
    cache.set(tickers, { data, timestamp: now });

    return NextResponse.json({ source: "live", data });
  } catch (error: any) {
    console.error("Error running calc_peer_comparison.py:", error);
    if (cached) {
      return NextResponse.json({ source: "stale-cache", data: cached.data });
    }
    return NextResponse.json(
      { error: error.message || "Failed to compute peer comparison" },
      { status: 500 }
    );
  }
}
