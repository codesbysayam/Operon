import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini Client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'operon-ai' } },
      });
    }
  }
  return aiClient;
}

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'OPERON',
    version: '2.4.0',
    serverTime: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    services: {
      workflowEngine: 'ONLINE',
      policyEngine: 'ONLINE',
      releaseGuardian: 'ONLINE',
      actionRegistry: 'ONLINE',
      aiGateway: process.env.GEMINI_API_KEY ? 'ONLINE' : 'DEMO_MODE',
    },
  });
});

// Gemini Text Generation Gateway
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const { prompt, model = 'gemini-2.5-flash', systemInstruction } = req.body;
    const client = getGeminiClient();

    if (!client) {
      return res.status(200).json({
        text: `[OPERON AI Assistant - Demo Mode]: Structured response generated for request:\n\n` +
          `• Intent: "${prompt.slice(0, 60)}"\n` +
          `• Policy Boundaries: Verified against auto-refund cap.\n` +
          `• Status: Safe for execution routing.`,
        fallback: true,
      });
    }

    const response = await client.models.generateContent({
      model,
      contents: prompt,
      config: systemInstruction ? { systemInstruction } : undefined,
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.error('OPERON Gemini Gateway Error:', err);
    res.status(500).json({ error: err?.message || 'Failed to process AI prompt' });
  }
});

// Multi-Agent Orchestration Endpoint
app.post('/api/gemini/orchestrate', async (req, res) => {
  try {
    const { payload, workspace = 'support', policyLimit = 100 } = req.body;
    const client = getGeminiClient();

    if (!client) {
      return res.json({
        overallConfidence: 94,
        recommendedAction: 'APPROVE',
        riskScore: 18,
        reasoning: [
          'Intent Analyst classified customer request.',
          'Context Memory verified customer tenure and zero anomaly signals.',
          `Release Guardian enforced $${policyLimit} policy threshold; routed to human review gate if limit exceeded.`,
        ],
        steps: [
          {
            id: 'step-1',
            agentRole: 'analyst',
            agentName: 'Intent Analyst',
            stepName: 'Intent Classification',
            status: 'completed',
            output: `Analyzed customer input: "${payload || 'Standard customer refund request'}"`,
            confidenceScore: 98,
          },
          {
            id: 'step-2',
            agentRole: 'fraud_sentinel',
            agentName: 'Fraud & Anomaly Sentinel',
            stepName: 'Risk & Anomaly Check',
            status: 'completed',
            output: 'Transaction velocity normal. Anomaly risk score: 18/100 (LOW).',
            confidenceScore: 96,
          },
          {
            id: 'step-3',
            agentRole: 'planner',
            agentName: 'Workflow Planner',
            stepName: 'Policy Boundary Evaluation',
            status: 'completed',
            output: `Workspace [${workspace.toUpperCase()}] policy evaluation passed. Calculated risk index: Low.`,
            confidenceScore: 94,
          },
          {
            id: 'step-4',
            agentRole: 'release_guardian',
            agentName: 'Release Guardian',
            stepName: 'Human Sign-off Gate',
            status: 'awaiting_approval',
            output: `Policy threshold cap checked ($${policyLimit}.00). Queued for human authorization.`,
            confidenceScore: 91,
          },
        ],
      });
    }

    const systemPrompt = `You are the OPERON Autonomous Ops Multi-Agent Orchestrator.
Analyze the customer payload and return a JSON object with this exact structure:
{
  "overallConfidence": 94,
  "recommendedAction": "APPROVE" or "REJECT",
  "riskScore": 18,
  "reasoning": ["point 1", "point 2", "point 3"],
  "steps": [
    {
      "id": "step-1",
      "agentRole": "analyst",
      "agentName": "Intent Analyst",
      "stepName": "Intent Classification",
      "status": "completed",
      "output": "summary of intent analysis",
      "confidenceScore": 98
    },
    {
      "id": "step-2",
      "agentRole": "fraud_sentinel",
      "agentName": "Fraud & Anomaly Sentinel",
      "stepName": "Risk & Anomaly Check",
      "status": "completed",
      "output": "summary of risk scoring",
      "confidenceScore": 96
    },
    {
      "id": "step-3",
      "agentRole": "planner",
      "agentName": "Workflow Planner",
      "stepName": "Policy Evaluation",
      "status": "completed",
      "output": "summary of policy check",
      "confidenceScore": 94
    },
    {
      "id": "step-4",
      "agentRole": "release_guardian",
      "agentName": "Release Guardian",
      "stepName": "Human Approval Gate",
      "status": "awaiting_approval",
      "output": "human review trigger explanation",
      "confidenceScore": 91
    }
  ]
}`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Workspace: ${workspace}\nPayload: ${payload}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('OPERON Orchestration Error:', err);
    res.status(500).json({ error: 'Orchestration failed' });
  }
});

// Serve Frontend in Development via Vite Middleware or Static Dist in Production
const distPath = path.join(process.cwd(), 'dist');

async function setupFrontend() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false, // Prevents failed websocket attempts in container dev environment
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`OPERON server running on http://0.0.0.0:${PORT}`);
  });
}

setupFrontend();
