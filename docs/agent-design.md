# Multi-Agent Pipeline Design & Coordination

OPERON orchestrates 8 specialized autonomous agents using a stateful Directed Acyclic Graph (DAG) with strict safety boundaries.

---

## The 8-Agent Pipeline Flow

```
[Customer Input / Webhook Event]
                │
                ▼
      1. INTENT ANALYST
         - Extracts intent type, sentiment, priority, and entity parameters.
         - Confidence Target: > 95%
                │
                ▼
      2. CONTEXT MEMORY
         - Pulls customer account tenure, lifetime value (LTV), and past dispute counts.
         - Enriches context object.
                │
                ▼
      3. FRAUD & ANOMALY SENTINEL
         - Calculates multi-factor risk score (0–100).
         - Checks transaction velocity and known anomaly patterns.
                │
                ▼
      4. WORKFLOW PLANNER
         - Synthesizes intent + context + risk into an execution strategy.
         - Validates required parameters and assigns workspace policy rules.
                │
                ▼
      5. RELEASE GUARDIAN (Policy Gate)
         - Enforces monetary caps (e.g. $100 auto-refund threshold).
         - If criteria exceeded -> PAUSES execution and routes to Human Approval Gate.
         - If criteria met -> Grants Autonomous Release Certificate.
                │
        ┌───────┴───────┐
        ▼               ▼
 [PAUSED FOR HUMAN] [AUTONOMOUS APPROVED]
        │               │
        └───────┬───────┘
                ▼
      6. TASK EXECUTOR
         - Executes authorized API mutation against payment gateway or IAM service.
         - Mints immutable transaction hash.
                │
                ▼
      7. VALIDATION TESTER
         - Verifies post-execution invariants (HTTP 200, balance reconciliation).
         - Signals completion or triggers recovery.
                │
                ▼
      8. RECOVERY SENTRY (Fallback / Compensation)
         - In case of invariant check failure, executes compensating rollback transaction.
```

---

## Agent Consensus & Confidence Formulation

Each agent outputs an individual confidence score $C_i \in [0, 100]$. The overall pipeline confidence $C_{total}$ is computed as a weighted harmonic mean:

$$C_{total} = \sum_{i=1}^{n} w_i \cdot C_i$$

Where weights are distributed based on critical safety impact:
- Release Guardian: $w = 0.30$
- Fraud Sentinel: $w = 0.25$
- Intent Analyst: $w = 0.20$
- Context Memory: $w = 0.15$
- Workflow Planner: $w = 0.10$
