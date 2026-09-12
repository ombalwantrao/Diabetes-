import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set.");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString()
    });
  });

  // Multiturn Clinical Chatbot endpoint using Gemini
  // Supports fast mode (gemini-3.1-flash-lite), general (gemini-3.5-flash), and complex (gemini-3.1-pro-preview)
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { messages, taskType, patientMetrics } = req.body;

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "messages array is required." });
      }

      const ai = getAIClient();

      // Model selection per guidelines:
      // complex tasks -> gemini-3.1-pro-preview
      // fast tasks -> gemini-3.1-flash-lite
      // general tasks -> gemini-3.5-flash
      let modelName = "gemini-3.5-flash";
      if (taskType === "complex") {
        modelName = "gemini-3.1-pro-preview";
      } else if (taskType === "fast") {
        modelName = "gemini-3.1-flash-lite";
      }

      let systemInstruction = `You are "DiaConsult AI", a clinical metabolic advisor & diabetes education assistant designed for healthcare providers and patients.
Your role:
- Provide clear, evidence-based explanations about glycemic risk factors, physiological biomarkers (Glucose, BMI, Insulin, DPF, HbA1c), and metabolic syndrome.
- Offer actionable lifestyle, dietary, physical activity, and clinical screening recommendations.
- Clarify clinical risk scoring (Low, Moderate, High risk) produced by the machine learning classification model.
- Always include an appropriate medical disclaimer: you provide educational guidance and risk interpretation, not definitive physician diagnosis.

Tone: Professional, empathetic, clear, structured, and clinically sound.`;

      if (patientMetrics) {
        systemInstruction += `\n\nCURRENT PATIENT CONTEXT IN VIEW:
- Glucose: ${patientMetrics.glucose} mg/dL
- BMI: ${patientMetrics.bmi} kg/m² (${patientMetrics.bmiCategory})
- Blood Pressure: ${patientMetrics.bloodPressure} mm Hg
- Insulin: ${patientMetrics.insulin} μU/mL
- Age: ${patientMetrics.age} years (${patientMetrics.ageCategory})
- Diabetes Pedigree Function: ${patientMetrics.dpf}
- Estimated ML Risk: ${patientMetrics.riskPercentage}% (${patientMetrics.riskLevel} Risk)
- Top Risk Signals: ${patientMetrics.factors?.join(", ") || "None"}
Reference these specific metrics when responding to the user's inquiry regarding this patient.`;
      }

      // Convert messages to Gemini API contents format
      const contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

      const response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      });

      res.json({
        reply: response.text || "No response generated.",
        modelUsed: modelName,
      });
    } catch (error: any) {
      console.error("Gemini Chat error:", error);
      res.status(500).json({
        error: error.message || "Failed to communicate with Gemini API."
      });
    }
  });

  // Google Search Grounding endpoint
  // Requirement: "You MUST add Search Grounding to the app where relevant to get up to date and accurate information. Use gemini-3.5-flash (with googleSearch tool)"
  app.post("/api/gemini/search", async (req, res) => {
    try {
      const { query: userQuery, patientContext } = req.body;
      if (!userQuery) {
        return res.status(400).json({ error: "Query is required." });
      }

      const ai = getAIClient();

      let prompt = `Provide the latest clinical research, treatment guidelines, ADA 2024-2026 standards, or nutritional guidance regarding: ${userQuery}.`;
      if (patientContext) {
        prompt += `\nPatient Context: Glucose ${patientContext.glucose} mg/dL, BMI ${patientContext.bmi}, Risk: ${patientContext.riskLevel}.`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction: "You are a medical research grounding assistant. Retrieve and synthesize current evidence-based diabetes and metabolic guidelines. Clearly reference factual findings.",
        }
      });

      const searchChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const webSources = searchChunks
        .filter((chunk: any) => chunk.web?.uri)
        .map((chunk: any) => ({
          title: chunk.web.title || "Web Reference",
          uri: chunk.web.uri
        }));

      res.json({
        content: response.text || "",
        sources: webSources,
        groundingMetadata: response.candidates?.[0]?.groundingMetadata || null
      });
    } catch (error: any) {
      console.error("Gemini Search Grounding error:", error);
      res.status(500).json({
        error: error.message || "Failed to execute Search Grounding."
      });
    }
  });

  // Google Maps Grounding endpoint
  // Requirement: "You MUST add Maps Grounding to the app where relevant to get up to date and accurate information. Use gemini-3.5-flash (with googleMaps tool)"
  app.post("/api/gemini/maps", async (req, res) => {
    try {
      const { query: userQuery, location, riskLevel } = req.body;
      const ai = getAIClient();

      const locText = location ? ` near ${location}` : " nearby";
      const prompt = userQuery || `Find specialized diabetes care clinics, endocrinologists, diagnostic laboratories, and diabetic lifestyle/wellness support centers${locText} for a patient with ${riskLevel || 'moderate'} diabetes risk. Include details on services and facilities.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleMaps: {} }],
          systemInstruction: "You are a clinical navigation assistant helping patients locate reputable healthcare facilities, diabetic clinics, accredited labs, and endocrinologists. Provide specific recommendations with addresses, contact insights, and specialties.",
        }
      });

      const groundingMetadata = response.candidates?.[0]?.groundingMetadata || null;

      res.json({
        content: response.text || "",
        groundingMetadata,
      });
    } catch (error: any) {
      console.error("Gemini Maps Grounding error:", error);
      res.status(500).json({
        error: error.message || "Failed to execute Maps Grounding."
      });
    }
  });

  // Vite middleware in dev, static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[✓] Diabetes Prediction Full-Stack Server active on port ${PORT}.`);
    console.log(`[✓] Accessible externally via Google Cloud Run development/shared preview URL.`);
  });
}

startServer();
