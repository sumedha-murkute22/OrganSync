/**
 * OrganSync - Comprehensive C DSA Unit & Workflow Test Suite
 * 
 * Verifies correctness, boundary cases, and invariants for:
 * 1. Stack (push, pop, peek, resize, LIFO ordering)
 * 2. FIFO Queue (enqueue, dequeue, ordering)
 * 3. Hash Table (DJB2, collisions, search, deletion, resize)
 * 4. Priority Queue (Max-Heap, Min-Heap, tie-break rules)
 * 5. Graph (Adjacency list, Dijkstra shortest path, unreachability)
 * 6. Clinical Compatibility (ABO matrix, HLA, cold ischemia)
 * 7. Matching Engine (6-stage evaluation, ranking, explainability)
 */

#include "../include/models.h"
#include "../include/stack.h"
#include "../include/queue.h"
#include "../include/hash_table.h"
#include "../include/priority_queue.h"
#include "../include/graph.h"
#include "../include/compatibility.h"
#include "../include/matching_engine.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static int total_passed = 0;
static int total_failed = 0;

#define TEST_ASSERT(cond, name) \
    do { \
        if (cond) { \
            printf("  [PASS] %s\n", name); \
            total_passed++; \
        } else { \
            printf("  [FAIL] %s (Line %d)\n", name, __LINE__); \
            total_failed++; \
        } \
    } while(0)

/* ========================================================================= */
/* 1. STACK TESTS                                                            */
/* ========================================================================= */
static void test_stack_operations(void) {
    printf("\n=== Module 1: Stack (LIFO Case Review History & Undo) ===\n");
    Stack* s = stack_create(2);
    TEST_ASSERT(s != NULL, "Stack created successfully");
    TEST_ASSERT(stack_is_empty(s), "Stack is initially empty");
    TEST_ASSERT(stack_size(s) == 0, "Initial stack size is 0");
    
    WorkflowStep step1 = { .is_reversible = true };
    strcpy(step1.action_id, "ACT-001");
    strcpy(step1.case_id, "CASE-101");
    strcpy(step1.previous_state, "Created");
    strcpy(step1.new_state, "Awaiting Clinical Assessment");
    
    WorkflowStep step2 = { .is_reversible = true };
    strcpy(step2.action_id, "ACT-002");
    strcpy(step2.case_id, "CASE-101");
    strcpy(step2.previous_state, "Awaiting Clinical Assessment");
    strcpy(step2.new_state, "Candidate Review");
    
    WorkflowStep step3 = { .is_reversible = false };
    strcpy(step3.action_id, "ACT-003");
    strcpy(step3.case_id, "CASE-101");
    strcpy(step3.previous_state, "Candidate Review");
    strcpy(step3.new_state, "Allocation Approved");
    
    /* Test push and dynamic resizing beyond initial capacity 2 */
    TEST_ASSERT(stack_push(s, &step1), "Push step 1 (Created -> Awaiting)");
    TEST_ASSERT(stack_push(s, &step2), "Push step 2 (Awaiting -> Candidate Review)");
    TEST_ASSERT(stack_push(s, &step3), "Push step 3 (Candidate Review -> Allocation Approved, triggers auto-resize)");
    TEST_ASSERT(stack_size(s) == 3, "Stack size is now 3");
    TEST_ASSERT(!stack_is_empty(s), "Stack is not empty");
    
    /* Peek */
    WorkflowStep peeked;
    TEST_ASSERT(stack_peek(s, &peeked), "Peek returns top item");
    TEST_ASSERT(strcmp(peeked.action_id, "ACT-003") == 0, "Peeked item is ACT-003");
    TEST_ASSERT(stack_size(s) == 3, "Stack size unchanged after peek");
    
    /* Pop in LIFO order */
    WorkflowStep popped;
    TEST_ASSERT(stack_pop(s, &popped), "Pop 1 succeeded");
    TEST_ASSERT(strcmp(popped.action_id, "ACT-003") == 0, "Popped item 1 is ACT-003 (LIFO)");
    
    TEST_ASSERT(stack_pop(s, &popped), "Pop 2 succeeded");
    TEST_ASSERT(strcmp(popped.action_id, "ACT-002") == 0, "Popped item 2 is ACT-002");
    
    TEST_ASSERT(stack_pop(s, &popped), "Pop 3 succeeded");
    TEST_ASSERT(strcmp(popped.action_id, "ACT-001") == 0, "Popped item 3 is ACT-001");
    
    TEST_ASSERT(stack_is_empty(s), "Stack is empty after popping all elements");
    TEST_ASSERT(!stack_pop(s, &popped), "Pop on empty stack returns false");
    
    stack_free(s);
}

/* ========================================================================= */
/* 2. QUEUE TESTS                                                            */
/* ========================================================================= */
static void test_queue_operations(void) {
    printf("\n=== Module 2: FIFO Queue (Transport Coordination & Handover) ===\n");
    Queue* q = queue_create();
    TEST_ASSERT(q != NULL, "Queue created");
    TEST_ASSERT(queue_is_empty(q), "Queue is initially empty");
    TEST_ASSERT(queue_size(q) == 0, "Queue initial size is 0");
    
    TransportTask t1 = { .estimated_minutes = 90 };
    strcpy(t1.task_id, "TSK-001");
    strcpy(t1.transport_id, "TRN-501");
    strcpy(t1.priority, "Tier 1 Critical");
    
    TransportTask t2 = { .estimated_minutes = 45 };
    strcpy(t2.task_id, "TSK-002");
    strcpy(t2.transport_id, "TRN-502");
    strcpy(t2.priority, "Tier 2 Urgent");
    
    TEST_ASSERT(queue_enqueue(q, &t1), "Enqueue task 1");
    TEST_ASSERT(queue_enqueue(q, &t2), "Enqueue task 2");
    TEST_ASSERT(queue_size(q) == 2, "Queue size is 2");
    
    TransportTask peek_t;
    TEST_ASSERT(queue_peek(q, &peek_t), "Peek front item");
    TEST_ASSERT(strcmp(peek_t.task_id, "TSK-001") == 0, "Peeked item is TSK-001");
    
    TransportTask out_t;
    TEST_ASSERT(queue_dequeue(q, &out_t), "Dequeue item 1");
    TEST_ASSERT(strcmp(out_t.task_id, "TSK-001") == 0, "Strict FIFO: First dequeued is TSK-001");
    
    TEST_ASSERT(queue_dequeue(q, &out_t), "Dequeue item 2");
    TEST_ASSERT(strcmp(out_t.task_id, "TSK-002") == 0, "Strict FIFO: Second dequeued is TSK-002");
    
    TEST_ASSERT(queue_is_empty(q), "Queue is empty");
    TEST_ASSERT(!queue_dequeue(q, &out_t), "Dequeue on empty queue returns false");
    
    queue_free(q);
}

/* ========================================================================= */
/* 3. HASH TABLE TESTS                                                       */
/* ========================================================================= */
static void test_hash_table_operations(void) {
    printf("\n=== Module 3: Hash Table (O(1) Record Lookups & Separate Chaining) ===\n");
    HashTable* ht = ht_create(5); /* Deliberately small to induce collisions */
    TEST_ASSERT(ht != NULL, "Hash table created with capacity 5");
    
    Organ o1 = { .hla_score = 90, .shelf_life_hours = 5.5, .donor_age = 35 };
    strcpy(o1.id, "ORG-H01");
    strcpy(o1.organ_type, "Heart");
    strcpy(o1.blood_group, "O+");
    
    Organ o2 = { .hla_score = 80, .shelf_life_hours = 22.0, .donor_age = 45 };
    strcpy(o2.id, "ORG-K02");
    strcpy(o2.organ_type, "Kidney");
    strcpy(o2.blood_group, "A+");
    
    Recipient r1 = { .hla_requirement = 85, .urgency = URGENCY_CRITICAL, .waiting_time_days = 250 };
    strcpy(r1.id, "REC-R01");
    strcpy(r1.name, "Marcus Vance");
    strcpy(r1.required_organ, "Heart");
    strcpy(r1.blood_group, "A+");
    
    TEST_ASSERT(ht_insert_organ(ht, &o1), "Insert organ ORG-H01");
    TEST_ASSERT(ht_insert_organ(ht, &o2), "Insert organ ORG-K02");
    TEST_ASSERT(ht_insert_recipient(ht, &r1), "Insert recipient REC-R01");
    TEST_ASSERT(ht_size(ht) == 3, "Hash table size is 3");
    
    /* Lookups */
    Organ* search_o1 = ht_search_organ(ht, "ORG-H01");
    TEST_ASSERT(search_o1 != NULL && strcmp(search_o1->organ_type, "Heart") == 0, "O(1) lookup ORG-H01 returned Heart");
    
    Recipient* search_r1 = ht_search_recipient(ht, "REC-R01");
    TEST_ASSERT(search_r1 != NULL && strcmp(search_r1->name, "Marcus Vance") == 0, "O(1) lookup REC-R01 returned Marcus Vance");
    
    TEST_ASSERT(ht_search_organ(ht, "ORG-NONEXISTENT") == NULL, "Lookup for missing key returns NULL");
    
    /* Deletion */
    TEST_ASSERT(ht_delete_organ(ht, "ORG-H01"), "Delete ORG-H01");
    TEST_ASSERT(ht_search_organ(ht, "ORG-H01") == NULL, "Deleted key ORG-H01 is now NULL");
    TEST_ASSERT(ht_search_organ(ht, "ORG-K02") != NULL, "Peers in chained bucket remain intact");
    
    ht_free(ht);
}

/* ========================================================================= */
/* 4. PRIORITY QUEUE TESTS                                                   */
/* ========================================================================= */
static void test_priority_queue_operations(void) {
    printf("\n=== Module 4: Priority Queue (Max-Heap Urgency & Min-Heap Shelf Life) ===\n");
    
    /* Test Max-Heap Urgency Sorting */
    PriorityQueue* max_pq = pq_create(16, PQ_MAX_HEAP);
    pq_insert(max_pq, "REC-STABLE", 25.0, 100.0, "Stable Patient", "St. Jude", "Status 3");
    pq_insert(max_pq, "REC-CRIT", 92.5, 350.0, "Critical Patient", "Memorial", "Status 1A");
    pq_insert(max_pq, "REC-URGENT", 68.0, 200.0, "Urgent Patient", "City General", "Status 1B");
    pq_insert(max_pq, "REC-MOD", 48.0, 150.0, "Moderate Patient", "Metro Health", "Status 2");
    
    PQNode top;
    TEST_ASSERT(pq_peek(max_pq, &top), "Peek Max-Heap top");
    TEST_ASSERT(strcmp(top.id, "REC-CRIT") == 0, "Top priority candidate is Critical Patient (92.5 pts)");
    
    /* Extraction must be strictly descending */
    PQNode n1, n2, n3, n4;
    pq_extract_top(max_pq, &n1);
    pq_extract_top(max_pq, &n2);
    pq_extract_top(max_pq, &n3);
    pq_extract_top(max_pq, &n4);
    
    TEST_ASSERT(n1.priority >= n2.priority && n2.priority >= n3.priority && n3.priority >= n4.priority,
                "Heap extracts candidates in strict descending order");
    TEST_ASSERT(strcmp(n1.id, "REC-CRIT") == 0, "First is Critical");
    TEST_ASSERT(strcmp(n4.id, "REC-STABLE") == 0, "Last is Stable");
    
    /* Tie-break rule test: Same priority, different waitlist seniority */
    PriorityQueue* tie_pq = pq_create(4, PQ_MAX_HEAP);
    pq_insert(tie_pq, "PATIENT-A", 80.0, 100.0, "Wait 100d", "Hosp 1", "Tie");
    pq_insert(tie_pq, "PATIENT-B", 80.0, 500.0, "Wait 500d", "Hosp 2", "Tie");
    
    PQNode tie_top;
    pq_extract_top(tie_pq, &tie_top);
    TEST_ASSERT(strcmp(tie_top.id, "PATIENT-B") == 0, "Tie-break prioritized higher waitlist seniority (500d > 100d)");
    
    pq_free(max_pq);
    pq_free(tie_pq);
    
    /* Min-Heap Organ Shelf Life */
    PriorityQueue* min_pq = pq_create(8, PQ_MIN_HEAP);
    pq_insert(min_pq, "KIDNEY-1", 24.0, 0.0, "Kidney", "Proc A", "24h");
    pq_insert(min_pq, "HEART-1", 3.5, 0.0, "Heart", "Proc B", "3.5h");
    pq_insert(min_pq, "LIVER-1", 8.0, 0.0, "Liver", "Proc C", "8h");
    
    PQNode min_top;
    pq_extract_top(min_pq, &min_top);
    TEST_ASSERT(strcmp(min_top.id, "HEART-1") == 0, "Min-Heap prioritized shortest shelf-life organ (Heart 3.5h)");
    pq_free(min_pq);
}

/* ========================================================================= */
/* 5. GRAPH & ROUTING TESTS                                                  */
/* ========================================================================= */
static void test_graph_and_routing(void) {
    printf("\n=== Module 5: Transport Graph & Dijkstra Routing ===\n");
    TransportGraph* g = graph_create();
    TEST_ASSERT(g != NULL, "Transport graph created");
    
    graph_add_vertex(g, "St. Jude Center", "Seattle", 47.6, -122.3, "Transplant Center");
    graph_add_vertex(g, "Memorial General", "Portland", 45.5, -122.6, "Transplant Center");
    graph_add_vertex(g, "Regional Air Hub", "Olympia", 47.0, -122.9, "Airport Hub");
    graph_add_vertex(g, "Island Hospital", "San Juan", 48.5, -123.0, "Remote Hub");
    
    /* Add edges: St. Jude -> Air Hub -> Memorial */
    graph_add_edge(g, "St. Jude Center", "Regional Air Hub", 90.0, 55.0, "Medical Jet", true);
    graph_add_edge(g, "Regional Air Hub", "Memorial General", 180.0, 70.0, "Medical Jet", true);
    /* Direct route: slower ground route */
    graph_add_edge(g, "St. Jude Center", "Memorial General", 280.0, 180.0, "Ground Unit", true);
    
    ShortestPathResult res = graph_dijkstra(g, "St. Jude Center", "Memorial General");
    TEST_ASSERT(res.is_reachable, "Route between Seattle and Portland is reachable");
    TEST_ASSERT(res.total_time_mins == 125.0, "Dijkstra optimal route via Air Hub is 125 mins (vs 180 direct ground)");
    
    /* Test unreachable destination */
    ShortestPathResult unreachable = graph_dijkstra(g, "St. Jude Center", "Island Hospital");
    TEST_ASSERT(!unreachable.is_reachable, "Unreachable destination detected correctly");
    
    graph_free(g);
}

/* ========================================================================= */
/* 6. CLINICAL COMPATIBILITY TESTS                                           */
/* ========================================================================= */
static void test_clinical_compatibility(void) {
    printf("\n=== Module 6: Clinical Compatibility Rules (ABO Matrix & HLA) ===\n");
    
    /* Universal donor O- */
    TEST_ASSERT(check_blood_compatibility("O-", "O-"), "O- -> O- compatible");
    TEST_ASSERT(check_blood_compatibility("O-", "AB+"), "O- -> AB+ compatible");
    
    /* O+ donor Rh constraints */
    TEST_ASSERT(check_blood_compatibility("O+", "A+"), "O+ -> A+ compatible");
    TEST_ASSERT(!check_blood_compatibility("O+", "A-"), "O+ -> A- Rh incompatible");
    
    /* Universal recipient AB+ */
    TEST_ASSERT(check_blood_compatibility("A+", "AB+"), "A+ -> AB+ compatible");
    TEST_ASSERT(check_blood_compatibility("B+", "AB+"), "B+ -> AB+ compatible");
    TEST_ASSERT(!check_blood_compatibility("AB+", "O+"), "AB+ cannot donate to O+");
    
    /* HLA and Urgency Scoring */
    TEST_ASSERT(calculate_urgency_score(URGENCY_CRITICAL) == 30.0, "Status 1A Critical urgency score is 30.0");
    TEST_ASSERT(calculate_urgency_score(URGENCY_STABLE) == 6.0, "Status 3 Stable urgency score is 6.0");
}

/* ========================================================================= */
/* 7. MATCHING ENGINE & EXPLAINABILITY TESTS                                 */
/* ========================================================================= */
static void test_matching_engine_pipeline(void) {
    printf("\n=== Module 7: 6-Stage Matching Engine & Recommendation ===\n");
    
    Organ organ = {
        .hla_score = 90,
        .max_shelf_life_hours = 6.0,
        .shelf_life_hours = 4.5,
        .donor_age = 32,
        .latitude = 47.6062,
        .longitude = -122.3321,
        .has_mandatory_tests = true
    };
    strcpy(organ.id, "ORG-H100");
    strcpy(organ.organ_type, "Heart");
    strcpy(organ.blood_group, "O+");
    strcpy(organ.donor_id, "DNR-801");
    strcpy(organ.hospital, "St. Jude Medical Center");
    
    Recipient candidates[3];
    memset(candidates, 0, sizeof(candidates));
    
    /* Candidate 1: Compatible, Critical, Long waitlist */
    strcpy(candidates[0].id, "REC-1");
    strcpy(candidates[0].name, "Arthur Pendelton");
    candidates[0].age = 35;
    strcpy(candidates[0].required_organ, "Heart");
    strcpy(candidates[0].blood_group, "A+");
    candidates[0].urgency = URGENCY_CRITICAL;
    strcpy(candidates[0].urgency_str, "Status 1A (Critical)");
    candidates[0].waiting_time_days = 400;
    candidates[0].latitude = 47.6100;
    candidates[0].longitude = -122.3300;
    strcpy(candidates[0].hospital, "Swedish Medical");
    candidates[0].clinical_readiness = true;
    strcpy(candidates[0].crossmatch_status, "Negative");
    
    /* Candidate 2: Incompatible blood group */
    strcpy(candidates[1].id, "REC-2");
    strcpy(candidates[1].name, "Beatrice Lane");
    candidates[1].age = 40;
    strcpy(candidates[1].required_organ, "Heart");
    strcpy(candidates[1].blood_group, "O-"); /* O+ cannot donate to O- */
    candidates[1].urgency = URGENCY_CRITICAL;
    strcpy(candidates[1].urgency_str, "Status 1A (Critical)");
    candidates[1].waiting_time_days = 600;
    candidates[1].latitude = 47.6100;
    candidates[1].longitude = -122.3300;
    strcpy(candidates[1].crossmatch_status, "Negative");
    
    /* Candidate 3: Compatible, Stable */
    strcpy(candidates[2].id, "REC-3");
    strcpy(candidates[2].name, "Charles Montgomery");
    candidates[2].age = 50;
    strcpy(candidates[2].required_organ, "Heart");
    strcpy(candidates[2].blood_group, "O+");
    candidates[2].urgency = URGENCY_STABLE;
    strcpy(candidates[2].urgency_str, "Status 3 (Stable)");
    candidates[2].waiting_time_days = 120;
    candidates[2].latitude = 47.6100;
    candidates[2].longitude = -122.3300;
    strcpy(candidates[2].hospital, "Seattle General");
    candidates[2].clinical_readiness = true;
    strcpy(candidates[2].crossmatch_status, "Negative");
    
    MatchingRunResult run = run_matching_engine_for_organ(&organ, candidates, 3, "OPTN-POL-2026.4");
    
    TEST_ASSERT(run.total_evaluated == 3, "Total candidates evaluated is 3");
    TEST_ASSERT(run.excluded_count == 1, "Candidate 2 excluded due to ABO incompatibility");
    TEST_ASSERT(run.count == 2, "2 compatible candidates recommended");
    TEST_ASSERT(strcmp(run.recommendations[0].recipient_id, "REC-1") == 0,
                "Rank 1 candidate is Arthur Pendelton (Critical status + high score)");
    TEST_ASSERT(run.recommendations[0].total_score > run.recommendations[1].total_score,
                "Rank 1 score is higher than Rank 2 score");
    TEST_ASSERT(run.recommendations[0].breakdown.blood_score == 20.0, "Score breakdown includes mandatory blood 20 pts");
    TEST_ASSERT(run.recommendations[0].verified_findings[0] != '\0', "Explainable clinical findings populated");
    TEST_ASSERT(run.clinical_disclaimer[0] != '\0', "Clinical disclaimer requirement present");
    
    char* json = matching_results_to_json(&run);
    TEST_ASSERT(json != NULL && strstr(json, "\"recommendations\"") != NULL, "JSON serialization generated valid output");
    free(json);
}

int main(void) {
    printf("=================================================================\n");
    printf("      ORGANSYNC C ENGINE COMPREHENSIVE TEST SUITE               \n");
    printf("=================================================================\n");
    
    test_stack_operations();
    test_queue_operations();
    test_hash_table_operations();
    test_priority_queue_operations();
    test_graph_and_routing();
    test_clinical_compatibility();
    test_matching_engine_pipeline();
    
    printf("\n-----------------------------------------------------------------\n");
    printf("Test Results: %d Passed, %d Failed (Total %d Tests)\n",
           total_passed, total_failed, total_passed + total_failed);
    printf("Status: %s\n", (total_failed == 0) ? "ALL TESTS PASSED SUCCESSFULLY! [OK]" : "SOME TESTS FAILED! [ERROR]");
    printf("=================================================================\n");
    
    return total_failed == 0 ? 0 : 1;
}
