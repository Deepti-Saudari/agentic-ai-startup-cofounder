import { NextResponse } from "next/server";
import { generateSimplePdf, PdfSection } from "@/lib/simple-pdf";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const leanCanvas = body.lean_canvas || {};
    const swot = body.swot || {};
    const executiveSummary = body.executive_summary || "Executive summary for the venture.";

    const sections: PdfSection[] = [
      {
        title: "Executive Summary",
        body: typeof executiveSummary === "string" ? executiveSummary : JSON.stringify(executiveSummary, null, 2)
      },
      {
        title: "Lean Canvas Overview",
        body: Object.entries(leanCanvas)
          .map(([key, val]) => `${key.replace(/_/g, " ").toUpperCase()}:\n${typeof val === "string" ? val : JSON.stringify(val)}`)
          .join("\n\n")
      },
      {
        title: "SWOT Analysis",
        body: Object.entries(swot)
          .map(([key, val]) => {
            const items = Array.isArray(val) ? val.join(", ") : String(val);
            return `${key.toUpperCase()}:\n${items}`;
          })
          .join("\n\n")
      }
    ];

    const pdfBuffer = generateSimplePdf("Comprehensive Business Plan", sections);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="business_plan.pdf"',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to export business plan" },
      { status: 500 }
    );
  }
}
