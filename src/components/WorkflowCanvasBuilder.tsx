import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  WorkflowDefinition,
  PipelineStep,
  AgentRole,
  WorkspaceType,
} from '../types';
import { StatusBadge } from './StatusBadge';
import { DeployButtonWithTip } from './WorkflowTipTooltip';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Save,
  Zap,
  Bot,
  UserCheck,
  ShieldAlert,
  PlayCircle,
  Plus,
  Trash2,
  Sparkles,
  Info,
  CheckCircle2,
  RefreshCw,
  Layers,
  Sliders,
  X,
  ChevronDown,
  Clock,
  Check,
  HelpCircle,
  Activity,
  Maximize2,
  ShieldCheck,
} from 'lucide-react';

export interface CanvasNode {
  id: string;
  type: 'trigger' | 'ai_agent' | 'human_approval' | 'condition' | 'action';
  title: string;
  subtitle: string;
  role: AgentRole;
  status: 'pending' | 'running' | 'completed' | 'awaiting_approval' | 'failed';
  x: number;
  y: number;
  input?: string;
  output?: string;
  confidenceScore?: number;
  reasoning?: string;
}

export interface CanvasWire {
  id: string;
  fromNodeId: string;
  toNodeId: string;
}

interface WorkflowCanvasBuilderProps {
  workflow?: WorkflowDefinition;
  activeWorkspace: WorkspaceType;
  onSaveWorkflow?: (updatedWf: WorkflowDefinition) => void;
  onSimulateRun?: (wfId: string) => void;
}

export const WorkflowCanvasBuilder: React.FC<WorkflowCanvasBuilderProps> = ({
  workflow,
  activeWorkspace,
  onSaveWorkflow,
  onSimulateRun,
}) => {
  // Preset template names
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    workflow?.name || 'Finance Invoice Processing'
  );

  // Simulation playback state
  type SimStatus = 'idle' | 'running' | 'paused' | 'gate_paused' | 'completed';
  const [simStatus, setSimStatus] = useState<SimStatus>('idle');
  const [simStepIndex, setSimStepIndex] = useState<number>(-1);
  const [simSpeed, setSimSpeed] = useState<number>(1); // 0.5x, 1x, 2x

  // Refs for tracking simulation loop asynchronously without race conditions
  const simStatusRef = useRef<SimStatus>('idle');
  const simStepRef = useRef<number>(-1);
  const simSpeedRef = useRef<number>(1);
  const nodesRef = useRef<CanvasNode[]>([]);
  const simTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initial nodes generation
  const buildNodesFromWorkflow = (wf?: WorkflowDefinition): { nodes: CanvasNode[]; wires: CanvasWire[] } => {
    if (!wf || !wf.pipeline || wf.pipeline.length === 0) {
      // Default initial layout
      const defaultNodes: CanvasNode[] = [
        {
          id: 'node-1',
          type: 'trigger',
          title: 'Webhook Trigger',
          subtitle: 'Receives external API payload',
          role: 'analyst',
          status: 'completed',
          x: 280,
          y: 240,
          input: 'Payload: { invoiceId: "INV-9902", amount: $4,250.00 }',
          output: 'Validated invoice payload.',
          confidenceScore: 98,
        },
        {
          id: 'node-2',
          type: 'condition',
          title: 'Risk & Confidence Check',
          subtitle: 'Checks if AI Confidence > 90% and Amount < $5,000',
          role: 'planner',
          status: 'completed',
          x: 520,
          y: 120,
          input: 'Amount: $4,250.00 | Threshold: $5,000',
          output: 'Passed confidence check. Multi-agent review required.',
          confidenceScore: 96,
        },
        {
          id: 'node-3',
          type: 'human_approval',
          title: 'Human Approval Gate',
          subtitle: 'Requires supervisor sign-off if amount > threshold',
          role: 'release_guardian',
          status: 'completed',
          x: 520,
          y: 360,
          input: 'Invoice elevation flag',
          output: 'Sign-off granted by Sayam Mukherjee.',
          confidenceScore: 94,
        },
        {
          id: 'node-4',
          type: 'action',
          title: 'Send Customer Response',
          subtitle: 'Dispatches email & updates ticket status via API',
          role: 'executor',
          status: 'completed',
          x: 780,
          y: 240,
          input: 'Email: accounts@enterprise.org',
          output: 'Dispatched payment authorization email.',
          confidenceScore: 99,
        },
      ];
      const defaultWires: CanvasWire[] = [
        { id: 'w1', fromNodeId: 'node-1', toNodeId: 'node-2' },
        { id: 'w2', fromNodeId: 'node-1', toNodeId: 'node-3' },
        { id: 'w3', fromNodeId: 'node-2', toNodeId: 'node-4' },
        { id: 'w4', fromNodeId: 'node-3', toNodeId: 'node-4' },
      ];
      return { nodes: defaultNodes, wires: defaultWires };
    }

    const generatedNodes: CanvasNode[] = wf.pipeline.map((step, index) => {
      let nodeType: CanvasNode['type'] = 'ai_agent';
      if (index === 0) nodeType = 'trigger';
      else if (
        step.agentRole === 'release_guardian' ||
        step.stepName.toLowerCase().includes('approval') ||
        step.stepName.toLowerCase().includes('signoff')
      ) {
        nodeType = 'human_approval';
      } else if (
        step.stepName.toLowerCase().includes('check') ||
        step.stepName.toLowerCase().includes('condition')
      ) {
        nodeType = 'condition';
      } else if (step.agentRole === 'executor' || index === wf.pipeline.length - 1) {
        nodeType = 'action';
      }

      const x = 280 + (index % 3) * 260;
      const y = 140 + Math.floor(index / 3) * 200 + (index % 2 === 1 ? 40 : 0);

      return {
        id: `node-${step.id || index + 1}`,
        type: nodeType,
        title: step.stepName,
        subtitle: step.output || `Agent role: ${step.agentName}`,
        role: step.agentRole,
        status: step.status,
        x,
        y,
        input: step.input || `Initial payload parameter for step ${index + 1}`,
        output: step.output || `Computed output from ${step.agentName}`,
        confidenceScore: step.confidenceScore || 92 + (index % 7),
        reasoning: step.reasoning || 'Evaluated against operational policy invariants.',
      };
    });

    const generatedWires: CanvasWire[] = [];
    for (let i = 0; i < generatedNodes.length - 1; i++) {
      generatedWires.push({
        id: `wire-${i + 1}`,
        fromNodeId: generatedNodes[i].id,
        toNodeId: generatedNodes[i + 1].id,
      });
    }

    return { nodes: generatedNodes, wires: generatedWires };
  };

  const initialData = buildNodesFromWorkflow(workflow);
  const [nodes, setNodes] = useState<CanvasNode[]>(initialData.nodes);
  const [wires, setWires] = useState<CanvasWire[]>(initialData.wires);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    initialData.nodes[0]?.id || null
  );
  const [activePortFrom, setActivePortFrom] = useState<string | null>(null);

  // Sync with ref
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  // Sync speed ref
  useEffect(() => {
    simSpeedRef.current = simSpeed;
  }, [simSpeed]);

  // If workflow changes, update canvas
  useEffect(() => {
    if (workflow) {
      setSelectedTemplate(workflow.name);
      const data = buildNodesFromWorkflow(workflow);
      setNodes(data.nodes);
      setWires(data.wires);
      setSelectedNodeId(data.nodes[0]?.id || null);
      if (simTimeoutRef.current) clearTimeout(simTimeoutRef.current);
      setSimStatus('idle');
      simStatusRef.current = 'idle';
      setSimStepIndex(-1);
      simStepRef.current = -1;
    }
  }, [workflow?.id]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (simTimeoutRef.current) {
        clearTimeout(simTimeoutRef.current);
      }
    };
  }, []);

  // Dragging node state
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Handle template switching
  const handleTemplateChange = (templateName: string) => {
    setSelectedTemplate(templateName);
    if (simTimeoutRef.current) clearTimeout(simTimeoutRef.current);
    setSimStatus('idle');
    simStatusRef.current = 'idle';
    setSimStepIndex(-1);
    simStepRef.current = -1;

    if (templateName.includes('Support')) {
      const supportNodes: CanvasNode[] = [
        {
          id: 'n-1',
          type: 'trigger',
          title: 'Support Ticket Ingest',
          subtitle: 'Webhook for incoming customer refund tickets',
          role: 'analyst',
          status: 'completed',
          x: 280,
          y: 180,
          input: 'Ticket: #CS-4412 (Refund Request for $149.00)',
          output: 'Extracted customer ID and transaction token.',
        },
        {
          id: 'n-2',
          type: 'ai_agent',
          title: 'Intent & Churn AI',
          subtitle: 'Extracts refund intent and evaluates risk score',
          role: 'analyst',
          status: 'completed',
          x: 520,
          y: 180,
          input: 'Customer tenure: 18 months, Churn index: 0.12',
          output: 'Intent: DUPLICATE_CHARGE. Confidence: 96%.',
          confidenceScore: 96,
        },
        {
          id: 'n-3',
          type: 'human_approval',
          title: 'Refund Supervisor Signoff',
          subtitle: 'Triggers if refund amount > $100.00 auto limit',
          role: 'release_guardian',
          status: 'awaiting_approval',
          x: 760,
          y: 180,
          input: 'Amount: $149.00 (Exceeds $100 auto cap)',
          output: 'Pending operations lead authorization.',
          confidenceScore: 93,
        },
        {
          id: 'n-4',
          type: 'action',
          title: 'Execute Stripe Gateway',
          subtitle: 'Calls payment gateway API to reverse charge',
          role: 'executor',
          status: 'pending',
          x: 1000,
          y: 180,
          input: 'Stripe charge ID: ch_3N84x...',
          output: 'Refund transaction queued.',
        },
      ];
      const supportWires: CanvasWire[] = [
        { id: 'w1', fromNodeId: 'n-1', toNodeId: 'n-2' },
        { id: 'w2', fromNodeId: 'n-2', toNodeId: 'n-3' },
        { id: 'w3', fromNodeId: 'n-3', toNodeId: 'n-4' },
      ];
      setNodes(supportNodes);
      setWires(supportWires);
      setSelectedNodeId('n-3');
    } else if (templateName.includes('HR')) {
      const hrNodes: CanvasNode[] = [
        {
          id: 'hr-1',
          type: 'trigger',
          title: 'Workday HR Event',
          subtitle: 'New employee offer letter accepted',
          role: 'analyst',
          status: 'completed',
          x: 280,
          y: 180,
          input: 'Employee: Sofia Karim, Role: Staff SRE',
        },
        {
          id: 'hr-2',
          type: 'ai_agent',
          title: 'SSO Role Provisioner',
          subtitle: 'Calculates required IAM roles and group memberships',
          role: 'planner',
          status: 'completed',
          x: 520,
          y: 180,
          input: 'Department: Infrastructure Engineering',
          output: 'Assigned AWS-Prod-Read, GitHub-Write, Slack-Org',
          confidenceScore: 98,
        },
        {
          id: 'hr-3',
          type: 'human_approval',
          title: 'Security Officer Signoff',
          subtitle: 'Mandatory for AWS Prod / GitHub Admin privileges',
          role: 'release_guardian',
          status: 'completed',
          x: 760,
          y: 180,
          input: 'Elevated production IAM credential request',
          output: 'Security sign-off granted by CISO delegate.',
          confidenceScore: 97,
        },
        {
          id: 'hr-4',
          type: 'action',
          title: 'Dispatch Okta Provisioning',
          subtitle: 'Creates corporate email & SSO credentials',
          role: 'executor',
          status: 'completed',
          x: 1000,
          y: 180,
          input: 'Provisioning payload sent to Okta API',
          output: 'Account created: sofia.karim@enterprise-corp.com',
        },
      ];
      const hrWires: CanvasWire[] = [
        { id: 'w1', fromNodeId: 'hr-1', toNodeId: 'hr-2' },
        { id: 'w2', fromNodeId: 'hr-2', toNodeId: 'hr-3' },
        { id: 'w3', fromNodeId: 'hr-3', toNodeId: 'hr-4' },
      ];
      setNodes(hrNodes);
      setWires(hrWires);
      setSelectedNodeId('hr-2');
    } else {
      const initial = buildNodesFromWorkflow();
      setNodes(initial.nodes);
      setWires(initial.wires);
      setSelectedNodeId(initial.nodes[0]?.id || null);
    }
  };

  // Node Drag Handlers
  const handleMouseDownNode = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    setDraggingNodeId(nodeId);
    const node = nodes.find((n) => n.id === nodeId);
    if (node && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left - node.x,
        y: e.clientY - rect.top - node.y,
      });
    }
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent) => {
    if (draggingNodeId && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const newX = Math.max(20, Math.min(rect.width - 260, e.clientX - rect.left - dragOffset.x));
      const newY = Math.max(20, Math.min(rect.height - 200, e.clientY - rect.top - dragOffset.y));

      setNodes((prev) =>
        prev.map((n) => (n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n))
      );
    }
  };

  const handleMouseUpCanvas = () => {
    setDraggingNodeId(null);
  };

  // Add new node from palette
  const handleAddNodeFromPalette = (
    type: 'trigger' | 'ai_agent' | 'human_approval' | 'condition' | 'action'
  ) => {
    const newId = `node-${Date.now()}`;
    const titles = {
      trigger: 'Webhook Trigger',
      ai_agent: 'AI Reasoning Agent',
      human_approval: 'Human Approval Gate',
      condition: 'Condition Check',
      action: 'System Action',
    };
    const subtitles = {
      trigger: 'Receives external API payload',
      ai_agent: 'Evaluates context & prompts LLM',
      human_approval: 'Safeguard gate for sensitive operations',
      condition: 'Evaluates logical rules & thresholds',
      action: 'Executes API calls & updates databases',
    };
    const roles: Record<string, AgentRole> = {
      trigger: 'analyst',
      ai_agent: 'planner',
      human_approval: 'release_guardian',
      condition: 'planner',
      action: 'executor',
    };

    const newNode: CanvasNode = {
      id: newId,
      type,
      title: titles[type],
      subtitle: subtitles[type],
      role: roles[type],
      status: 'pending',
      x: 320 + Math.random() * 80,
      y: 180 + Math.random() * 80,
    };

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newId);

    // Auto connect to last node if exists
    if (nodes.length > 0) {
      const lastNode = nodes[nodes.length - 1];
      setWires((prev) => [
        ...prev,
        { id: `wire-${Date.now()}`, fromNodeId: lastNode.id, toNodeId: newId },
      ]);
    }
  };

  // Click port to wire
  const handlePortClick = (nodeId: string) => {
    if (!activePortFrom) {
      setActivePortFrom(nodeId);
    } else {
      if (activePortFrom !== nodeId) {
        setWires((prev) => [
          ...prev,
          { id: `wire-${Date.now()}`, fromNodeId: activePortFrom, toNodeId: nodeId },
        ]);
      }
      setActivePortFrom(null);
    }
  };

  // Delete node
  const handleDeleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setWires((prev) => prev.filter((w) => w.fromNodeId !== nodeId && w.toNodeId !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  // Core step-by-step runner engine
  const executeStep = useCallback((stepIdx: number, currentNodes: CanvasNode[]) => {
    if (simTimeoutRef.current) {
      clearTimeout(simTimeoutRef.current);
    }

    if (stepIdx >= currentNodes.length) {
      // Finished all graph nodes
      setSimStatus('completed');
      simStatusRef.current = 'completed';
      setSimStepIndex(currentNodes.length);
      simStepRef.current = currentNodes.length;
      return;
    }

    const node = currentNodes[stepIdx];
    setSelectedNodeId(node.id);
    setSimStepIndex(stepIdx);
    simStepRef.current = stepIdx;

    // Set node status to running
    setNodes((prev) =>
      prev.map((n, idx) => (idx === stepIdx ? { ...n, status: 'running' } : n))
    );

    const baseDelay = Math.max(300, 900 / (simSpeedRef.current || 1));

    simTimeoutRef.current = setTimeout(() => {
      if (simStatusRef.current !== 'running') return;

      // If this node is a human approval gate, pause for interactive user approval
      if (node.type === 'human_approval') {
        setNodes((prev) =>
          prev.map((n, idx) =>
            idx === stepIdx
              ? {
                  ...n,
                  status: 'awaiting_approval',
                  output: `Approval Gate Reached: Waiting for operator sign-off...`,
                  confidenceScore: n.confidenceScore || 94,
                }
              : n
          )
        );
        setSimStatus('gate_paused');
        simStatusRef.current = 'gate_paused';
        return;
      }

      // Mark completed
      setNodes((prev) =>
        prev.map((n, idx) =>
          idx === stepIdx
            ? {
                ...n,
                status: 'completed',
                output: `Simulated execution completed (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})`,
                confidenceScore: Math.min(99, 92 + (idx % 7)),
              }
            : n
        )
      );

      // Advance to next step
      const nextIndex = stepIdx + 1;
      setSimStepIndex(nextIndex);
      simStepRef.current = nextIndex;

      if (simStatusRef.current === 'running') {
        executeStep(nextIndex, nodesRef.current);
      }
    }, baseDelay);
  }, []);

  // Main Play / Pause handler
  const handleTogglePlayPause = () => {
    if (simStatusRef.current === 'running') {
      // PAUSE
      if (simTimeoutRef.current) clearTimeout(simTimeoutRef.current);
      simStatusRef.current = 'paused';
      setSimStatus('paused');
    } else if (simStatusRef.current === 'paused') {
      // RESUME
      simStatusRef.current = 'running';
      setSimStatus('running');
      const startIdx = simStepRef.current >= 0 && simStepRef.current < nodes.length ? simStepRef.current : 0;
      executeStep(startIdx, nodesRef.current);
    } else if (simStatusRef.current === 'gate_paused') {
      // APPROVE GATE & RESUME
      handleApproveGate();
    } else {
      // START / RESTART FROM BEGINNING
      if (simTimeoutRef.current) clearTimeout(simTimeoutRef.current);
      const resetNodes = nodes.map((n) => ({ ...n, status: 'pending' as const }));
      setNodes(resetNodes);
      nodesRef.current = resetNodes;
      simStatusRef.current = 'running';
      setSimStatus('running');
      simStepRef.current = 0;
      setSimStepIndex(0);
      executeStep(0, resetNodes);
    }
  };

  // Step Forward Handler
  const handleStepForward = () => {
    if (simTimeoutRef.current) clearTimeout(simTimeoutRef.current);
    const startIdx = simStepIndex < 0 || simStepIndex >= nodes.length ? 0 : simStepIndex;

    // Single step execution
    simStatusRef.current = 'paused';
    setSimStatus('paused');
    const node = nodes[startIdx];
    if (!node) return;

    setSelectedNodeId(node.id);

    setNodes((prev) =>
      prev.map((n, idx) =>
        idx === startIdx
          ? {
              ...n,
              status: n.type === 'human_approval' ? 'awaiting_approval' : 'completed',
              output: `Manual step ${idx + 1} verified.`,
              confidenceScore: Math.min(99, 93 + idx),
            }
          : n
      )
    );

    const nextIdx = startIdx + 1;
    simStepRef.current = nextIdx;
    setSimStepIndex(nextIdx);
    if (nextIdx >= nodes.length) {
      simStatusRef.current = 'completed';
      setSimStatus('completed');
    }
  };

  // Reset Handler
  const handleResetSimulation = () => {
    if (simTimeoutRef.current) clearTimeout(simTimeoutRef.current);
    simStatusRef.current = 'idle';
    setSimStatus('idle');
    simStepRef.current = -1;
    setSimStepIndex(-1);
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        status: 'pending',
      }))
    );
  };

  // Approve Gate in simulation
  const handleApproveGate = () => {
    if (simTimeoutRef.current) clearTimeout(simTimeoutRef.current);
    const currentIdx = simStepRef.current >= 0 ? simStepRef.current : 0;

    const updatedNodes = nodesRef.current.map((n, idx) =>
      idx === currentIdx
        ? {
            ...n,
            status: 'completed' as const,
            output: `Human sign-off granted by Operator at ${new Date().toLocaleTimeString()}.`,
          }
        : n
    );

    setNodes(updatedNodes);
    nodesRef.current = updatedNodes;

    simStatusRef.current = 'running';
    setSimStatus('running');

    const nextIdx = currentIdx + 1;
    simStepRef.current = nextIdx;
    setSimStepIndex(nextIdx);
    executeStep(nextIdx, updatedNodes);
  };

  // Run from specific node
  const handleRunFromNode = (nodeId: string) => {
    if (simTimeoutRef.current) clearTimeout(simTimeoutRef.current);
    const targetIdx = nodes.findIndex((n) => n.id === nodeId);
    if (targetIdx === -1) return;

    const updatedNodes = nodes.map((n, idx) => ({
      ...n,
      status: (idx < targetIdx ? 'completed' : 'pending') as CanvasNode['status'],
    }));

    setNodes(updatedNodes);
    nodesRef.current = updatedNodes;

    simStatusRef.current = 'running';
    setSimStatus('running');
    simStepRef.current = targetIdx;
    setSimStepIndex(targetIdx);
    executeStep(targetIdx, updatedNodes);
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // Helper for Node Styling
  const getNodeBorderAndColor = (type: CanvasNode['type']) => {
    switch (type) {
      case 'trigger':
        return {
          border: 'border-sky-500/30 hover:border-sky-500/60',
          bg: 'bg-[#0E1015]',
          accent: 'text-sky-400',
          badgeBg: 'bg-sky-500/10 text-sky-300 border-sky-500/25',
        };
      case 'ai_agent':
        return {
          border: 'border-indigo-500/30 hover:border-indigo-500/60',
          bg: 'bg-[#0E1015]',
          accent: 'text-indigo-400',
          badgeBg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/25',
        };
      case 'human_approval':
        return {
          border: 'border-[#FFB000]/40 hover:border-[#FFB000]/80',
          bg: 'bg-[#0E1015]',
          accent: 'text-[#FFB000]',
          badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
        };
      case 'condition':
        return {
          border: 'border-amber-400/30 hover:border-amber-400/60',
          bg: 'bg-[#0E1015]',
          accent: 'text-amber-300',
          badgeBg: 'bg-amber-400/10 text-amber-200 border-amber-400/25',
        };
      case 'action':
        return {
          border: 'border-emerald-500/30 hover:border-emerald-500/60',
          bg: 'bg-[#0E1015]',
          accent: 'text-[#22D3A7]',
          badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
        };
      default:
        return {
          border: 'border-white/[0.08] hover:border-white/[0.15]',
          bg: 'bg-[#0E1015]',
          accent: 'text-white/60',
          badgeBg: 'bg-white/[0.06] text-white/70 border-white/[0.08]',
        };
    }
  };

  return (
    <div
      id="workflow-canvas-builder-container"
      className="flex flex-col h-full bg-[#08090D] border border-white/[0.08] rounded-[24px] overflow-hidden shadow-2xl relative select-none font-sans"
    >
      {/* TOP HEADER CONTROLS BAR */}
      <div className="bg-[#0E1015] border-b border-white/[0.08] px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 z-30">
        {/* Left: Template Selector & Info */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-[#FFB000]">
            <Layers className="w-4 h-4" />
          </div>

          <h2 className="text-base font-semibold text-white tracking-tight truncate max-w-[260px]">
            {selectedTemplate}
          </h2>

          <div className="hidden lg:flex items-center space-x-2 text-xs font-mono text-white/40">
            <span>Templates:</span>
            <div className="relative">
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-1 text-xs text-[#FFB000] font-semibold focus:outline-none focus:border-[#FFB000]/60 cursor-pointer appearance-none pr-8"
              >
                <option value="Finance Invoice Processing" className="bg-[#0E1015]">Finance Invoice Processing</option>
                <option value="Customer Support Refund Automation" className="bg-[#0E1015]">Customer Support Refund Automation</option>
                <option value="HR Onboarding & SSO Provisioning" className="bg-[#0E1015]">HR Onboarding & SSO Provisioning</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#FFB000] absolute right-2.5 top-2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* INTERACTIVE PLAY / PAUSE / STEP / RESET GRAPH CONTROLS */}
        <div className="flex items-center space-x-2">
          {/* SIMULATION CONTROL CLUSTER */}
          <div className="flex items-center bg-white/[0.04] p-1 rounded-2xl border border-white/[0.08] space-x-1">
            {/* PLAY / PAUSE BUTTON */}
            <button
              id="simulate-graph-play-pause-btn"
              onClick={handleTogglePlayPause}
              title={
                simStatus === 'running'
                  ? 'Pause Graph Simulation'
                  : simStatus === 'paused'
                  ? 'Resume Graph Simulation'
                  : simStatus === 'gate_paused'
                  ? 'Approve Gate & Continue Simulation'
                  : simStatus === 'completed'
                  ? 'Re-Simulate Execution Graph'
                  : 'Simulate Execution Graph'
              }
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center space-x-2 cursor-pointer ${
                simStatus === 'running'
                  ? 'bg-[#FFB000] text-[#08090D] shadow-sm animate-pulse'
                  : simStatus === 'gate_paused'
                  ? 'bg-[#FFB000] hover:bg-amber-300 text-[#08090D] shadow-sm animate-bounce'
                  : simStatus === 'paused'
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : simStatus === 'completed'
                  ? 'bg-[#22D3A7] hover:bg-emerald-300 text-[#08090D] shadow-sm'
                  : 'btn-primary'
              }`}
            >
              {simStatus === 'running' ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause Graph</span>
                </>
              ) : simStatus === 'gate_paused' ? (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 fill-current" />
                  <span>Approve Gate</span>
                </>
              ) : simStatus === 'paused' ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume Graph</span>
                </>
              ) : simStatus === 'completed' ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Re-Simulate</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Simulate Graph</span>
                </>
              )}
            </button>

            {/* STEP FORWARD BUTTON */}
            <button
              id="simulate-graph-step-forward-btn"
              onClick={handleStepForward}
              disabled={simStatus === 'running'}
              title="Step forward to next node"
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white transition-all disabled:opacity-40 cursor-pointer"
            >
              <StepForward className="w-3.5 h-3.5" />
            </button>

            {/* RESET BUTTON */}
            <button
              id="simulate-graph-reset-btn"
              onClick={handleResetSimulation}
              title="Reset graph simulation to initial state"
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* SPEED SELECTOR */}
            <div className="flex items-center space-x-0.5 px-1 border-l border-white/[0.08] text-[10px] font-mono">
              {[0.5, 1, 2].map((speed) => (
                <button
                  key={`spd-${speed}`}
                  id={`simulate-graph-speed-${speed}x-btn`}
                  onClick={() => setSimSpeed(speed)}
                  className={`px-1.5 py-1 rounded-md transition-colors cursor-pointer ${
                    simSpeed === speed
                      ? 'bg-[#FFB000]/20 text-[#FFB000] font-bold border border-[#FFB000]/30'
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* SAVE DRAFT */}
          <button
            onClick={() => onSaveWorkflow && workflow && onSaveWorkflow(workflow)}
            className="btn-secondary text-xs h-9 px-3.5"
          >
            <Save className="w-3.5 h-3.5 text-white/50" />
            <span className="hidden sm:inline">Save Draft</span>
          </button>

          {/* DEPLOY WORKFLOW BUTTON WITH CONTEXTUAL TIP */}
          <DeployButtonWithTip workspace={workflow?.workspace || 'support'} align="end">
            <button
              id="deploy-workflow-canvas-btn"
              onClick={() => {
                if (onSaveWorkflow && workflow) {
                  onSaveWorkflow({ ...workflow, status: 'active' });
                }
                if (onSimulateRun && workflow) {
                  onSimulateRun(workflow.id);
                }
              }}
              className="btn-primary text-xs h-9 px-4"
              title="Deploy workflow pipeline to active operational runtime"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Deploy Workflow</span>
            </button>
          </DeployButtonWithTip>
        </div>
      </div>

      {/* Main Builder Grid: Left Palette + Canvas + Right Inspector */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT PALETTE: ADD WORKFLOW NODE */}
        <div className="w-64 md:w-72 bg-[#0E1015] border-r border-white/[0.08] p-4 space-y-4 flex flex-col shrink-0 z-20">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-1">
              Add Workflow Node
            </h3>
            <p className="text-[11px] text-white/40">Click to add nodes to customize pipeline logic.</p>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
            {/* Trigger Node Option */}
            <button
              onClick={() => handleAddNodeFromPalette('trigger')}
              className="w-full text-left bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-sky-500/40 p-3 rounded-2xl transition-all group cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Trigger</h4>
                  <p className="text-[10px] text-white/40 font-mono">Event starter</p>
                </div>
              </div>
            </button>

            {/* AI Agent Node Option */}
            <button
              onClick={() => handleAddNodeFromPalette('ai_agent')}
              className="w-full text-left bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-indigo-500/40 p-3 rounded-2xl transition-all group cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">AI Agent</h4>
                  <p className="text-[10px] text-white/40 font-mono">Smart Reasoning</p>
                </div>
              </div>
            </button>

            {/* Human Approval Node Option */}
            <button
              onClick={() => handleAddNodeFromPalette('human_approval')}
              className="w-full text-left bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-[#FFB000]/40 p-3 rounded-2xl transition-all group cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-[#FFB000] border border-amber-500/20">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Human Approval</h4>
                  <p className="text-[10px] text-white/40 font-mono">Safeguard Gate</p>
                </div>
              </div>
            </button>

            {/* Condition Check Node Option */}
            <button
              onClick={() => handleAddNodeFromPalette('condition')}
              className="w-full text-left bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-amber-400/40 p-3 rounded-2xl transition-all group cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Condition</h4>
                  <p className="text-[10px] text-white/40 font-mono">Branch Logic</p>
                </div>
              </div>
            </button>

            {/* Action Node Option */}
            <button
              onClick={() => handleAddNodeFromPalette('action')}
              className="w-full text-left bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-emerald-500/40 p-3 rounded-2xl transition-all group cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-[#22D3A7] border border-emerald-500/20">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Action</h4>
                  <p className="text-[10px] text-white/40 font-mono">API Execution</p>
                </div>
              </div>
            </button>
          </div>

          {/* Palette Footer Stats */}
          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-white/40">
            <span>Graph Nodes:</span>
            <span className="text-[#FFB000] font-semibold">{nodes.length} Configured</span>
          </div>
        </div>

        {/* CENTER INTERACTIVE GRAPH CANVAS */}
        <div
          ref={canvasRef}
          onMouseMove={handleMouseMoveCanvas}
          onMouseUp={handleMouseUpCanvas}
          className="flex-1 relative overflow-hidden bg-[#08090D] cursor-grab active:cursor-grabbing select-none"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        >
          {/* Active port helper notice */}
          {activePortFrom && (
            <div className="absolute top-4 left-4 z-30 bg-amber-500/20 border border-amber-500/50 text-[#FFB000] px-4 py-2 rounded-xl text-xs font-mono font-bold animate-bounce shadow-lg">
              Click a target node port to connect wire...
            </div>
          )}

          {/* SIMULATION STATUS FLOATING BANNER */}
          {simStatus === 'running' && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-[#0E1015] border border-[#FFB000]/40 px-4 py-2 rounded-2xl flex items-center space-x-2 text-xs font-mono text-[#FFB000] shadow-xl animate-pulse">
              <Sparkles className="w-4 h-4 text-[#FFB000]" />
              <span>Simulating Step {simStepIndex + 1} of {nodes.length}...</span>
            </div>
          )}

          {simStatus === 'gate_paused' && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-[#0E1015] border border-amber-500/60 px-5 py-2.5 rounded-2xl flex items-center space-x-3 text-xs font-mono text-[#FFB000] shadow-xl animate-bounce">
              <ShieldAlert className="w-4 h-4 text-[#FFB000]" />
              <span className="font-semibold">Human Approval Gate Reached</span>
              <button
                onClick={handleApproveGate}
                className="px-3 py-1 rounded-xl bg-[#FFB000] hover:bg-amber-300 text-[#08090D] font-bold text-[10px] uppercase tracking-wider cursor-pointer"
              >
                Approve &amp; Continue
              </button>
            </div>
          )}

          {simStatus === 'completed' && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-[#0E1015] border border-emerald-500/40 px-5 py-2.5 rounded-2xl flex items-center space-x-3 text-xs font-mono text-[#22D3A7] shadow-xl">
              <CheckCircle2 className="w-4 h-4 text-[#22D3A7]" />
              <span className="font-semibold">Graph Simulation Completed Successfully</span>
              <button
                onClick={handleResetSimulation}
                className="px-3 py-1 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white font-semibold text-[10px] uppercase tracking-wider cursor-pointer border border-white/[0.08]"
              >
                Reset
              </button>
            </div>
          )}

          {/* SVG WIRE CONNECTORS OVERLAY */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <marker
                id="arrow-dotted-completed"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#22D3A7" />
              </marker>
              <marker
                id="arrow-dotted-default"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#64748b" />
              </marker>
              <marker
                id="arrow-dotted-active"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#FFB000" />
              </marker>
            </defs>
            {wires.map((wire) => {
              const fromNode = nodes.find((n) => n.id === wire.fromNodeId);
              const toNode = nodes.find((n) => n.id === wire.toNodeId);
              if (!fromNode || !toNode) return null;

              // Compute ports (right of fromNode, left of toNode)
              const x1 = fromNode.x + 240;
              const y1 = fromNode.y + 50;
              const x2 = toNode.x;
              const y2 = toNode.y + 50;

              // Curved bezier path
              const dx = Math.abs(x2 - x1) * 0.5;
              const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

              const isCompleted = fromNode.status === 'completed';
              const isRunning = fromNode.status === 'running' || toNode.status === 'running';

              const markerId = isRunning
                ? 'arrow-dotted-active'
                : isCompleted
                ? 'arrow-dotted-completed'
                : 'arrow-dotted-default';

              return (
                <g key={wire.id}>
                  {/* Outer line (Dotted) */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isRunning ? '#FFB000' : isCompleted ? '#22D3A7' : '#334155'}
                    strokeWidth="2.5"
                    strokeOpacity={isRunning ? '0.9' : isCompleted ? '0.6' : '0.4'}
                    strokeDasharray="4 4"
                    className={isRunning ? 'animate-pulse' : ''}
                  />
                  {/* Inner line with Arrowhead Marker */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isRunning ? '#FFB000' : isCompleted ? '#22D3A7' : '#64748b'}
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    markerEnd={`url(#${markerId})`}
                  />
                  {/* Origin connecting port dot */}
                  <circle
                    cx={x1}
                    cy={y1}
                    r="4"
                    fill={isRunning ? '#FFB000' : isCompleted ? '#22D3A7' : '#64748b'}
                    stroke="#08090D"
                    strokeWidth="1.5"
                  />
                </g>
              );
            })}
          </svg>

          {/* CANVAS NODES */}
          {nodes.map((node, idx) => {
            const styling = getNodeBorderAndColor(node.type);
            const isSelected = selectedNodeId === node.id;
            const isRunning = node.status === 'running';
            const isCurrentSimNode = simStepIndex === idx;

            return (
              <div
                key={node.id}
                onMouseDown={(e) => handleMouseDownNode(e, node.id)}
                style={{ left: `${node.x}px`, top: `${node.y}px` }}
                className={`absolute w-60 rounded-2xl p-3.5 border transition-all cursor-grab active:cursor-grabbing z-10 ${
                  styling.bg
                } ${styling.border} ${
                  isSelected
                    ? 'ring-2 ring-[#FFB000] shadow-xl'
                    : 'shadow-xl'
                } ${
                  isRunning || (isCurrentSimNode && simStatus === 'running')
                    ? 'animate-pulse ring-2 ring-[#FFB000]'
                    : ''
                }`}
              >
                {/* Port Connection Dots (Left and Right) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePortClick(node.id);
                  }}
                  className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#FFB000] border-2 border-[#08090D] hover:scale-125 transition-transform cursor-pointer shadow-md"
                  title="Connect Wire Port"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePortClick(node.id);
                  }}
                  className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#FFB000] border-2 border-[#08090D] hover:scale-125 transition-transform cursor-pointer shadow-md"
                  title="Connect Wire Port"
                />

                {/* Node Header Pill & Status Badge */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${styling.badgeBg}`}
                  >
                    {node.type.replace('_', ' ')}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRunFromNode(node.id);
                      }}
                      title="Run simulation from this node"
                      className="p-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-[#FFB000] transition-colors cursor-pointer"
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                    </button>
                    <StatusBadge status={node.status} size="xs" />
                  </div>
                </div>

                {/* Title & Subtitle */}
                <h4 className="text-xs font-semibold text-white tracking-tight leading-snug">
                  {node.title}
                </h4>
                <p className="text-[10px] text-white/50 leading-relaxed mt-0.5 font-sans line-clamp-2">
                  {node.subtitle}
                </p>

                {/* Output Snippet if available */}
                {node.output && (
                  <div className="mt-2 p-1.5 rounded-lg bg-black/40 border border-white/[0.04] font-mono text-[9px] text-white/60 truncate">
                    {node.output}
                  </div>
                )}

                {/* Inline Gate Approval button if awaiting approval in simulation */}
                {node.status === 'awaiting_approval' && (
                  <div className="mt-2 pt-2 border-t border-amber-500/30">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApproveGate();
                      }}
                      className="w-full py-1.5 rounded-xl bg-[#FFB000] hover:bg-amber-300 text-[#08090D] font-bold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center space-x-1 cursor-pointer active:scale-95"
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Approve Gate</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* RIGHT DRAWER: SELECTED NODE INSPECTOR */}
        {selectedNode && (
          <div className="w-64 md:w-[270px] bg-[#0E1015] border-l border-white/[0.08] p-3.5 space-y-3.5 flex flex-col z-20 animate-in slide-in-from-right duration-200 shadow-2xl shrink-0">
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.08]">
              <div className="flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#FFB000]" />
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white">
                  Node Inspector
                </h3>
              </div>
              <button
                onClick={() => setSelectedNodeId(null)}
                className="p-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white transition-colors cursor-pointer"
                title="Close Inspector"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Status & Type Pills */}
            <div className="flex items-center justify-between gap-1.5 px-0.5">
              <span className="text-[9px] font-mono font-semibold uppercase px-2 py-0.5 rounded-md bg-white/[0.06] text-white/70 border border-white/[0.08] truncate">
                {selectedNode.type.replace('_', ' ')}
              </span>
              <StatusBadge status={selectedNode.status} size="xs" />
            </div>

            {/* Inspector Form Fields */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase font-bold text-white/50 block tracking-wider">
                  Node Title
                </label>
                <input
                  type="text"
                  value={selectedNode.title}
                  onChange={(e) =>
                    setNodes((prev) =>
                      prev.map((n) => (n.id === selectedNode.id ? { ...n, title: e.target.value } : n))
                    )
                  }
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[11px] text-white font-mono focus:outline-none focus:border-[#FFB000]/60 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase font-bold text-white/50 block tracking-wider">
                  Subtitle / Logic
                </label>
                <textarea
                  rows={2}
                  value={selectedNode.subtitle}
                  onChange={(e) =>
                    setNodes((prev) =>
                      prev.map((n) =>
                        n.id === selectedNode.id ? { ...n, subtitle: e.target.value } : n
                      )
                    )
                  }
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[10px] text-white/80 font-mono focus:outline-none focus:border-[#FFB000]/60 resize-none transition-colors leading-normal"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase font-bold text-white/50 block tracking-wider">
                  Assigned Agent Role
                </label>
                <select
                  value={selectedNode.role}
                  onChange={(e) =>
                    setNodes((prev) =>
                      prev.map((n) =>
                        n.id === selectedNode.id
                          ? { ...n, role: e.target.value as AgentRole }
                          : n
                      )
                    )
                  }
                  className="w-full bg-[#0E1015] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[11px] text-[#FFB000] font-mono focus:outline-none focus:border-[#FFB000]/60 cursor-pointer"
                >
                  <option value="analyst" className="bg-[#0E1015]">Intent Analyst</option>
                  <option value="planner" className="bg-[#0E1015]">Workflow Planner</option>
                  <option value="executor" className="bg-[#0E1015]">Task Executor</option>
                  <option value="tester" className="bg-[#0E1015]">Integration Tester</option>
                  <option value="release_guardian" className="bg-[#0E1015]">Release Guardian</option>
                </select>
              </div>

              {selectedNode.input && (
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase font-bold text-white/50 block tracking-wider">
                    Input Config
                  </label>
                  <div className="p-2 rounded-lg bg-black/40 border border-white/[0.06] text-[10px] font-mono text-white/70 leading-tight truncate">
                    {selectedNode.input}
                  </div>
                </div>
              )}

              {selectedNode.output && (
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase font-bold text-white/50 block tracking-wider">
                    Step Output Payload
                  </label>
                  <div className="p-2 rounded-lg bg-black/40 border border-emerald-500/20 text-[10px] font-mono text-[#22D3A7] leading-relaxed max-h-24 overflow-y-auto break-words">
                    {selectedNode.output}
                  </div>
                </div>
              )}

              {/* Run step action */}
              <button
                onClick={() => handleRunFromNode(selectedNode.id)}
                className="w-full py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white/80 border border-white/[0.08] font-semibold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Simulate From This Node</span>
              </button>
            </div>

            {/* Footer Delete */}
            <div className="pt-2.5 border-t border-white/[0.08]">
              <button
                onClick={() => handleDeleteNode(selectedNode.id)}
                className="w-full py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-semibold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete Node</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
