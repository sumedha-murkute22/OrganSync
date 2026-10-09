# OrganSync – Secure Organ Donor–Recipient Coordination Platform

> **CLINICAL WORKFLOW SAFEGUARD:**  
> **The platform supports clinical coordination, verification, and allocation review. Organ allocation decisions require authorized multidisciplinary transplant-team approval and compliance with applicable institutional and regional Organ Procurement Organization (OPO) allocation policies.**

---

## 1. Product Overview

**OrganSync** is an enterprise-grade organ donor–recipient coordination platform engineered for authorized hospital networks, transplant coordinators, histocompatibility laboratories, and recovery surgeons.

The platform provides operational visibility across solid-organ procurement (Heart, Kidney, Liver, Lungs, Pancreas), prerequisite clinical verifications, waitlist candidate ranking, cold-chain preservation telemetry, and logistics dispatch. While the administrative interface delivers a restrained, high-contrast clinical operations console, the underlying matching kernel, candidate prioritization, bipartite compatibility network, and record lookups are powered by high-performance **C (C99)** data structures.

---

## 2. Product Architecture & Modules

```
                    +-------------------------------------------------------------+
                    |             OrganSync Healthcare Operations Console         |
                    |   (Inter & JetBrains Mono • White & Cool-Gray • Medical Blue)|
                    +-------------------------------------------------------------+
                                                    |
                                          [HTTPS REST API]
                                                    |
                    +-------------------------------------------------------------+
                    |             Python Backend Integration Server               |
                    |  (REST API Routes • Audit Logging • Cold-Chain Telemetry)  |
                    +-------------------------------------------------------------+
                                                    |
                                    [Inter-Process Subprocess Pipes]
                                                    |
                    +-------------------------------------------------------------+
                    |               Native C99 Algorithmic Engine                 |
                    |  • Hash Table (DJB2 & Chaining): O(1) Record Retrieval      |
                    |  • Priority Queues (Binary Heaps): O(log n) Status Ranking  |
                    |  • Weighted Bipartite Graph: O(V + E) Adjacency Lists       |
                    |  • Circular FIFO Queue: O(1) Logistics Pipeline             |
                    |  • Greedy Allocation Kernel: O(M log M + M·N)               |
                    +-------------------------------------------------------------+
```

### 1. Operations Overview
- **Key Performance Indicators:** Real-time metrics for verified organs available, active recipient cases, critical cases (Status 1A / ECMO / VAD), organs nearing preservation expiry ($\le$ 6h), and active cold-chain transport missions.
- **Clinical Review Required Banner:** Clear, unambiguous notice emphasizing non-autonomous decision-making and dual-signature policy requirements.
- **Active Allocation Queue:** Case identifiers, organ types, patient urgency tiers, viability windows, compatibility statuses, and assigned reviewer states.
- **Intake Verification Summary:** Institutional completion rates for donor consent, ABO confirmation, infectious disease panels, and telemetry links.
- **Time-Sensitive Inventory:** Organs sorted in ascending order of remaining cold-ischemia tolerance.

### 2. Organ Intake & Verification
- **Structured Surgical Intake:** Capture donor case ID, organ type, donor age, ABO/Rh typing, recovery hospital, recovery timestamp, preservation technology, remaining viability window, cold-chain container ID, and transport readiness.
- **Mandatory Verification Checklist:**
  - Donor identity and signed consent/authorization documentation
  - Dual-signature ABO/Rh confirmation completed
  - HLA / tissue typing profile validated
  - Infectious-disease screening panel non-reactive (HIV, HBV, HCV, Syphilis, CMV, EBV)
  - Crossmatch serum sample on file
  - Organ recovery quality and biopsy assessment passed
  - Chain-of-custody barcode scan verified
  - Preservation temperature telemetry sensor attached
- **Verification Invariant:** Organ remains strictly **"Pending Verification"** until all required items are reviewed and signed off by an authorized clinician.

### 3. Recipient Candidate Registry
- **Enterprise Registry:** Case ID, patient demographics, required organ, ABO/Rh, clinical urgency classification (Status 1A, Status 1B, Status 2, Status 3), waitlist days, treating transplant center, and clinical readiness.
- **Multi-Parameter Filtering:** Live search and filtering by organ type, blood group, urgency tier, and clinical status.
- **Clinical Detail Profile Drawer:** Patient-specific HLA alleles, calculated Panel Reactive Antibodies (cPRA %), crossmatch readiness, treating surgeon, and multidisciplinary review history.

### 4. Match Review
- **Clinical Compatibility Engine:** Invokes the native C matching engine to evaluate candidates against biological and logistical criteria.
- **Biological Invariants:** Mandatory exact organ-type match and non-reactive ABO blood compatibility (incompatible pairs are rejected at the C engine kernel level).
- **Candidate Match Cards:** Itemized fit score (0–100), HLA similarity breakdown, ABO verification, urgency contribution, waitlist seniority, remaining preservation margin, route distance, travel time, and clinical rationale.
- **Physician Decision Actions:**
  - `Approve for Coordination`: Transitions match into active cold-chain transport.
  - `Send for Clinical Review`: Submits candidate to multidisciplinary review committee.
  - `Clinical Hold`: Logs documented medical hold rationale into the audit ledger.

### 5. Compatibility Network
- **Bipartite Pathway Visualizer:** Renders Partition $U$ (Verified Organs) and Partition $V$ (Eligible Recipients) on a high-resolution canvas.
- **Clinical Pathway Rules:** Valid compatibility pathways only; incompatible pairs are never connected. Line thickness and color intensity reflect fit score ($\ge 85$: Clinical Teal, $70\text{--}84$: Medical Blue, $<70$: Slate).
- **Network Metrics:** Live counts for verified donor organs, eligible recipients, valid pathways, and zero incompatible connections.
- **Interactive Inspection Drawer:** Click any pathway or node to view ABO validation, HLA match summary, urgency weight, route feasibility, and outstanding crossmatch checks.

### 6. Transport Operations
- **Cold-Chain Logistics Management:** Active mission cards with case IDs, recovery-to-implant route lines, distance, travel time, container temperature ($2.0^\circ\text{C}\text{--}6.0^\circ\text{C}$), and live cellular/GPS telemetry status.
- **Sequential 6-Milestone Stepper:**
  1. *Clinical Acceptance*
  2. *Recovery Handoff*
  3. *Courier Dispatch*
  4. *In Transit*
  5. *Arrival at Implant Centre*
  6. *OR Handoff Confirmed*
- **Operational Statuses:** *"Courier assigned"*, *"Container sealed"*, *"Temperature within range"*, *"Arrival confirmation pending"*, *"OR handoff confirmed"*.

### 7. Governance & Audit
- **Role-Based Access Control (RBAC):** Active session credentials and clinical privileges.
- **Tamper-Evident Ledger:** Cryptographic SHA-256 event chaining recording verifications, approvals, custody transfers, and clinical holds with UTC timestamps, facility IDs, and clinician signatures.
- **Data Export:** Audit log exportable in structured JSON format for institutional review and compliance audits.

---

## 3. Technology Stack

| Layer | Technologies | Role |
|---|---|---|
| **Core Algorithmic Engine** | C (C99), GCC / MinGW, Make | Zero-dependency C implementation of Hash Table, Binary Heaps, Bipartite Graph, FIFO Queue, and Greedy Allocator |
| **Backend Integration** | Python 3 (`http.server`, `subprocess`, `json`) | Lightweight REST API server invoking compiled C binaries via standard process pipelines |
| **Frontend UI** | HTML5, CSS3, Vanilla JS (ES6+) | Enterprise healthcare dashboard with Canvas network visualizer, responsive drawers, and modals |
| **Data Format** | JSON (JavaScript Object Notation) | Standardized data exchange format between C engine, Python backend, and web interface |

---

## 4. Folder Structure

```
OrganSync/
├── c_engine/                   # Native C algorithmic source files
│   ├── models.h & models.c     # Domain models, ABO compatibility truth table, Haversine formula
│   ├── hash_table.h & .c       # DJB2 Hash Table with Separate Chaining
│   ├── priority_queue.h & .c   # Max-Heap (Recipients) and Min-Heap (Expiring Organs)
│   ├── graph.h & graph.c       # Weighted Bipartite Compatibility Graph (Adjacency Lists)
│   ├── queue.h & queue.c       # Circular FIFO Transplant Logistics Queue
│   ├── matching.h & matching.c # Greedy shelf-life matching engine & scoring formulation
│   ├── json_io.h & json_io.c   # Lightweight C JSON deserializer and serializers
│   ├── main.c                  # CLI entry point and 53 automated unit tests
│   ├── Makefile                # GNU Make build configuration
│   ├── build.ps1               # PowerShell Windows build script
│   └── organsync_engine.exe    # Compiled native binary executable
├── backend/
│   └── server.py               # REST API server, audit logger, and C process runner
├── frontend/
│   ├── index.html              # Production healthcare console markup
│   ├── styles.css              # Enterprise clinical stylesheet (high contrast, 10-12px radii)
│   └── app.js                  # Operational controller, Canvas graph visualizer, API client
├── data/
│   ├── organs.json             # 12 detailed procurement organ records
│   ├── recipients.json         # 18 waitlisted candidate records
│   ├── transports.json         # Active cold-chain transport missions
│   ├── audit_logs.json         # Tamper-evident cryptographic operational audit log
│   └── processing_queue.json   # Accepted allocation records
└── README.md                   # Complete platform documentation
```

---

## 5. Instructions to Compile and Run

### 1. Compiling the C Engine
```powershell
cd C:\Users\Sumedha\.gemini\antigravity\scratch\OrganSync\c_engine

# Compile using GCC directly:
gcc -Wall -Wextra -O2 -std=c99 main.c models.c hash_table.c priority_queue.c graph.c queue.c matching.c json_io.c -o organsync_engine.exe -lm

# Execute the 53 automated unit tests:
.\organsync_engine.exe --test
```
*(All 53 tests verify blood compatibility, priority queue monotonicity, hash table chaining, bipartite graph validity, FIFO transitions, and 1:1 matching invariants).*

### 2. Starting the Platform
```powershell
cd C:\Users\Sumedha\.gemini\antigravity\scratch\OrganSync
python backend\server.py
```
Open your browser and navigate to:
```
http://localhost:5000
```

---

## 6. Algorithmic Complexity Reference

| Component / Operation | C Module | Average Time | Worst Time | Space |
|---|---|---|---|---|
| **Hash Table Record Lookup** | `hash_table.c` | $\mathcal{O}(1)$ | $\mathcal{O}(n)$ | $\mathcal{O}(m + n)$ |
| **Recipient Max-Heap Extraction** | `priority_queue.c` | $\mathcal{O}(\log n)$ | $\mathcal{O}(\log n)$ | $\mathcal{O}(n)$ |
| **Organ Min-Heap Extraction** | `priority_queue.c` | $\mathcal{O}(\log n)$ | $\mathcal{O}(\log n)$ | $\mathcal{O}(n)$ |
| **Graph Traversal per Organ** | `graph.c` | $\mathcal{O}(\text{deg}(u))$ | $\mathcal{O}(|V|)$ | $\mathcal{O}(V + E)$ |
| **FIFO Transport Queue Enqueue** | `queue.c` | $\mathcal{O}(1)$ | $\mathcal{O}(1)$ | $\mathcal{O}(\text{Cap})$ |
| **Greedy Allocation Engine** | `matching.c` | $\mathcal{O}(M \log M + M \cdot N)$ | $\mathcal{O}(M \log M + M \cdot N)$ | $\mathcal{O}(M + N)$ |

---

## 7. Mathematical Compatibility Formulation (0 to 100)

$$S(u, v) = \begin{cases} 
0, & \text{if } \text{type}(u) \neq \text{type}(v) \lor \neg \text{Compatible}(\text{ABO}_u, \text{ABO}_v) \\
B(u, v) + H(u, v) + U(v) + W(v) + D(u, v), & \text{otherwise}
\end{cases}$$

Where:
- $B(u, v)$: Blood match score (Identical: 20 pts, Compatible: 15 pts, Incompatible: 0 pts).
- $H(u, v)$: HLA tissue score ($25 \times [1.0 - |\text{HLA}_u - \text{HLA}_v| / 100]$).
- $U(v)$: Urgency tier score (Critical Status 1A: 25 pts, High Status 1B: 18 pts, Medium Status 2: 12 pts, Elective Status 3: 5 pts).
- $W(v)$: Waitlist seniority score ($15 \times \min[1.0, \text{WaitDays} / 730]$).
- $D(u, v)$: Geographic viability score ($< 50\text{ km}$: 15 pts, $50\text{--}200\text{ km}$: 12 pts, $200\text{--}500\text{ km}$: 8 pts, $\ge 500\text{ km}$: 4 pts).
