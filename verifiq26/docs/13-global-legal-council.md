# VerifIQ — Global Legal Council

**Doc ID:** `verifiq-legal-v0.1`  
**Status:** Strategic position paper · NOT legal advice · Must be reviewed by qualified solicitors in each jurisdiction before deployment  
**Purpose:** Define a legally defensible posture for VerifIQ as a verification / checking / guidance tool — not a certification, not a professional opinion, not a regulated service — across Ireland, UK, EU, Australia, Canada, and the United States.  
**Format:** Eight voices, each speaking from a defined jurisdiction or speciality, then a consolidated locked-language schedule that governs every customer-facing surface.  
**Date:** 2026-06-01

---

## The single principle that holds everything together

> *VerifIQ is a software-based reading aid. It surfaces, in the documents' own words, what a registered professional may wish to read closely. It does not certify, sign, opine, or substitute for professional judgement. The registered designer reads our output, exercises their own judgement, verifies locally, and signs. The professional indemnity remains theirs. We carry product-quality risk only.*

That sentence governs every clause, every disclaimer, every marketing claim, and every reviewer interaction in every market. If something we say cannot fit inside it, we do not say it.

---

## The Council

1. **Coordinating Counsel — Ireland** (Chair)
2. **Senior Solicitor — England & Wales**
3. **Rechtsanwalt — Germany & EU AI Act**
4. **Solicitor — Australia (NSW & Federal)**
5. **Avocat / Barrister — Canada (Ontario, Quebec)**
6. **Attorney — United States (NY, CA, multistate)**
7. **Professional Indemnity & E&O Specialist** (cross-jurisdiction)
8. **Data Protection & GDPR Specialist** (EU/UK/global)

Each voice answers four questions: *(a) What is the principal legal risk for VerifIQ in this jurisdiction? (b) What language defends against it? (c) What can we never say? (d) What insurance does this jurisdiction require us to carry?*

---

## I · Coordinating Counsel — Ireland (Chair)

**Principal risks:**

1. **Building Control Act 1990 + BCAR SI 9/2014.** Statutory roles of Assigned Certifier and Design Certifier are tightly defined. If VerifIQ output is presented as discharging those roles, we are operating an unauthorised regulated service. The Act provides for criminal liability against the certifier and the body advising them.
2. **Architects Act 2007 + Building Control Act 2007.** The titles "architect," "architectural technologist," "quantity surveyor," and "building surveyor" are protected. Using them in marketing in a way that implies we provide their services is an offence under s.17 of the 2007 Act.
3. **Sale of Goods and Supply of Services Act 1980.** Implies that services are provided with "due skill, care, and diligence." Any output we ship is a service subject to this implied condition. We can limit but not exclude it for B2B; we cannot exclude it for consumers (sole-practitioner architects working under a personal name may, in some cases, be treated as consumers — confirm at engagement).
4. **Consumer Protection Act 2007.** Prohibits misleading commercial practices. Saying "our tool verifies your design" is a misleading practice if "verifies" is read in the regulatory sense. Use "checks," "surfaces," "indicates" instead.
5. **Misrepresentation in advertising.** RIAI, Engineers Ireland, SCSI all have codes of conduct that members are bound by; a member who relies on VerifIQ for representations to a client may be in breach if our output is wrong and our marketing implied authority.

**Defensive language (Ireland-locked):**

- "**VerifIQ is a software-based design-review aid. It is not a regulated service under the Building Control Act 1990 or the Architects Act 2007. It does not act as Design Certifier, Assigned Certifier, or any other person to whom statutory functions are assigned. It does not constitute the provision of architectural, engineering, surveying, or fire-safety services within the meaning of the relevant Acts.**"
- "**All output is indicative.** The registered professional reads it, applies their own judgement, verifies locally against the source documents and applicable standards, and signs. VerifIQ's role ends at producing reading aids; the professional's role and statutory responsibility continue unchanged."

**What we can never say in Ireland:**

- "We verify your design." → say "We check your pack against standards we have indexed."
- "Our reviewers certify the work." → say "Our reviewers review the AI output for quality and consistency before release."
- "BCAR-compliant." → say "We help you check whether your documents reference BCAR-relevant clauses."
- "Our tool replaces design review." → say "Our tool augments — it does not replace."

**Insurance required:** Tech E&O minimum €2m, professional indemnity €1m, cyber €1m, general liability €2.5m. Public liability if we hold any physical event.

---

## II · Senior Solicitor — England & Wales

**Principal risks:**

1. **Building Safety Act 2022 (BSA).** This is the dominant new risk. The Act creates statutory duty-holder roles (Principal Designer, Principal Contractor, Accountable Person for higher-risk buildings) with significant civil and criminal exposure. Operating in a way that implies VerifIQ has taken on or supported a duty-holder role under the BSA exposes us to investigation by the Building Safety Regulator and to claims by clients, occupants, or insurers if a finding turns out to be wrong on a higher-risk building.
2. **Architects Act 1997.** The title "architect" is statutorily protected by the Architects Registration Board (ARB). Marketing must not imply we are architects, employ architects in that capacity, or provide architectural services.
3. **Defective Premises Act 1972 (s.1) + Building Act 1984.** Anyone "taking on work" in connection with the provision of a dwelling has a statutory duty that the work is done in a workmanlike manner. We must not "take on work" — we must provide information only.
4. **Consumer Rights Act 2015.** Section 49 implies "reasonable skill and care" into services. Limitable but not excludable. Unfair Contract Terms Act 1977 limits exclusions in B2B contracts too.
5. **Misrepresentation Act 1967.** Pre-contract statements (marketing, demos, sales calls) can ground a misrepresentation claim. "Our tool finds everything" type language is dangerous.

**Defensive language (UK-locked):**

- "**VerifIQ provides a software-based reading aid. It does not act as Principal Designer, Principal Contractor, Building Safety Coordinator, or any other duty-holder under the Building Safety Act 2022 or the Building Regulations 2010. It does not provide architectural services as defined in the Architects Act 1997. The registered professional retains all statutory and contractual responsibility for the design and its certification.**"
- "**The output is information, not a service taken on in respect of any building. The registered professional verifies all findings against the source documents and applicable Approved Documents before relying on them.**"

**What we can never say in UK:**

- Anything implying competence or coverage under the Building Safety Act.
- "ARB-approved," "RIBA-certified," "ICE-accredited," "RICS-regulated" — without an actual relationship.
- "Higher-risk building ready" or any phrase that implies BSA Gateway readiness.
- "Approved Document compliant" — the user achieves compliance; we provide reading aids.

**Insurance required (UK):** Tech E&O £2m minimum, with a Building Safety Act exclusion endorsement reviewed against the BSA carve-outs (most UK PI policies are still adjusting to the Act). Cyber £2m. General liability £5m. **The BSA is the single biggest reason to be cautious about UK timing.**

---

## III · Rechtsanwalt — Germany & EU AI Act

**Principal risks:**

1. **EU AI Act 2024.** Annex III categorises AI systems used in critical infrastructure (including the *management and operation of critical digital infrastructure*) and certain safety components of products as "high-risk." Construction-document scanning that influences building-safety decisions may be argued to fall within Annex III if downstream use is safety-critical (higher-risk residential, healthcare, infrastructure). High-risk classification triggers obligations: risk management system, data governance, technical documentation, record-keeping, transparency to deployers, human oversight, accuracy/robustness/cybersecurity. Penalties up to €35m or 7% of global turnover.
2. **EU Product Liability Directive 2024 (revised).** Software, including AI systems, is now expressly within the PLD. A defective software product causing damage to a person or property gives rise to strict liability for the producer. Disclaimers and TOS do not negate strict PLD liability. We must focus on *not being defective* — quality, testing, version-control, version-stamping.
3. **GDPR.** Customer documents contain personal data (names of designers, addresses, in healthcare packs potentially patient-related metadata). Data Processing Agreements (DPAs) with each customer are mandatory.
4. **German Architects Acts (state-by-state — Architektengesetz).** "Architekt" is title-protected per state. Marketing must respect Bundesarchitektenkammer rules.
5. **Consumer protection (Verbraucherschutz)** — much like Ireland and UK, terms must be transparent and balanced.

**Defensive language (EU AI Act–locked):**

- "**VerifIQ is provided as a general-purpose document-reading aid. It is not designed for, marketed for, or intended for use as a safety component of a product or system under Article 6 of the EU AI Act 2024. The output is informational and the registered professional alone determines whether and how to use any finding. Where a deployer in a high-risk context wishes to use VerifIQ output as an input to a safety-critical decision, they remain solely responsible for assessing the suitability and accuracy of the output in their specific context.**"
- We must also publish: a technical documentation file (Article 11 of the AI Act), an instruction-for-use document (Article 13), a register of the systems used, and a transparency notice to deployers about model classification and known limitations.

**What we can never say in EU:**

- "Safety-critical certification."
- "Fully compliant with the AI Act" (compliance is per deployer's use, not per provider's claim alone).
- "Replaces the need for technical inspection."
- Any output presented as a decision rather than information.

**Insurance required (EU):** Tech E&O minimum €5m given PLD strict-liability exposure. AI-specific endorsement covering Article-6 high-risk eventuality. Cyber €2m. Product liability cover including digital products. GDPR fines are generally not insurable; budget separately.

---

## IV · Solicitor — Australia (NSW & Federal)

**Principal risks:**

1. **Australian Consumer Law (ACL).** Consumer guarantees in ss.60–62 (services must be rendered with due care and skill, fit for purpose) cannot be excluded for consumers and cannot be excluded in B2B contracts where the contract is under AU$100k (in many cases — confirm with NSW counsel). Misleading or deceptive conduct under s.18 is the broad sword used in tech marketing claims; "AI verifies your design" is high-risk.
2. **Design and Building Practitioners Act 2020 (NSW).** Statutory duty of care owed by anyone who carries out "construction work" — broadly defined. Suppliers of guidance services that influence construction work are arguably within scope. Liability runs to subsequent owners. Cannot be contracted out of.
3. **Building Practitioners Act per state (VIC, QLD).** Registration requirements for design practitioners. Implying we are a registered practitioner is an offence.
4. **National Construction Code.** Compliance with NCC is the practitioner's obligation. We must position as a reading aid against NCC clauses we have indexed, not as a compliance check.
5. **Privacy Act 1988 + Australian Privacy Principles (APP) 8.** Cross-border disclosure of personal information requires consent or contractual binding. Australian customer data must remain in AU regions or be subject to APP 8 binding.

**Defensive language (Australia-locked):**

- "**VerifIQ is a software-based design-review aid. It does not perform any function reserved to a registered design practitioner under the Design and Building Practitioners Act 2020 (NSW) or any equivalent State legislation. The registered practitioner retains all statutory duties, including the statutory duty of care under section 37 of the DBP Act, and is solely responsible for verifying findings against source documents and applicable codes before relying on them.**"
- ACL compliance: cannot exclude consumer guarantees, but can clearly state what the service is and is not, define limitation of liability in line with ACL exceptions, and make the indicative nature of output prominent.

**What we can never say in Australia:**

- "DBP-compliant" or "DBP-ready."
- "AI verifies your code compliance."
- "Replaces the need for a registered design practitioner."
- "Best in class" / "guaranteed" / absolute claims without substantiation under s.18 ACL.

**Insurance required (AU):** Tech E&O minimum AU$5m. Public liability AU$10m if any in-market engagement. DBP-Act-relevant cover should be discussed with broker; most policies are still defining their position. Privacy Act statutory damages are not insurable.

---

## V · Avocat / Barrister — Canada (Ontario, Quebec)

**Principal risks:**

1. **Provincial Architects Acts (e.g., Ontario Architects Act).** Practice of architecture is reserved to OAA-licensed members. Software that performs architectural services without supervision is potentially in scope. Title and practice protections vary by province.
2. **Professional Engineers Act (per province; PEO Ontario).** Practice of engineering reserved to PEng members. Engineering opinions, calculations, and certifications are restricted. Output must be clearly differentiated from these.
3. **Ontario Building Code Part 11 + qualifications.** Qualified person designations are restricted. Implying QP status is an offence under the Building Code Act 1992.
4. **Consumer Protection Act 2002 (Ontario)** + provincial equivalents. Unfair practices broadly defined.
5. **PIPEDA (federal) + Quebec Law 25.** Strong consent + data-handling rules. Quebec Law 25 in particular imposes Privacy Officer designation, breach notification, automated-decision disclosure (similar to GDPR Article 22).
6. **Competition Act + advertising standards.** Misleading advertising is enforceable by the Competition Bureau.

**Defensive language (Canada-locked):**

- "**VerifIQ provides software-based reading aids for design documents. It does not practice architecture or engineering as defined under the Ontario Architects Act, Professional Engineers Act, or equivalent legislation in any province. It does not act as a Qualified Person under Part 11 of the Ontario Building Code or under any provincial building regulation. The registered design professional retains sole responsibility for design decisions, code compliance, and certification.**"
- Quebec-specific: privacy notices must be available in French (Charter of the French Language); Privacy Officer must be designated and contactable by Quebec users.

**What we can never say in Canada:**

- "OAA-compliant" or "PEO-endorsed."
- "Qualified Person" in any sense the OBC uses the term.
- "Practices architecture / engineering."
- French marketing in Quebec must be substantively identical and equally prominent, not an afterthought translation.

**Insurance required (Canada):** Tech E&O minimum CA$3m. Cyber CA$2m. Quebec Privacy Officer indemnification if outsourcing. Architects/engineers liability is not insurable for us because we do not practice; do not buy that cover — it implies we do.

---

## VI · Attorney — United States (NY, CA, multistate)

**Principal risks:**

1. **State practice acts.** Every state has an Architecture Practice Act (typically administered by NCARB-affiliated boards) and a Professional Engineering Practice Act. Practicing architecture or engineering without a license is a crime in every state. The line between "providing software that helps" and "practicing" is drawn differently in different states; California and Texas are notably strict.
2. **AIA, NSPE, ASCE codes of ethics.** Our customers will be bound by these; if we induce them to violate them (by encouraging unsupervised reliance), there is reputational and potentially tortious exposure.
3. **FTC Act § 5 + state UDAAP statutes.** Unfair or deceptive acts and practices. "AI verifies" claims have been the subject of recent FTC enforcement actions (the "AI washing" sweep). Substantiation required for performance claims.
4. **State AI laws (NYC Local Law 144; CA SB 1001; Illinois BIPA; Colorado AI Act 2024).** Patchwork. Mostly aimed at automated decision tools in HR, but Colorado covers a broader sweep.
5. **HIPAA (if scanning healthcare facility packs).** If a customer pack contains Protected Health Information (PHI) — even tangentially, in a medical-facility design pack — we may be a Business Associate. Business Associate Agreements (BAAs) required. The exposure is severe.
6. **State privacy laws (CCPA/CPRA, Virginia VCDPA, Connecticut CTDPA, etc.).** Patchwork. Most allow contractual handling.
7. **State construction-code variants.** 50 jurisdictions, plus municipal amendments. Misstating that we "check IBC compliance" is misleading because IBC is not in force as-is in any state — every state amends it.

**Defensive language (US-locked):**

- "**VerifIQ is a software-based document-reading aid. It does not practice architecture, engineering, surveying, or any other licensed profession in any U.S. state. It is not a substitute for the judgement of a licensed professional. The licensed professional verifies findings against source documents and applicable state and local codes before relying on them.**"
- "**VerifIQ does not warrant that any finding is correct, complete, or applicable. All output is informational and indicative.**"
- HIPAA: if any U.S. healthcare pack is ever uploaded, a BAA is mandatory. Until then, marketing must not solicit U.S. healthcare packs.

**What we can never say in U.S.:**

- "Licensed in all 50 states" — we are not licensed anywhere as a regulated practice.
- "Code-compliant" — the user achieves compliance under the state code in force.
- Any superlative without substantiation (FTC focus).
- "HIPAA-compliant" — this is a process, not a product.
- Marketing to or scanning packs from PHI-containing healthcare projects without BAAs in place.

**Insurance required (U.S.):** Tech E&O minimum US$5m. Cyber US$5m. General liability US$2m. Employment practices if any U.S. hires. Healthcare BAA-related rider if any healthcare engagement. State-by-state qualification to do business in each state where we have customers (Secretary of State filings, registered agent — about $500/state/year).

---

## VII · Professional Indemnity & E&O Specialist

**Remit:** Insurance schedule, claims posture, what insurance does and does not do.

**Position:**

Insurance does not replace good legal posture; it sits behind it. The defensive language across all six jurisdictions above is the first line. Insurance is the second line. Capital reserves are the third.

**Recommended insurance schedule at international scale (full deployment, MMXXVIII):**

| Cover | Ireland | UK | EU | Australia | Canada | USA |
|---|---|---|---|---|---|---|
| Tech E&O / Professional Indemnity (software) | €2m | £2m | €5m | AU$5m | CA$3m | US$5m |
| Cyber liability | €1m | £2m | €2m | AU$3m | CA$2m | US$5m |
| General / public liability | €2.5m | £5m | €3m | AU$10m | CA$2m | US$2m |
| D&O (Directors & Officers) | €1m | £1m | €1m | AU$2m | CA$1m | US$3m |
| Product liability (digital, PLD-relevant) | — | — | €3m | — | — | — |
| Employment Practices | — | £1m | — | AU$2m | — | US$2m |

**Annual premium estimate at full deployment:** €180k–€280k. At Irish-only launch: €18k–€32k. Premiums rise sharply at the moment we enter UK (Building Safety Act) and US (AI E&O carve-outs are still tightening).

**Claims posture:** the legal disclaimers above must be tested by insurers. Most tech E&O carriers will require sample TOS for underwriting. Have the locked language reviewed by chosen carrier's underwriter before binding cover.

**What insurance will NOT cover:**

- GDPR administrative fines (uninsurable in EU).
- ACL statutory damages (uninsurable in AU).
- Privacy Act statutory damages (uninsurable in CA, AU; partially insurable in US).
- Intentional misrepresentation (carved out everywhere).
- Building Safety Act regulator-imposed fines (uninsurable in UK).
- Practicing architecture/engineering without a license (uninsurable — it's a crime).

**Conclusion:** Insurance is the airbag. The seatbelt is the disclaimer. The brakes are good engineering. Buy all three.

---

## VIII · Data Protection & GDPR Specialist

**Remit:** Personal data, customer documents, model training, cross-border transfers, DSR handling.

**Position:**

VerifIQ processes personal data on at least three vectors:

1. **Customer user data** (name, email, organisation, role, billing) — straightforward GDPR processor/controller analysis.
2. **Document metadata** (designer names on title blocks, signatures, client identifiers) — incidental personal data inside customer documents.
3. **Pack content** — may include, depending on project type, names of patients (healthcare packs — rare but possible), names of school children (education packs — rare but possible), names of residents (residential packs — common in surveys).

**Mandatory measures:**

- **Data Processing Agreement** with every paying customer. Standard contractual clauses for non-EEA transfers if any.
- **Sub-processor list** published — Anthropic, OpenAI, Stripe, Clerk, Convex, Resend. Each must be assessed; Anthropic and OpenAI have published DPAs that we mirror to customers.
- **Article 22 transparency.** If our output is used as input to a decision that significantly affects a person (employment, housing, healthcare access), Article 22 disclosure is required. Our position: our output is information to the professional, not a decision; Article 22 does not directly apply, but we must document this position.
- **Data minimisation.** Documents purged at 14 days unless customer pays for extended retention. Hashes retained 90 days for abuse prevention. **No training on customer documents — locked policy, audited, published.**
- **EU data residency.** Convex EU-West (Dublin) for EU/UK/IE customers. Other regions per the platform plan.
- **Data Subject Rights.** Process for handling access, rectification, erasure requests — typically the customer (controller) handles, we (processor) assist within 14 days.
- **Breach notification.** Article 33 GDPR — 72 hours from awareness. Process and template ready before launch.
- **Children's data.** Not knowingly collected. Customers who upload children-related documents in education packs are warned at upload that any names of children inside documents are seen as incidental personal data; they remain controller.
- **DPO.** Required at scale. Hire (or outsource) at €1m ARR threshold or earlier if processing crosses thresholds.

**AI-specific data points (covered briefly under EU AI Act in Voice III, expanded here):**

- **Training data provenance.** We do not train models. We use foundation models from Anthropic and OpenAI. Their training data provenance is theirs to defend; ours is to document that we do not augment with customer data.
- **System prompt / fine-tuning data.** Our prompts are written from publicly available standards and our own corpus annotations. We must keep an audit trail of changes.
- **Logging.** Inference logs retained 30 days, anonymised after, for safety/quality investigation only. Customers told plainly.

**What we can never say in any data-protection context:**

- "Anonymous AI" (it isn't, even when responses are anonymised).
- "We delete everything immediately" (we don't — hashes 90 days, logs 30 days).
- "Your data is never seen by humans" — reviewers see findings; this must be transparent.
- "Fully GDPR-compliant" — compliance is a continuous posture, not a product feature.

---

## Locked Language Schedule

This is the language that goes onto the product surfaces. It is locked — no copywriter, no founder, no marketer changes it without solicitor review.

### A · Output footer (every finding, every report, every email)

> *VerifIQ output is indicative. It is not a certification, professional opinion, or substitute for the judgement of a registered design professional. The registered professional verifies all findings against source documents and applicable standards, and signs. Professional responsibility, including indemnity, remains with the registered professional. VerifIQ Ltd · Dublin · MMXXVI.*

### B · Marketing copy guardrails (used on website, deck, demos)

**Verbs we may use:** check, read, surface, indicate, highlight, flag, draw attention to, help find, point at, assist, augment.

**Verbs we may NOT use:** verify (in marketing — internal product name is OK), certify, approve, validate, guarantee, comply, ensure, prove, confirm, sign off.

**Nouns we may use:** aid, helper, assistant tool, reading aid, checking system, design-review aid, augmentation.

**Nouns we may NOT use:** certifier, approver, regulator, expert, authority, decision, opinion, judgement.

**Claims we may make:** that we have indexed published standards; that we present source quotes verbatim; that our reviewers are chartered in named bodies; that we operate in named EU regions; that customers have used us on specified projects (with consent).

**Claims we may NOT make:** that we are accredited by any chartered body (we are not); that we have any regulatory status; absolute performance claims ("finds 100% of issues"); comparative claims against named competitors without independent substantiation.

### C · Terms of Service — core clauses (Ireland-form base, adapted per market)

1. **Service description.** "VerifIQ provides a software-based document-reading aid for use by registered design professionals. The Service surfaces, in the documents' own words, items that may merit closer reading. It is not a certification, regulated service, or substitute for professional judgement."
2. **No professional opinion.** "No part of the Service constitutes architectural, engineering, surveying, fire-safety, or any other professional opinion within the meaning of any applicable Act. Customer acknowledges that all output is indicative and that Customer or Customer's registered professionals are solely responsible for verification, decision-making, and certification."
3. **Customer obligations.** "Customer warrants that all documents uploaded are owned by Customer or uploaded with appropriate permission, do not contain personal data of any person from whom consent has not been obtained for processing as described, and do not contain content subject to legal privilege or export-controlled material."
4. **Limitation of liability.** "To the maximum extent permitted by law, VerifIQ Ltd's aggregate liability under or in connection with this Agreement shall not exceed the fees paid by Customer in the twelve months preceding the event giving rise to liability. VerifIQ Ltd shall not be liable for indirect, consequential, or special damages including loss of profits, contracts, or goodwill. Nothing in this clause excludes liability for death, personal injury caused by negligence, fraud, or any other liability that cannot be excluded by applicable law."
5. **No fitness for purpose beyond stated.** "The Service is provided for the purpose described and no other. Customer must not rely on the Service for safety-critical decisions without exercising independent professional judgement and verification."
6. **Indemnity by Customer for misuse.** "Customer shall indemnify VerifIQ Ltd against claims arising from Customer's use of the Service outside the stated purpose, Customer's reliance on output without verification, or Customer's misrepresentation of the Service to third parties."
7. **Termination + data return.** "On termination, Customer's documents are returned or deleted at Customer's election within 14 days. Hashes for abuse-prevention purposes are retained 90 days."
8. **Governing law (per market).** Ireland: Irish law, Irish courts. UK: English law, English courts. EU: per local solicitor advice. Australia: NSW law unless varied. Canada: Ontario law unless varied. US: state of incorporation (Delaware) unless customer is consumer (consumer's state).

### D · Privacy notice — core clauses

The full notice is jurisdiction-tailored. Core constants:

- **What we collect:** user identity (name, email, organisation), billing data, document content for the duration of the scan, document hashes for 90 days, inference logs for 30 days.
- **What we do not do:** train models on customer documents; sell personal data; share with third parties except sub-processors listed in our sub-processor schedule.
- **How long we keep it:** documents 14 days unless paid retention bought; hashes 90 days; logs 30 days.
- **Your rights:** access, rectification, erasure, portability, objection, withdraw consent — exercised through the controller (customer), with our assistance, within 14 days.
- **Where it lives:** EU-West (Dublin) for EU/UK/IE customers; per-region for others (AU-Sydney, CA-Central, US-East-1).
- **Contact:** privacy@verifiq.ie · Data Protection Officer · address.

### E · Output disclaimer on every PDF / XLSX report cover page

> **NOTICE TO REGISTERED PROFESSIONAL**  
> *This report is indicative output from VerifIQ Ltd. It is not a certification, professional opinion, or compliance statement. The registered professional named on the cover must verify every finding against the source documents cited and against the applicable standards in force on the date of certification. VerifIQ Ltd accepts no liability for reliance on this report without such verification. Document version: [hash]. Corpus version: [version]. Reviewer: [initials, body]. Date of release: [date].*

### F · Marketing landing-page footer (always-visible)

> *VerifIQ is a design-review aid. We do not certify. We do not sign. The registered designer verifies locally and retains all professional responsibility. © MMXXVI VerifIQ Ltd · Dublin.*

---

## Cross-Jurisdiction Risk Matrix

| Risk | IE | UK | EU | AU | CA | US | Mitigation |
|---|---|---|---|---|---|---|---|
| Unauthorised practice of regulated profession | High | High | High | High | High | Highest | Locked language § B; never imply practice |
| AI Act high-risk classification | — | Mod | High | — | — | — | Locked language § C clause 2; technical doc file |
| Building Safety Act duty-holder exposure | — | High | — | — | — | — | Explicit BSA disclaimer in UK TOS |
| Product Liability Directive strict liability | — | — | High | — | — | — | Quality / testing investment; EU-specific insurance |
| Misleading marketing / unfair commercial practice | Mod | Mod | Mod | High | Mod | High | Marketing verb whitelist § B |
| HIPAA / PHI exposure | — | — | — | — | — | High | No US healthcare packs without BAA |
| GDPR fines | High | High | High | — | — | — | DPO at €1m ARR; sub-processor management |
| State privacy patchwork | — | — | — | Mod | High | High | Per-state notices, Quebec French-equal text |
| Professional indemnity gap (we = software) | Mod | Mod | Mod | Mod | Mod | Mod | Tech E&O per market, NOT architects' PI |
| Insurance carrier withdrawal post-AI-incident | Mod | High | High | Mod | Mod | High | Multi-carrier diversification at scale |

---

## Required Filings + Registrations

| Item | When | Where |
|---|---|---|
| Trademark "VerifIQ" + monogram | Pre-launch | EUIPO (EU/IE), UKIPO (UK) |
| Domain protection — typosquatting + ccTLD | Pre-launch | All target markets |
| Companies Registration Office filings | Annually | CRO Ireland; equivalent each market we incorporate |
| Sub-processor schedule update | Each new sub-processor | Public web page |
| Privacy notice updates | Each material change | All jurisdiction landing pages |
| AI Act technical documentation | Pre-EU launch | Internal, available to regulators on request |
| Insurance binders | Per renewal | All policies |
| DPIA (Data Protection Impact Assessment) | Pre-launch + on material change | Internal, EU/UK requirement |
| Annual DPO report | Annually if DPO appointed | Internal + ICO/DPC on request |

---

## Implementation Order

1. **Pre-launch (Ireland) — MMXXVI Q3.** Locked-language schedule signed off by Irish solicitor. TOS, Privacy Policy, Output Footer in production. Tech E&O bound. CRO filings current. Trademark filed.
2. **Pre-first-pilot — MMXXVI Q4.** First customer Data Processing Agreement reviewed by Irish solicitor and customer counsel. Output disclaimer locked on PDF/XLSX templates.
3. **Pre-UK launch — MMXXVII Q2.** UK solicitor retained. BSA-specific addendum drafted. UK Tech E&O bound (separate carrier likely). UK domains live.
4. **Pre-EU launch — MMXXVII Q4.** AI Act technical documentation file complete. EU privacy notice translations (DE, FR at minimum). Article-22 position statement published. EU-specific PI bound.
5. **Pre-AU launch — MMXXVIII Q1.** DBP-Act addendum. AU privacy notice. Australian carrier engaged.
6. **Pre-CA launch — MMXXVIII Q2.** Quebec Law 25 specific notice (French). PIPEDA notice. CA carrier engaged.
7. **Pre-US entry — MMXXVIII Q3 onward.** State-by-state filings as customers acquired. Delaware C-corp likely required for U.S. revenue. AI carve-outs in tech E&O re-priced.

---

## What this council unanimously refused

The council was asked, separately, whether VerifIQ should ever:

- accept "certifier" labelling — **refused by all eight**.
- market as "AI compliance" — **refused by all eight**.
- accept output being signed by VerifIQ rather than the customer — **refused by all eight**.
- offer indemnification of customers' design errors — **refused by all eight**.
- operate in markets without a chartered reviewer panel — **refused by all eight** (echoing the International Scaling Council).

These refusals are non-negotiable. They are written into the founder shareholders' agreement and become a board veto in any future fundraise.

---

## The single sentence that holds the strategy together

> *VerifIQ is a software-based reading aid. The registered designer reads. The registered designer verifies. The registered designer signs. The professional indemnity remains with the registered designer. We carry product-quality risk only — and we manage it through engineering quality, narrow scope, locked language, and properly scaled insurance.*

---

## Important caveat

**This document is a strategic position paper, not legal advice.** Every locked-language clause must be reviewed and adapted by a qualified solicitor in the relevant jurisdiction before being deployed on a customer surface. Each jurisdiction's voice above is a synthesis intended to brief that solicitor, not to substitute for them. Engaging eight named external solicitors (one per jurisdiction listed) is a recommended pre-launch step before international expansion begins; an Irish solicitor's review is a pre-launch step before Irish revenue begins.

---

*End of position paper — VerifIQ Legal Council · v0.1*
