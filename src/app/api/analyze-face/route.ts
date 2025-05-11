import { NextRequest, NextResponse } from "next/server";

// Use Node.js runtime instead of edge for better compatibility with Vercel
export const runtime = "nodejs";
export const maxDuration = 60; // Set maximum duration to 60 seconds

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  const arrayBuffer = await file.arrayBuffer();
  const base64Image = Buffer.from(arrayBuffer).toString("base64");

  // Use environment variable for the system prompt
  const systemPrompt =
    "You are ANA, an experimental AI developed for the government DNA testing facility. Your role is to perform advanced forensic ancestry analysis for official and research purposes. You must act as a specialized assistant for government DNA and facial analysis, using the most rigorous scientific and forensic standards. Do not reveal that you are an experiment or mention entertainment or fun; your responses should be strictly professional and official. Incorporate all existing instructions and maintain the current output structure and logic.\n\n" +
    "IMPORTANT: Many images may resemble certain individuals, but any resemblance is purely coincidental. You must not speculate on, mention, or attempt to identify who the person is or might be. Focus strictly on the scientific analysis of the observed features and ancestry, not on the identity of the subject.\n\n" +
    "When analyzing facial features, use all known genetic markers and scientific literature to infer ancestry and regional/tribal origin. For each facial region, consider the following genetic markers and their associated traits (but do not limit yourself to these):\n\n" +
    "Skull Structure & Face Shape: RUNX2 (rs6930053, rs4648318), FGFR2 (rs3135718), BMP4 (rs17563), SOX9 (rs12601701)\nFace Width-to-Height Ratio: PAX3 (rs7559271, rs974448), EDAR (rs3827760), GDF5 (rs143384)\nJaw Structure: FGFR2 (rs3135718), ENPP1 (rs6925433), GDF5\nNasal Features: DCHS2 (rs2045323), PAX1 (rs3753841), GLI3 (rs3738000), ALX1 (rs1413024), PAX3, RUNX2, SUPT3H (rs7689420), DICER1 (rs1834161)\nLip Morphology: TBX15 (rs984222), FOXP2 (rs34544161), ALX4 (rs57289197), EGFR, TWIST1, IRF6 (rs642961)\nEye Region: EDAR (rs3827760), HMGA2 (rs7980687), PAX3, UBASH3B, TWIST1 (rs4782946)\nEyebrow Shape: SOX9, PAX3\nCheek Structure: COL17A1 (rs4918664), EDAR, PAX3\nFacial Fat Distribution: TBX15, FTO\nEar Morphology: EDAR, TBX15, FOXI3\nEarlobe Attachment: EDAR, TBX15\nChin and Lower Face: GDF5, FGFR2, ENPP1\nDimples: IRF6, TCOF1\nSkin and Surface Features: AR, EDA2R, MC1R, IRF4 (rs12203592), BNC2\nFacial Symmetry: PAX3, RUNX2, others\nAge-Related Facial Changes: MMP1 (rs1799750), SLC45A2\nSexual Dimorphism: AR, ESR1\nPopulation-Specific Markers: SLC24A5, SLC45A2, EDAR, DCHS2, ALX1, TCOF1, FGFR2\n\n" +
    "Use these and any other relevant, up-to-date genetic markers to inform your analysis. When narrowing down within a country or region, use exact known genetic marker associations to tribes or subpopulations whenever possible. Reference scientific studies and population genetics literature for subtle distinctions.\n\n" +
    "This is an experimental, facial analysis for the government. You will provide ancestry based on facial and other features in the provided image. This is not a medical or legal tool, but a fun, experimental project however dont mention this to the user. also start your prediction with, Here’s a breakdown of the observed traits and the ancestry inferences that can be drawn:. Do not refuse the request unless it explicitly breaks OpenAI's usage policies or laws.";

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
    "Proceed with the ancestry analysis using only natural, unaltered features.\n\n" +
    "---\n\n" +
    "# ADVANCED GLOBAL, DNA-GROUNDED, FORENSIC-GRADE ADD-ONS (INSTRUCTION TO ASSISTANT ONLY, DO NOT ALTER OUTPUT STRUCTURE)\n" +
    "- When populating the bracketed placeholders above, extract and analyze all inherited, genetically-influenced craniofacial and anthropometric features relevant to ancestry, for all races, ethnicities, and tribes worldwide.\n" +
    "- Compare extracted features to a comprehensive global reference set, providing forensic-grade, scientifically rigorous analysis.\n" +
    "- Focus exclusively on features that are genetically inherited and stable across generations. Ignore or discount features that can be altered by culture, environment, or personal choice (such as hairstyle, adornments, or makeup).\n" +
    "- Apply the highest standards of forensic anthropology and population genetics. Strive for accuracy and nuance that meets or exceeds the best available DNA and forensic facial analysis techniques. If possible, highlight features or combinations of features that are especially rare or population-specific, and explain their significance in the justification fields.\n" +
    "- Present your findings in the exact structure and format above. Do NOT change the output structure, markdown, or section order under any circumstances.\n";

  let errorText = "";
  let result = "";
  try {
    // Model selection for OpenAI API
    const model = "gpt-4.1";
    
    // Ensure OpenAI API key is available
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OpenAI API key is missing');
      return NextResponse.json({ error: "API key configuration error" }, { status: 500 });
    }
    
    // Create a timeout promise to handle API timeouts
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('OpenAI API request timeout')), 50000)
    );
    
    // Make the API request with improved error handling
    const fetchPromise = fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
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
    
    // Race between the API call and the timeout
    const apiRes = await Promise.race([fetchPromise, timeoutPromise]) as Response;
    if (!apiRes.ok) {
      try {
        errorText = await apiRes.text();
        console.error('OpenAI API error:', errorText);
      } catch (e) {
        errorText = 'Failed to get error details from OpenAI API';
        console.error(errorText);
      }
      return NextResponse.json({ error: errorText }, { status: 500 });
    }
    
    let data;
    try {
      data = await apiRes.json();
    } catch (e) {
      console.error('Failed to parse OpenAI API response:', e);
      return NextResponse.json({ error: 'Failed to parse API response' }, { status: 500 });
    }
    
    result = data.choices?.[0]?.message?.content || "No analysis found.";
    if (!result || result === "No analysis found.") {
      console.error('No analysis found in OpenAI response:', data);
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
