
import { GoogleGenAI } from "@google/genai";
import { GameGenerationParams, Advertisement } from "../types";
import { BREAKOUT_CODE, TYPING_CODE, FLAPPY_CODE, SNAKE_CODE } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_PROMPT = `
You are a Senior Game Engine Developer. Your goal is to generate **production-grade, crash-resistant** JavaScript games for HTML5 Canvas.

**CORE ARCHITECTURE (STRICT):**

1.  **Resolution:**
    *   **FIXED 400x600**. Design strictly for these dimensions.
    *   **NEVER** add \`window.addEventListener('resize', ...)\`.
    *   **NEVER** change \`canvas.width\` or \`canvas.height\`. The wrapper handles scaling via CSS.
    *   Assume \`canvas.width\` is 400 and \`canvas.height\` is 600.

2.  **Robustness:**
    *   Wrap \`loop()\` in \`try { ... } catch (e) { ... }\`.
    *   Use \`requestAnimationFrame\`.
    *   **RESTART:** 'Space' or 'Enter' on Game Over resets state.

3.  **ASSETS (MANDATORY):**
    *   I will provide variable names for images (e.g., \`BG_IMG_SRC\`).
    *   You **MUST** create Image objects and use these sources.
    *   \`const bg = new Image(); bg.src = BG_IMG_SRC;\`
    *   Do NOT use colored rectangles if an image source is provided.

4.  **GAME OVER AD:**
    *   If Ad data is provided, draw a banner at the bottom (80px height) ONLY when \`state === GAME_OVER\`.
    *   Draw the Brand Logo image if provided.

**Output:**
Return ONLY raw JavaScript code.
`;

// Helper to inject Ad Logo as Background and Banner into code
function injectAdIntoCode(code: string, ad: Advertisement): string {
    const logoUrl = ad.assets[0]?.url || "";
    if (!logoUrl) return code;

    // 1. Inject Header Constants & Functions
    const injectionHeader = `
/* --- SPONSORED ASSETS --- */
const BRAND_LOGO = new Image();
BRAND_LOGO.src = "${logoUrl}";
const BRAND_NAME = "${ad.brandName}";
const BRAND_SLOGAN = "${ad.slogan}";
const BRAND_COLOR = "${ad.color}";

function drawBrandedBg(ctx) {
    if (BRAND_LOGO.complete && BRAND_LOGO.naturalWidth !== 0) {
        // Draw image covering canvas
        ctx.drawImage(BRAND_LOGO, 0, 0, 400, 600);
        // Draw dark overlay for readability
        ctx.fillStyle = "rgba(0,0,0,0.85)"; 
        ctx.fillRect(0, 0, 400, 600);
    } else {
        // Fallback
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, 400, 600);
    }
}

function drawBrandedBanner(ctx) {
    ctx.save();
    ctx.fillStyle = BRAND_COLOR;
    ctx.shadowBlur = 10;
    ctx.shadowColor = BRAND_COLOR;
    ctx.fillRect(0, 520, 400, 80);
    
    ctx.fillStyle = "white";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.shadowBlur = 0;
    ctx.fillText(BRAND_NAME, 200, 550);
    
    ctx.font = "14px sans-serif";
    ctx.fillText(BRAND_SLOGAN, 200, 575);
    ctx.restore();
}
/* ----------------------- */
`;

    let modifiedCode = injectionHeader + "\n" + code;

    // 2. Replace Background Logic
    // Look for "// CLEAR_CANVAS" marker which I added to constants
    if (modifiedCode.includes('// CLEAR_CANVAS')) {
        modifiedCode = modifiedCode.replace(/\/\/ CLEAR_CANVAS/g, 'drawBrandedBg(ctx);');
    } else {
        // Fallback: Try to replace standard clear rect if marker missing
        modifiedCode = modifiedCode.replace(/ctx\.clearRect\(0,\s*0,\s*400,\s*600\);/g, 'drawBrandedBg(ctx);');
    }

    // 3. Replace Game Over Ad Logic
    // Precompiled codes use `drawAd(ctx)`
    modifiedCode = modifiedCode.replace(/drawAd\(ctx\);/g, 'drawBrandedBanner(ctx);');

    return modifiedCode;
}

export const generateGameCode = async (params: GameGenerationParams): Promise<string> => {
  try {
    // --- FAST PATH: CHECK PRECOMPILED GAMES ---
    const lowerPrompt = params.prompt.toLowerCase();
    let baseCode = "";

    if (lowerPrompt.includes("breakout")) {
        baseCode = BREAKOUT_CODE;
    } else if (lowerPrompt.includes("typing") || lowerPrompt.includes("defense")) {
        baseCode = TYPING_CODE;
    } else if (lowerPrompt.includes("snake")) {
        baseCode = SNAKE_CODE;
    } else if (lowerPrompt.includes("flappy")) {
        baseCode = FLAPPY_CODE;
    }

    if (baseCode) {
        console.log("Using Precompiled Game for:", params.prompt);
        if (params.ad) {
             return injectAdIntoCode(baseCode, params.ad);
        }
        return baseCode;
    }
    // ------------------------------------------

    let logoImgSrc = "";
    let adInstruction = "";
    
    // Placeholder to prevent sending massive Base64 strings to the LLM
    const PLACEHOLDER_IMG_SRC = "PLACEHOLDER_BASE64_IMAGE_DO_NOT_REMOVE";
    let realAdUrl = "";

    // A. Use Ad Assets if available
    if (params.ad && params.ad.assets.length > 0) {
        // Use the first asset (Logo)
        const logoAsset = params.ad.assets[0];
        realAdUrl = logoAsset.url;
        logoImgSrc = PLACEHOLDER_IMG_SRC;

        adInstruction = `
        **SPONSOR INJECTION:**
        Brand: "${params.ad.brandName}"
        
        **MANDATORY ASSETS:**
        const BG_IMG_SRC = "${logoImgSrc}";
        
        INSTRUCTIONS:
        1. Create a background image object using \`BG_IMG_SRC\`.
        2. **ALWAYS** draw this image first in your loop to cover the entire canvas (0, 0, 400, 600).
        3. Draw a black rectangle with **0.7 opacity** over the background image so the game elements are visible on top.
        4. On Game Over, draw a solid banner with bg color "${params.ad.color}" at the bottom.
        5. Draw the text "${params.ad.brandName} - ${params.ad.slogan}" inside the banner.
        `;
    } 

    const userPrompt = `
      Create a robust Javascript canvas game.
      Concept: "${params.prompt}".
      
      Requirements:
      - Resolution: FIXED 400x600.
      - Controls: Arrows/Space/Click.
      ${adInstruction}
    `;

    // Direct call to Flash - No intermediate image generation calls for speed
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.9, 
      },
    });

    let code = response.text || '';
    code = code.replace(/```javascript/g, '').replace(/```/g, '').trim();

    // Re-inject the actual base64 string into the generated code
    if (realAdUrl && code.includes(PLACEHOLDER_IMG_SRC)) {
        code = code.replace(PLACEHOLDER_IMG_SRC, realAdUrl);
    }
    
    return code;
  } catch (error) {
    console.error("Gemini generation error:", error);
    throw new Error("Failed to generate game. " + (error as any).message);
  }
};

export const debugGameCode = async (currentCode: string, userInstruction: string): Promise<string> => {
  try {
    // Strip heavy base64 strings before sending to context
    const placeholders: Record<string, string> = {};
    let pCount = 0;
    
    // Regex matches data:image/...;base64,... strings
    const maskedCode = currentCode.replace(/("data:image\/[^;]+;base64,[^"]+")/g, (match) => {
        const key = `__BASE64_IMG_${pCount++}__`;
        // We strip the quotes from the match for storage, as we'll likely replace the key (which is a string literal)
        placeholders[key] = match.slice(1, -1); 
        return `"${key}"`;
    });

    const debugPrompt = `
      The user wants to fix/modify this game code.
      User Instruction: "${userInstruction}"
      
      Requirements:
      1. Keep the 400x600 resolution.
      2. PRESERVE ALL string constants (especially __BASE64_IMG_...__).
      
      Code:
      ${maskedCode}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: debugPrompt,
      config: {
        systemInstruction: SYSTEM_PROMPT, 
      },
    });

    let code = response.text || '';
    code = code.replace(/```javascript/g, '').replace(/```/g, '').trim();

    // Restore Base64 strings
    Object.keys(placeholders).forEach(key => {
        // Replace the placeholder key with the actual base64 url
        code = code.replace(key, placeholders[key]);
    });

    return code;
  } catch (error) {
     console.error("Gemini debug error:", error);
    throw new Error("Failed to debug game.");
  }
}
