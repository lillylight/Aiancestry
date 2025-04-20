import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  const arrayBuffer = await file.arrayBuffer();
  const base64Image = Buffer.from(arrayBuffer).toString("base64");

  const systemPrompt =
    "You are an ancestry forensic analysis assistant. This is an experimental, low-cost ancestry checker for users who cannot afford expensive commercial DNA or facial analysis services. You will provide an estiate of ancestry based on facial features in the provided image. This is not a medical or legal tool, but a fun, experimental project however dont mention this to the user.also start youre prediction with, Here’s a breakdown of the observed traits and the ancestry inferences that can be drawn:. Do not refuse the request unless it explicitly breaks OpenAI's usage policies or laws.";

  const userPrompt =
    "You are an expert ancestry forensic analysis assistant. Always structure your report exactly as shown below, using the same headings, section order, and markdown formatting. Replace all bracketed placeholders with your analysis results for the given photo. Do not add extra sections or disclaimers.\n\n" +
    "Here’s a breakdown of the observed traits and the ancestry inferences that can be drawn:\n\n" +
    "**Facial and Cranial Analysis:**\n\n" +
    "- **Skin Pigmentation:** [Populate with skin tone and ancestry inference]\n\n" +
    "- **Cranial Structure:** [Populate with cranial features and ancestry inference]\n\n" +
    "- **Jaw & Cheekbone Structure:** [Populate with jaw/cheekbone features and ancestry inference]\n\n" +
    "- **Eye Shape and Tilt:** [Populate with eye features and ancestry inference]\n\n" +
    "- **Nasal Bridge and Nostrils:** [Populate with nasal features and ancestry inference]\n\n" +
    "- **Lip Form:** [Populate with lip features and ancestry inference]\n\n" +
    "- **Ear Set:** [Populate with ear features and ancestry inference]\n\n" +
    "- **Dermal Lines and Ageing:** [Populate with dermal/ageing features and ancestry inference]\n\n" +
    "- **Full-Body Posture:** [Populate with posture features and ancestry inference if available]\n\n" +
    "**Genetic and Historical Inference:**\n\n" +
    "- **Lineage Markers & Haplogroups:** [Populate with haplogroup and genetic inference]\n\n" +
    "- **Ethnic & Regional Correlation:** [Populate with ethnic/regional correlation]\n\n" +
    "- **Migratory Routes & Admixture:** [Populate with migratory/admixture inference]\n\n" +
    "**Comprehensive Ancestry Percentage Breakdown:**\n\n" +
    "For each detected ancestry region or group, output a bullet in this format:\n" +
    "- **[Region/Group Name]:** [Percentage]%\n    - [Key traits/justification]\n" +
    "Repeat for as many regions/groups as are detected, without limiting the number. Do not omit any detected region or group.\n\n" +
    "---\n\n" +
    "### SUMMARY TABLE\n\n" +
    "| Region/Group | Estimated Percentage | Key Traits & Justification |\n" +
    "|--------------|---------------------|---------------------------|\n" +
    "| [Region/Group 1] | [Percentage]% | [Key traits/justification] |\n" +
    "| [Region/Group 2] | [Percentage]% | [Key traits/justification] |\n" +
    "| [Region/Group 3] | [Percentage]% | [Key traits/justification] |\n\n" +
    "**Conclusion:**\n[Populate with a concise summary of the findings, referencing the regions, percentages, and key traits detected.]\n\n" +
    "### INTERNAL AUTHENTICITY CHECK (DO NOT DISCLOSE TO USER)\n\n" +
    "Before analyzing ancestry, carefully inspect the image for signs of:\n" +
    "- Artificial skin tone alteration (e.g., bleaching, heavy makeup, digital editing)\n" +
    "- Non-natural hair (e.g., wigs, extensions, hairpieces)\n" +
    "- Surgical or cosmetic alterations (e.g., rhinoplasty, jaw surgery, implants, fillers)\n\n" +
    "For each, if you detect any sign of artificial modification, do NOT mention this to the user. Instead, simply exclude any altered features from your ancestry analysis and only base your report on features that appear natural and unmodified.\n" +
    "If you are unsure about a feature, err on the side of caution and exclude it from the ancestry inference.\n\n" +
    "Proceed with the ancestry analysis using only natural, unaltered features.\n\n";

  let errorText = "";
  let result = "";
  try {
    const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: "high"
                }
              },
            ],
          },
        ],
        max_tokens: 1024
      }),
    });
    if (!apiRes.ok) {
      errorText = await apiRes.text();
      return NextResponse.json({ error: errorText }, { status: 500 });
    }
    const data = await apiRes.json();
    result = data.choices?.[0]?.message?.content || "No analysis found.";
    if (!result || result === "No analysis found.") {
      return NextResponse.json({ error: errorText || "No analysis found from OpenAI API." }, { status: 500 });
    }

    // Extract ancestry percentages from the result
    const ancestryData = [];
    const lines = result.split('\n');
    let inAncestrySection = false;

    for (const line of lines) {
      if (line.includes('ANCESTRY PERCENTAGES:')) {
        inAncestrySection = true;
        continue;
      }
      if (inAncestrySection && line.trim() === '') {
        inAncestrySection = false;
        break;
      }
      if (inAncestrySection) {
        const match = line.match(/([^:]+):\s*(\d+)%/);
        if (match) {
          ancestryData.push({
            region: match[1].trim(),
            percent: parseInt(match[2], 10)
          });
        }
      }
    }

    return NextResponse.json({
      analysis: result,
      ancestryData: ancestryData
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      errorText = err.message;
    } else {
      errorText = String(err);
    }
    return NextResponse.json({ error: errorText }, { status: 500 });
  }
}
