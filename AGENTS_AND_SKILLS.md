# OPERON — Agent Workforce & Skill Registry

This document details the 8 specialized agents, their capabilities, tool bindings, decision thresholds, and runtime safety constraints within the OPERON platform.

---

## Agent Registry & Capabilities

### 1. Intent Analyst (`agent_analyst_01`)
- **Role**: `analyst`
- **Domain**: Natural Language Understanding, Intent Extraction, Sentiment & Priority Tagging.
- **Tools**:
  - `intent_classify(payload, context)`: Maps raw customer inquiries to standard operational actions.
  - `sentiment_evaluate(text)`: Measures urgency, satisfaction, and frustration indicators.
- **Invariants**: Read-only access; cannot emit side effects or call external financial endpoints.

### 2. Context Memory (`agent_memory_02`)
- **Role**: `memory`
- **Domain**: Historical Memory Retrieval, Account Tenure, Past Transactions & Disputed Records.
- **Tools**:
  - `fetch_customer_history(customer_id)`: Retrieves subscription tier, LTV, and historical disputes.
  - `retrieve_interaction_embeddings(query, limit)`: Semantic search over past support tickets.
- **Invariants**: Ephemeral scratchpad storage only; personal identifiers masked in logs.

### 3. Fraud & Anomaly Sentinel (`agent_fraud_03`)
- **Role**: `fraud_sentinel`
- **Domain**: Anomaly Detection, Velocity Checks, IP Geolocation, Risk Scoring (0–100).
- **Tools**:
  - `calculate_risk_score(transaction, customer_profile)`: Calculates composite risk index.
  - `check_velocity_limits(account_id, time_window)`: Flags rapid successive refund requests.
- **Thresholds**:
  - Score < 30: **LOW RISK** (Eligible for autonomous pipeline).
  - Score 30–69: **MEDIUM RISK** (Requires multi-agent consensus).
  - Score $\ge$ 70: **HIGH RISK** (Mandatory Human Sign-off escalation).

### 4. Workflow Planner (`agent_planner_04`)
- **Role**: `planner`
- **Domain**: DAG Execution Plan Construction, Dependency Graph Resolution, Policy Pre-calculation.
- **Tools**:
  - `build_execution_graph(intent, workspace)`: Generates ordered pipeline steps.
  - `evaluate_policy_rules(action, amount, limits)`: Pre-evaluates monetary and security caps.
- **Invariants**: Verifies all required input parameters before scheduling downstream execution.

### 5. Release Guardian (`agent_guardian_05`)
- **Role**: `release_guardian`
- **Domain**: Hard Policy Boundary Enforcement, Human Approval Gate Management, Security Verification.
- **Tools**:
  - `enforce_policy_gate(case_payload, config)`: Evaluates whether mutation breaches threshold.
  - `request_human_authorization(case_id, evidence)`: Dispatches decision card to Human Decision Center.
- **Safety Invariant**: **Zero Bypass Guarantee**. The engine halts execution graph whenever transaction amount > `autoRefundLimit` or risk > `fraudEscalationThreshold`.

### 6. Task Executor (`agent_executor_06`)
- **Role**: `executor`
- **Domain**: API Mutations, Gateway Invocation (Stripe, QuickBooks, Okta, Jira), Database Writes.
- **Tools**:
  - `execute_refund(charge_id, amount, reason)`: Initiates payment gateway refund.
  - `provision_access(user_id, role, duration)`: Updates IAM access tokens.
- **Prerequisite**: Requires either a cryptographically signed human authorization token OR a verified autonomous release certificate from Release Guardian.

### 7. Validation Tester (`agent_tester_07`)
- **Role**: `tester`
- **Domain**: Post-execution Invariant Checks, Response Code Verification, Ledger Reconciliation.
- **Tools**:
  - `verify_ledger_balance(account_id, expected_delta)`: Validates double-entry ledger state.
  - `assert_http_response(response_object)`: Checks external gateway response status.
- **Failure Handling**: Dispatches immediate signal to `Recovery Sentry` if response code $\ne 200$.

### 8. Recovery Sentry (`agent_recovery_08`)
- **Role**: `recovery_sentry`
- **Domain**: Compensating Transactions, Automated Rollbacks, Incident Alerting.
- **Tools**:
  - `execute_rollback(transaction_id, compensation_plan)`: Reverses partial operations.
  - `notify_operations_lead(incident_payload)`: Sends high-priority pager notifications.
