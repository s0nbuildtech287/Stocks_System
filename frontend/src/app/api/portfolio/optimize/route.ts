import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";
import util from "util";

export const dynamic = "force-dynamic";

const execPromise = util.promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const tickers = (body.tickers || ["FPT", "HPG", "TCB", "VNM", "MWG"]).join(",");
    const capital = Number(body.capital) || 500_000_000;
    const rf = Number(body.rf) || 2.85;

    const rootDir = path.resolve(process.cwd(), "..");
    const scriptPath = path.resolve(rootDir, "calc_portfolio_optimizer.py");

    const { stdout } = await execPromise(
      `python "${scriptPath}" --tickers "${tickers}" --capital ${capital} --rf ${rf}`,
      {
        cwd: rootDir,
        timeout: 15000,
        encoding: "utf8",
      }
    );

    const data = JSON.parse(stdout.trim());
    return NextResponse.json({ source: "live", data });
  } catch (error: any) {
    console.error("Error running calc_portfolio_optimizer.py:", error);
    return NextResponse.json(
      { error: error.message || "Failed to calculate portfolio optimization" },
      { status: 500 }
    );
  }
}
