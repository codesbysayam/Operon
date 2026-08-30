# OPERON System Architecture

```
                                  ┌────────────────────────┐
                                  │   Human Operator UI    │
                                  │ (Decision Center & Cmd) │
                                  └───────────┬────────────┘
                                              │  Approve / Reject / Config
                                              ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                      OPERON Orchestration Engine                          │
│                                                                           │
│   ┌─────────────────┐       ┌─────────────────┐       ┌───────────────┐   │
│   │ 1. Intent       │  ──>  │ 2. Context      │  ──>  │ 3. Fraud      │   │
│   │    Analyst      │       │    Memory       │       │    Sentinel   │   │
│   └─────────────────┘       └─────────────────┘       └───────┬───────┘   │
│                                                               │           │
│   ┌─────────────────┐       ┌─────────────────┐               │           │
│   │ 5. Release      │  <──  │ 4. Workflow     │  <────────────┘           │
│   │    Guardian     │       │    Planner      │                           │
│   └────────┬────────┘       └─────────────────┘                           │
│            │                                                              │
│            ├─── [Breaches Policy Cap?] ──> [HUMAN APPROVAL GATE (Paused)] │
│            │                                          │                   │
│            └─── [Autonomous Approved] ────────────────┼─── [Signed Off]   │
│                                                       │                   │
│                                                       ▼                   │
│   ┌─────────────────┐       ┌─────────────────┐       ┌───────────────┐   │
│   │ 8. Recovery     │  <──  │ 7. Validation   │  <──  │ 6. Task       │   │
│   │    Sentry       │       │    Tester       │       │    Executor   │   │
│   └─────────────────┘       └─────────────────┘       └───────────────┘   │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
             ┌──────────────────────────────────────────────────┐
             │       Immutable Audit Trail (SHA-256 Hashes)     │
             │           Stripe / Okta / Ledger Adapters        │
             └──────────────────────────────────────────────────┘
```

---

## 1. Architectural Principles

1. **Deterministic Execution Graph**:
   Workflows are represented as ordered Directed Acyclic Graphs (DAGs). Each step is authored by a specialized agent with strict inputs, outputs, confidence score, and latency telemetry.

2. **Zero Unvetted Mutation**:
   The **Task Executor** is decoupled from the analysis agents. No execution token is minted unless:
   - The case is below the strict Policy Cap (e.g. $\le \$100.00$) **AND** Fraud Risk is low (< 30), OR
   - A cryptographically validated human authorization signature is appended.

3. **Multi-Tier Execution Mode Isolation**:
   - **DEMO Mode**: Completely client/server-simulated. Safe for walkthroughs and presentations.
   - **SANDBOX Mode**: Connects to test APIs (e.g., Stripe Test Mode, Okta Preview) with invariant validation.
   - **LIVE Mode**: Production endpoints guarded by mandatory double-confirmation modals and immutable audit logging.

4. **Cryptographic Audit Provenance**:
   Every state transition computes a SHA-256 immutable checksum sealing the payload, actor identity, timestamp, and policy rule ID.
