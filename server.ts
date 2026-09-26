import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import apiRoutes from './routes/apiRoutes';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

// Mount Backend Firebase Admin API Routes (Verification, Audit Log, Clinics, Impersonation)
app.use('/api', apiRoutes);

// Initialize Gemini Client
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY || 'MOCK_KEY';
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// 1. AI Draft Support Ticket Reply
app.post('/api/ai/draft-ticket-reply', async (req: Request, res: Response) => {
  try {
    const { ticketSubject, category, clinicName, doctorName, planTier, messages, tone } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      // Friendly fallback if key is unconfigured placeholder
      return res.json({
        replyText: `Hello ${doctorName || 'Doctor'},\n\nThank you for reaching out regarding the issue: "${ticketSubject}". I have checked your account (${clinicName}, ${planTier.toUpperCase()} Plan). \n\nOur platform engineering team has reviewed the ${category} subsystem logs and resolved the connection bottleneck. Please refresh your workspace and try again.\n\nBest regards,\nOperator Support Team`,
        suggestedActions: ['Mark Ticket as Resolved', 'Send Knowledge Base Link', 'Escalate to Engineering'],
        isAiGenerated: false,
        note: 'Fallback mode (Set GEMINI_API_KEY in Secrets for live AI drafting)'
      });
    }

    const ai = getGenAI();
    const prompt = `You are a senior Chiropractic SaaS back-office support engineer responding to a clinic owner.
Clinic Details:
- Clinic Name: ${clinicName}
- Doctor: ${doctorName}
- Plan Tier: ${planTier}
- Ticket Category: ${category}
- Ticket Subject: ${ticketSubject}
- Requested Tone: ${tone || 'professional, empathetic, and clear'}

Conversation Thread:
${JSON.stringify(messages, null, 2)}

Instructions:
1. Write a direct, helpful, and concise response to the clinic owner.
2. Address their specific issue clearly with actionable steps or status updates.
3. Keep the greeting professional and warm.
4. Output JSON with fields: "replyText" (string) and "suggestedActions" (array of 3 short action strings).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      replyText: parsed.replyText || 'Thank you for your message. We are looking into this immediately.',
      suggestedActions: parsed.suggestedActions || ['Mark Resolved', 'Follow Up Tomorrow'],
      isAiGenerated: true,
    });
  } catch (err: any) {
    console.error('Error in draft-ticket-reply:', err);
    return res.status(500).json({
      error: 'Failed to generate AI response draft',
      message: err?.message || 'Unknown error',
    });
  }
});

// 2. AI Generate Global Announcement
app.post('/api/ai/generate-announcement', async (req: Request, res: Response) => {
  try {
    const { topic, audience, type, summaryNotes } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.json({
        title: `📢 Update: ${topic || 'System Feature Enhancements'}`,
        message: `We are excited to notify all ${audience === 'all' ? 'clinics' : audience + ' plan'} users about recent platform performance upgrades: ${summaryNotes || 'Optimized SOAP note processing and faster EHR sync.'}`,
        isAiGenerated: false,
      });
    }

    const ai = getGenAI();
    const prompt = `You are an executive product manager for ChiroPulse, a Chiropractic Practice SaaS platform.
Write a clear, compelling announcement broadcast notice for clinic owners.

Topic: ${topic}
Target Audience: ${audience} tier clinics
Announcement Type: ${type} (feature | maintenance | billing | alert)
Notes/Context: ${summaryNotes}

Format output as JSON with:
- "title": concise, catchy title with relevant emoji
- "message": 2-3 sentences explaining the update, key benefit, and any required action.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      title: parsed.title || `Notice: ${topic}`,
      message: parsed.message || summaryNotes,
      isAiGenerated: true,
    });
  } catch (err: any) {
    console.error('Error generating announcement:', err);
    return res.status(500).json({ error: 'Failed to generate announcement' });
  }
});

// 3. AI Analyze System Health Logs
app.post('/api/ai/analyze-health-logs', async (req: Request, res: Response) => {
  try {
    const { logs, serviceName } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.json({
        analysis: `Diagnostic Scan for ${serviceName || 'System Services'}:\n- Primary root cause: Rate-limit throttling detected on third-party integration endpoint.\n- Impact: High latency (340ms) on SOAP note payload sync.\n- Recommendation: Increase token bucket capacity and perform cache flush on proxy pool node.`,
        urgency: 'Medium',
        actionItems: ['Flush Redis Proxy Cache', 'Increase Rate Limits in Config', 'Monitor Error Rates for 15 mins'],
        isAiGenerated: false
      });
    }

    const ai = getGenAI();
    const prompt = `You are a Principal Site Reliability Engineer (SRE) for ChiroPulse SaaS.
Analyze the following system service logs/events:

Target Service: ${serviceName || 'All Systems'}
Logs:
${JSON.stringify(logs, null, 2)}

Provide a structured diagnostic summary formatted as JSON with keys:
- "analysis": clear, 3-bullet technical diagnosis of root cause and system impact.
- "urgency": "Low" | "Medium" | "High" | "Critical"
- "actionItems": array of 3 concrete steps for the platform operator to resolve or mitigate.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      analysis: parsed.analysis || 'System analyzed. No critical outages identified.',
      urgency: parsed.urgency || 'Low',
      actionItems: parsed.actionItems || ['Review active connections', 'Monitor latency'],
      isAiGenerated: true,
    });
  } catch (err: any) {
    console.error('Error analyzing health logs:', err);
    return res.status(500).json({ error: 'Failed to analyze logs' });
  }
});

// Start server with Vite middleware in development
async function startServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ChiroPulse Operator Server running on http://localhost:${PORT}`);
  });
}

startServer();
