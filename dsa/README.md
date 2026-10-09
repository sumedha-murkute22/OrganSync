# OrganSync - Native C Core Data Structures & Algorithms Engine

## Overview

The OrganSync C Engine implements the core algorithmic infrastructure for clinical organ donation, compatibility assessment, priority queue candidate ranking, Dijkstra transport routing, and reversible workflow history tracking.

This engine is written in standard C11/C17 and compiles to native executables (`organsync_engine.exe` and `test_dsa.exe`).

## Implemented Data Structures & Algorithms

| Module | Data Structure / Algorithm | Clinical Purpose | Time Complexity | Space Complexity |
|---|---|---|---|---|
| **`stack.c`** | LIFO Dynamic Stack | Workflow navigation history, reversible non-clinical state tracking | O(1) push, pop, peek | O(N) |
| **`queue.c`** | FIFO Linked-List Queue | Transport dispatch queue, handover coordination, cold-chain processing | O(1) enqueue, dequeue | O(N) |
| **`hash_table.c`** | DJB2 Hash Table with Separate Chaining | O(1) fast clinical entity lookup (Organs, Recipients, Cases) with auto-resizing | O(1) avg insert, search, delete | O(M + N) |
| **`priority_queue.c`** | Binary Max/Min Heap | Candidate clinical urgency ranking (Max-Heap) & organ ischemic tolerance (Min-Heap) | O(log N) insert, extract; O(1) peek | O(N) |
| **`graph.c`** | Adjacency List & Dijkstra Algorithm | Regional hospital transport routing, viable transit times, bipartite compatibility graph | O((V + E) log V) routing | O(V + E) |
| **`compatibility.c`** | Clinical Compatibility Rules | ABO/Rh matrix validation, 6-antigen HLA locus matching, ischemic limits | O(1) per candidate | O(1) |
| **`matching_engine.c`** | 6-Stage Matching Engine | Data validation, eligibility filtering, priority assessment, explainable output | O(N log N) | O(N) |

## Compilation Instructions (Windows PowerShell)

Ensure MinGW GCC is installed (`gcc --version`).

```powershell
cd dsa
.\build.ps1
```

Or using GCC directly:

```powershell
# Compile matching engine CLI
gcc -Wall -Wextra -std=c11 -O2 -Iinclude -o organsync_engine.exe src/main.c src/models.c src/stack.c src/queue.c src/hash_table.c src/priority_queue.c src/graph.c src/compatibility.c src/matching_engine.c -lm

# Compile and run test suite
gcc -Wall -Wextra -std=c11 -O2 -Iinclude -o test_dsa.exe tests/test_dsa.c src/models.c src/stack.c src/queue.c src/hash_table.c src/priority_queue.c src/graph.c src/compatibility.c src/matching_engine.c -lm
.\test_dsa.exe
```

## CLI Usage

```powershell
# Run automated tests
.\organsync_engine.exe --test

# Query shortest transport route between hospitals
.\organsync_engine.exe --route "St. Jude National Transplant Institute" "Memorial General Hospital"

# Run candidate matching and print explainable JSON recommendations
.\organsync_engine.exe --match
```
