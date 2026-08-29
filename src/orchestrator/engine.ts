import { PipelineStep, AgentRole, ExecutionMode } from '../types';

export interface MultiAgentOrchestrationResult {
  steps: PipelineStep[];
  overallConfidence: number;
  recommendedAction: 'APPROVE' | 'REJECT' | 'ESCALATE_TO_SENIOR';
  reasoning: string[];
}

export async function runMultiAgentPipeline(
  inputPayload: string,
  mode: ExecutionMode = 'demo'
): Promise<MultiAgentOrchestrationResult> {
  if (mode === 'live') {
    try {
      const response = await fetch('/api/gemini/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: inputPayload }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.steps) return data;
      }
    } catch (err) {
      console.warn('Live Gemini API proxy failed or offline, falling back to deterministic demo engine:', err);
    }
  }

  // Deterministic Demo Engine Output
  return {
    overallConfidence: 91,
    recommendedAction: 'APPROVE',
    reasoning: [
      `Analyst parsed input: "${inputPayload.slice(0, 60)}..."`,
      'Memory Agent verified positive customer tenure and zero fraud markers.',
      'Planner computed policy compliance; auto-refund threshold exceeded requiring human review.',
    ],
    steps: [
      {
        id: 'step-live-1',
        agentRole: 'analyst',
        agentName: 'Intent Analyst',
        stepName: 'Intent Classification & Entity Match',
        status: 'completed',
        input: inputPayload,
        output: 'Intent: Customer Refund / Duplicate Charge. Confidence: 98%.',
        confidenceScore: 98,
        reasoning: 'Parsed entity dollar amounts and email sender.',
      },
      {
        id: 'step-live-2',
        agentRole: 'memory',
        agentName: 'Context Memory Agent',
        stepName: 'Historical Vector Lookup',
        status: 'completed',
        input: 'Lookup customer profile',
        output: 'Account tenure: 18 months, Tier: Enterprise, Churn risk: Low (2.1%).',
        confidenceScore: 95,
        reasoning: 'Loyal user profile verified in database vector store.',
      },
      {
        id: 'step-live-3',
        agentRole: 'planner',
        agentName: 'Workflow Planner',
        stepName: 'Risk & Policy Boundary Check',
        status: 'completed',
        input: 'Evaluate against $100 auto-approve boundary',
        output: 'Policy check passed. Amount > $100 -> Route to Human Approval Queue.',
        confidenceScore: 92,
        reasoning: 'Hard boundary enforced by Release Guardian policy.',
      },
      {
        id: 'step-live-4',
        agentRole: 'release_guardian',
        agentName: 'Release Guardian',
        stepName: 'Human Approval Gate',
        status: 'awaiting_approval',
        input: 'Awaiting Operations Lead signoff',
        output: 'Case CS-2041 queued in Command Center.',
        confidenceScore: 91,
        reasoning: 'Human sign-off required.',
      },
    ],
  };
}
