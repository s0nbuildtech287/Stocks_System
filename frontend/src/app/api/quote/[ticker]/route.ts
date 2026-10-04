import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";
import util from "util";

export const dynamic = "force-dynamic";

const execPromise = util.promisify(exec);

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  const ticker = (params.ticker || "FPT").toUpperCase();

  try {
    const scriptPath = path.resolve(process.cwd(), "..", "fetch_live_stock.py");
    const { stdout } = await execPromise(`python "${scriptPath}" ${ticker}`, {
      timeout: 12000,
    });

    const data = JSON.parse(stdout.trim());
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch stock quote" },
      { status: 500 }
    );
  }
}
