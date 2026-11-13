import { NextResponse } from "next/server";
import { chatCompletion } from "@/lib/groq";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const userApiKey = req.headers.get("x-groq-api-key") || undefined
    const body = await req.json().catch(() => ({}));
    const templateName = body.template_name || body.template || "Founders Agreement";
    const startupName = body.startup_name || body.formData?.startup_name || "Venture Inc.";
    const formData = body.form_data || body.formData || {};

    const prompt = `You are a professional startup legal assistant.
Generate a complete legal document.

Startup Name: ${startupName}
Document Type: ${templateName}

User Provided Information:
${JSON.stringify({ startup_name: startupName, ...formData }, null, 2)}

Instructions:
- Use formal legal language
- Mention the startup name wherever appropriate
- Structure the document with numbered sections
- Include sections such as:
  1. Definitions
  2. Purpose & Scope
  3. Rights and Obligations
  4. Confidentiality & Non-Disclosure
  5. Intellectual Property Assignment
  6. Term and Termination
  7. Governing Law and Dispute Resolution
  8. Signatures Block
- Replace placeholders using the provided values
- Output clean, professional HTML
- Use headings (<h1>, <h2>)
- Use paragraphs (<p>)
- Use numbered sections (<ol>, <li>)
- Do NOT wrap in markdown code fences (\`\`\`html). Return the raw HTML markup directly.`;

    const raw = await chatCompletion([
      { role: "system", content: "You are an expert corporate legal counsel drafting binding startup agreements in clean HTML." },
      { role: "user", content: prompt },
    ], { apiKey: userApiKey, max_tokens: 3500 });

    let documentHtml = raw.replace(/^```html\s*/i, "").replace(/^```\s*/, "").replace(/```$/, "").trim();

    if (!documentHtml) {
      documentHtml = `
<h1>${templateName.toUpperCase()}</h1>
<p><strong>Effective Date:</strong> ${new Date().toLocaleDateString()}</p>
<p>This Agreement is entered into by and between <strong>${startupName}</strong> and the undersigned parties.</p>

<h2>1. PURPOSE</h2>
<p>The parties enter into this Agreement to define the operational, legal, and intellectual property ownership framework for <strong>${startupName}</strong>.</p>

<h2>2. INTELLECTUAL PROPERTY ASSIGNMENT</h2>
<p>All work, inventions, software code, designs, and materials created on behalf of ${startupName} are the sole and exclusive property of the company.</p>

<h2>3. CONFIDENTIALITY</h2>
<p>The parties agree to hold all proprietary trade secrets, user data, and roadmaps in strict confidence and shall not disclose such information to third parties without prior written consent.</p>

<h2>4. GOVERNING LAW</h2>
<p>This Agreement shall be governed by and construed in accordance with the laws of the applicable startup jurisdiction.</p>

<h2>5. SIGNATURES</h2>
<p>IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the date first above written.</p>
<p><strong>For: ${startupName}</strong><br/>Signature: __________________________<br/>Date: __________________________</p>
      `.trim();
    }

    return NextResponse.json({ document: documentHtml });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to generate legal document" },
      { status: 500 }
    );
  }
}
