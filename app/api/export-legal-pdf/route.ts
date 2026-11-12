import { NextResponse } from "next/server";
import { generateSimplePdf } from "@/lib/simple-pdf";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawDocument: string = body.document || "Legal Document";

    // Clean any HTML tags for clean plain text PDF rendering
    const plainText = rawDocument
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<\/h[1-6]>/gi, "\n\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<li[^>]*>/gi, "• ")
      .replace(/<br\s*[\/]?>/gi, "\n")
      .replace(/<[^>]+>/gi, "")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .trim();

    const pdfBuffer = generateSimplePdf("Legal Document", [
      { body: plainText }
    ]);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="legal_document_${Date.now()}.pdf"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to generate legal PDF" },
      { status: 500 }
    );
  }
}
