# OPERON — Autonomous Operations Under Human Control

> **Autonomous Operations, Under Human Control**
> Real-world operations platform for Customer Support, Finance Ops, HR Onboarding, and General Enterprise Operations with built-in human-in-the-loop governance.

---

## 1. System Philosophy & North Star

Traditional Robotic Process Automation (RPA) is rigid, fragile, and breaks at edge cases. Pure Autonomous Agents, conversely, hallucinate and risk catastrophic unvetted financial or database mutations.

**OPERON** provides a unified operating fabric:
1. **Multi-Agent Specialization**: 8 discrete, role-constrained agents collaborate sequentially.
2. **Hard Human Governance**: The **Release Guardian** agent enforces immutable policy boundaries. Any mutation exceeding the configured threshold pauses and requests cryptographically-traceable human sign-off.
3. **Tri-Tier Execution Guardrails**:
   - **DEMO Mode**: Pure simulation with zero external side effects.
   - **SANDBOX Mode**: Test API invocations with invariant check against mock ledgers.
   - **LIVE PRODUCTION**: Real production endpoints guarded by Release Guardian gates and immutable SHA-256 audit trails.

---

## 2. Specialized Agent Workforce

| Agent Role | Codename | Primary Responsibility | Safety Invariant |
| :--- | :--- | :--- | :--- |
| **Intent Analyst** | `analyst` | Intent extraction, sentiment parsing, entity classification | Read-only; zero database write access |
| **Context Memory** | `memory` | Historical customer retrieval, tenure checks, context synthesis | Ephemeral scratchpad + vector lookup |
| **Fraud & Anomaly Sentinel** | `fraud_sentinel` | Velocity anomaly detection, risk scoring (0-100) | Escalates risk $\ge 70$ immediately to Human Lead |
| **Workflow Planner** | `planner` | DAG execution planning, dependency ordering, policy calculation | Generates verifiable execution graph |
| **Release Guardian** | `release_guardian` | Hard policy enforcement, monetary cap checks, human gate hold | **Immutable Barrier**: Never allows mutation without human signature if criteria breached |
| **Task Executor** | `executor` | Transaction execution, API mutation, database writes | Only executes if validated token or human signature exists |
| **Validation Tester** | `tester` | Post-execution invariant checks, reconciliation, error detection | Can trigger auto-rollback on failure |
| **Recovery Sentry** | `recovery_sentry` | Rollback compensation, transaction reversals, alert dispatch | Executes compensation actions upon anomaly |

---

## 3. Workspaces & Operational Domains

1. **Customer Support Operations (`support`)**:
   - High-volume refund triage, duplicate charge reconciliation, churn prevention credits.
   - Default Auto-Refund Threshold: **$100.00 USD**.

2. **Finance & Accounting Operations (`finance`)**:
   - Multi-vendor invoice matching, tax validation, wire release approvals.
   - Default High-Value Gate: **$1,000.00 USD**.

3. **HR & Provisioning Operations (`hr`)**:
   - New hire equipment provisioning, Okta role assignment, elevated privilege requests.
   - Default Security Gate: **Elevated Access Review**.

4. **General Enterprise Operations (`operations`)**:
   - Inventory discrepancy reconciliation, SLA breach monitoring, emergency rollbacks.

---

## 4. Immutable Audit Trail & Provenance

Every decision, consensus vote, policy check, human sign-off, and API mutation produces a structured `AuditLogEntry` containing:
- **Timestamp & Actor ID**: Exact second and operator provenance.
- **SHA-256 Checksum**: Cryptographic digest sealing execution context (`sha256:appr_...`).
- **Policy Rule ID**: Explicit rule code triggered (e.g. `RULE_AUTO_REFUND_LIMIT`).
- **Execution Latency**: Microsecond-level runtime telemetry.

---

## 5. Development & Runtime Guidelines

- **Port Configuration**: Port 3000 (0.0.0.0 host binding).
- **Styling Architecture**: Tailwind CSS with Restrained Liquid Glass design tokens (`#08090D` dark background, `#FFB000` human amber accents, `#22D3A7` verified emerald, and `#5EA0FF` sandbox blue).
- **State Management**: Zero extraneous dependencies; reactive state store with live replay simulation, batch approvals, and telemetry.
