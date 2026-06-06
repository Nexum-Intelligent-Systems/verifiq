# 02 · Agent Architecture

**Use:** Defines the multi-agent Council structure. Reference when wiring agent orchestration.

---

VerifIQ operates as a virtual **Pre-Build Compliance Council**.

The system is not a single reviewer. It is a coordinated set of discipline-specific agents that review, challenge, adjudicate and consolidate findings.

---

## Core agents

### 1. Project Intake Agent

Classifies the project, stage, building type, regulatory triggers and required modules.

### 2. Document Classification Agent

Classifies uploaded files by discipline, document type, revision, date and project stage.

### 3. Regulatory Trigger Agent

Determines which statutory, regulatory and specialist modules apply.

### 4. Discipline Review Agents

Each discipline reviews its own evidence and identifies compliance gaps, missing information, coordination issues, tender risks and build-readiness blockers.

**Discipline Review Agents:**

- Architect Agent
- Fire Safety Agent
- DAC / Accessibility Agent
- Mechanical Agent
- Electrical Agent
- Structural Agent
- Civil Agent
- Planning Agent
- Landscape Agent
- Conservation Agent
- PSDP Agent
- Assigned Certifier / BCAR Agent
- Design Certifier Agent
- Quantity Surveyor Agent
- Contractor / Contracts Manager Agent
- Process / Specialist Systems Agent
- Lift Agent
- Sector Regulator Agent

### 5. Peer Challenge Agent

Challenges findings between disciplines.

### 6. Adjudicator Agent

Removes weak findings, merges duplicates, corrects risk ratings and assigns owners.

### 7. Council Chair Agent

Produces one final coordinated Build Readiness Report.

---

## Multi-LLM configuration

For each discipline module:

- **Primary Reviewer:** first LLM reviews the evidence.
- **Challenge Reviewer:** second LLM challenges assumptions and missing evidence.
- **Adjudicator:** third LLM verifies, downgrades, escalates or removes findings.

Final outputs are **not** raw model opinions.
Final outputs are **adjudicated council findings**.

### Recommended initial wiring

| Role | Provider | Model | Rationale |
|---|---|---|---|
| Document classification | Anthropic | Claude Haiku | Cheap, fast, low-stakes |
| Discipline Primary Review | Anthropic | Claude Sonnet | High capability, prompt caching for system prompts |
| Peer Challenge | OpenAI | GPT-4-class | Different model family avoids shared blind spots |
| Adjudicator | Anthropic | Claude Opus (or Sonnet with explicit adjudicator system prompt) | Highest reasoning capacity, final gate |
| Council Chair | Anthropic | Claude Sonnet | Cost-controlled report generation |

### Fallback chain

If primary provider is unavailable mid-review, retry with secondary. If both fail, hold the pack in reviewer queue rather than ship degraded output.

### Provider abstraction

Implement a provider-agnostic adapter so any agent role can be reassigned to a different provider without code changes. Configuration via environment variables or admin UI.
