/**
 * OrganSync - Core C Engine Entrypoint & Test Suite
 * 
 * Implements:
 * 1. CLI operational commands (--match, --graph, --pq, --hash)
 * 2. Complete automated unit test suites for all DSA data structures
 */

#include "models.h"
#include "hash_table.h"
#include "priority_queue.h"
#include "graph.h"
#include "queue.h"
#include "matching.h"
#include "json_io.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <assert.h>

#define MAX_LOAD_RECORDS 256

/* ========================================================================= */
/*                          AUTOMATED TEST SUITE                             */
/* ========================================================================= */

static int tests_passed = 0;
static int tests_failed = 0;

#define ASSERT_TEST(condition, test_name) \
    do { \
        if (condition) { \
            printf("  [PASS] %s\n", test_name); \
            tests_passed++; \
        } else { \
            printf("  [FAIL] %s (Line %d)\n", test_name, __LINE__); \
            tests_failed++; \
        } \
    } while (0)

static void test_blood_compatibility(void) {
    printf("\n--- Test Suite 1: Blood Compatibility Rules ---\n");
    
    /* Universal Donor O- */
    ASSERT_TEST(is_blood_compatible("O-", "O-"), "O- can donate to O-");
    ASSERT_TEST(is_blood_compatible("O-", "O+"), "O- can donate to O+");
    ASSERT_TEST(is_blood_compatible("O-", "A+"), "O- can donate to A+");
    ASSERT_TEST(is_blood_compatible("O-", "B-"), "O- can donate to B-");
    ASSERT_TEST(is_blood_compatible("O-", "AB+"), "O- can donate to AB+");
    
    /* Donor O+ */
    ASSERT_TEST(is_blood_compatible("O+", "O+"), "O+ can donate to O+");
    ASSERT_TEST(is_blood_compatible("O+", "A+"), "O+ can donate to A+");
    ASSERT_TEST(!is_blood_compatible("O+", "O-"), "O+ cannot donate to O- (Rh incompatible)");
    ASSERT_TEST(!is_blood_compatible("O+", "A-"), "O+ cannot donate to A- (Rh incompatible)");
    
    /* Donor A+ and A- */
    ASSERT_TEST(is_blood_compatible("A+", "A+"), "A+ can donate to A+");
    ASSERT_TEST(is_blood_compatible("A+", "AB+"), "A+ can donate to AB+");
    ASSERT_TEST(!is_blood_compatible("A+", "B+"), "A+ cannot donate to B+");
    ASSERT_TEST(!is_blood_compatible("A+", "O+"), "A+ cannot donate to O+");
    ASSERT_TEST(is_blood_compatible("A-", "A-"), "A- can donate to A-");
    ASSERT_TEST(is_blood_compatible("A-", "AB-"), "A- can donate to AB-");
    
    /* Donor B+ and B- */
    ASSERT_TEST(is_blood_compatible("B+", "B+"), "B+ can donate to B+");
    ASSERT_TEST(is_blood_compatible("B+", "AB+"), "B+ can donate to AB+");
    ASSERT_TEST(!is_blood_compatible("B+", "A+"), "B+ cannot donate to A+");
    
    /* Universal Recipient AB+ */
    ASSERT_TEST(is_blood_compatible("AB+", "AB+"), "AB+ can donate to AB+");
    ASSERT_TEST(!is_blood_compatible("AB+", "A+"), "AB+ cannot donate to A+");
    ASSERT_TEST(!is_blood_compatible("AB+", "B+"), "AB+ cannot donate to B+");
    ASSERT_TEST(!is_blood_compatible("AB+", "O+"), "AB+ cannot donate to O+");
}

static void test_hash_table_operations(void) {
    printf("\n--- Test Suite 2: Hash Table (Insert, Collision, Lookup, Delete) ---\n");
    HashTable* ht = ht_create(7); /* small capacity to deliberately induce collisions */
    ASSERT_TEST(ht != NULL, "Hash table created with capacity 7");
    
    Organ o1 = { .hla_score = 90, .shelf_life_hours = 6.0 };
    strncpy(o1.id, "ORG-101", MAX_ID_LEN - 1);
    strncpy(o1.organ_type, "Heart", MAX_TYPE_LEN - 1);
    strncpy(o1.blood_group, "O+", MAX_BLOOD_LEN - 1);
    
    Organ o2 = { .hla_score = 85, .shelf_life_hours = 24.0 };
    strncpy(o2.id, "ORG-102", MAX_ID_LEN - 1);
    strncpy(o2.organ_type, "Kidney", MAX_TYPE_LEN - 1);
    strncpy(o2.blood_group, "A+", MAX_BLOOD_LEN - 1);
    
    Recipient r1 = { .hla_requirement = 88, .urgency = URGENCY_CRITICAL, .waiting_time_days = 300 };
    strncpy(r1.id, "REC-201", MAX_ID_LEN - 1);
    strncpy(r1.name, "Eleanor", MAX_NAME_LEN - 1);
    
    ASSERT_TEST(ht_insert_organ(ht, &o1), "Insert organ ORG-101");
    ASSERT_TEST(ht_insert_organ(ht, &o2), "Insert organ ORG-102");
    ASSERT_TEST(ht_insert_recipient(ht, &r1), "Insert recipient REC-201");
    
    /* Lookups */
    Organ* searched_o1 = ht_search_organ(ht, "ORG-101");
    ASSERT_TEST(searched_o1 != NULL && strcmp(searched_o1->organ_type, "Heart") == 0, "Lookup ORG-101 matches Heart");
    
    Recipient* searched_r1 = ht_search_recipient(ht, "REC-201");
    ASSERT_TEST(searched_r1 != NULL && strcmp(searched_r1->name, "Eleanor") == 0, "Lookup REC-201 matches Eleanor");
    
    Organ* missing_org = ht_search_organ(ht, "ORG-999");
    ASSERT_TEST(missing_org == NULL, "Lookup non-existent organ returns NULL");
    
    /* Deletion */
    ASSERT_TEST(ht_delete_organ(ht, "ORG-101"), "Delete ORG-101");
    ASSERT_TEST(ht_search_organ(ht, "ORG-101") == NULL, "Lookup deleted ORG-101 returns NULL");
    ASSERT_TEST(ht_search_organ(ht, "ORG-102") != NULL, "ORG-102 still safely in hash table after peer deletion");
    
    ht_free(ht);
}

static void test_priority_queue_heaps(void) {
    printf("\n--- Test Suite 3: Priority Queue (Max-Heap & Min-Heap) ---\n");
    
    /* Test Recipient Max-Heap */
    PriorityQueue* max_pq = pq_create(10, PQ_MAX_HEAP);
    pq_insert(max_pq, "REC-LOW", 105.0, "Low Urgency", "Hosp A", "100d");
    pq_insert(max_pq, "REC-CRIT", 450.0, "Critical Urgency", "Hosp B", "500d");
    pq_insert(max_pq, "REC-MED", 220.0, "Medium Urgency", "Hosp C", "200d");
    pq_insert(max_pq, "REC-HIGH", 330.0, "High Urgency", "Hosp D", "300d");
    
    PQNode top;
    ASSERT_TEST(pq_peek(max_pq, &top) && strcmp(top.id, "REC-CRIT") == 0, "Max-Heap root is REC-CRIT");
    
    /* Extract all in order - must be monotonically non-increasing */
    PQNode n1, n2, n3, n4;
    pq_extract_top(max_pq, &n1);
    pq_extract_top(max_pq, &n2);
    pq_extract_top(max_pq, &n3);
    pq_extract_top(max_pq, &n4);
    
    ASSERT_TEST(n1.priority >= n2.priority && n2.priority >= n3.priority && n3.priority >= n4.priority,
                "Max-Heap extracts in strict descending priority order");
    ASSERT_TEST(strcmp(n1.id, "REC-CRIT") == 0, "First extracted is Critical");
    ASSERT_TEST(strcmp(n4.id, "REC-LOW") == 0, "Last extracted is Low");
    pq_free(max_pq);
    
    /* Test Organ Min-Heap (Shelf-Life Urgency) */
    PriorityQueue* min_pq = pq_create(10, PQ_MIN_HEAP);
    pq_insert(min_pq, "ORG-KIDNEY", 28.0, "Kidney", "Hosp 1", "28h");
    pq_insert(min_pq, "ORG-HEART", 3.2, "Heart", "Hosp 2", "3.2h");
    pq_insert(min_pq, "ORG-LIVER", 7.5, "Liver", "Hosp 3", "7.5h");
    
    pq_peek(min_pq, &top);
    ASSERT_TEST(strcmp(top.id, "ORG-HEART") == 0, "Min-Heap root is ORG-HEART (shortest shelf life 3.2h)");
    
    PQNode o_first, o_second, o_third;
    pq_extract_top(min_pq, &o_first);
    pq_extract_top(min_pq, &o_second);
    pq_extract_top(min_pq, &o_third);
    
    ASSERT_TEST(o_first.priority <= o_second.priority && o_second.priority <= o_third.priority,
                "Min-Heap extracts in strict ascending shelf-life order");
    pq_free(min_pq);
}

static void test_bipartite_graph(void) {
    printf("\n--- Test Suite 4: Bipartite Compatibility Graph ---\n");
    
    BipartiteGraph* g = graph_create(2, 2);
    Organ o1 = { .hla_score = 80, .shelf_life_hours = 4.0 };
    strncpy(o1.id, "ORG-G1", MAX_ID_LEN - 1);
    strncpy(o1.organ_type, "Heart", MAX_TYPE_LEN - 1);
    strncpy(o1.blood_group, "O+", MAX_BLOOD_LEN - 1);
    strncpy(o1.availability, "Available", MAX_STATUS_LEN - 1);
    
    Organ o2 = { .hla_score = 85, .shelf_life_hours = 20.0 };
    strncpy(o2.id, "ORG-G2", MAX_ID_LEN - 1);
    strncpy(o2.organ_type, "Kidney", MAX_TYPE_LEN - 1);
    strncpy(o2.blood_group, "B+", MAX_BLOOD_LEN - 1);
    strncpy(o2.availability, "Available", MAX_STATUS_LEN - 1);
    
    Recipient r1 = { .hla_requirement = 80, .urgency = URGENCY_CRITICAL, .waiting_time_days = 200 };
    strncpy(r1.id, "REC-G1", MAX_ID_LEN - 1);
    strncpy(r1.required_organ, "Heart", MAX_TYPE_LEN - 1);
    strncpy(r1.blood_group, "O+", MAX_BLOOD_LEN - 1);
    
    Recipient r2 = { .hla_requirement = 75, .urgency = URGENCY_MEDIUM, .waiting_time_days = 150 };
    strncpy(r2.id, "REC-G2", MAX_ID_LEN - 1);
    strncpy(r2.required_organ, "Heart", MAX_TYPE_LEN - 1);
    strncpy(r2.blood_group, "A+", MAX_BLOOD_LEN - 1);
    
    graph_set_organ(g, 0, &o1);
    graph_set_organ(g, 1, &o2);
    graph_set_recipient(g, 0, &r1);
    graph_set_recipient(g, 1, &r2);
    
    int edges = graph_build_compatibility_edges(g);
    ASSERT_TEST(edges > 0, "Compatibility edges generated");
    
    /* o1 (Heart, O+) can match r1 (Heart, O+) and r2 (Heart, A+) */
    /* o2 (Kidney, B+) cannot match r1 (Heart) or r2 (Heart) */
    ASSERT_TEST(g->adj_lists[1] == NULL, "Kidney organ has zero edges to Heart recipients");
    ASSERT_TEST(g->adj_lists[0] != NULL, "Heart organ has valid compatibility edges");
    
    graph_free(g);
}

static void test_fifo_queue(void) {
    printf("\n--- Test Suite 5: FIFO Processing Queue & Pipeline Transitions ---\n");
    
    Queue* q = q_create(8);
    QueueItem item1 = { .stage = STAGE_MATCH_ACCEPTED, .eta_minutes = 120 };
    strncpy(item1.match_id, "MTR-TEST1", MAX_ID_LEN - 1);
    strncpy(item1.organ_type, "Kidney", MAX_TYPE_LEN - 1);
    strncpy(item1.courier_vehicle, "Ambulance Unit 3", MAX_NAME_LEN - 1);
    
    QueueItem item2 = { .stage = STAGE_MATCH_ACCEPTED, .eta_minutes = 90 };
    strncpy(item2.match_id, "MTR-TEST2", MAX_ID_LEN - 1);
    strncpy(item2.organ_type, "Liver", MAX_TYPE_LEN - 1);
    strncpy(item2.courier_vehicle, "LifeFlight 9", MAX_NAME_LEN - 1);
    
    ASSERT_TEST(q_enqueue(q, &item1), "Enqueue Match 1");
    ASSERT_TEST(q_enqueue(q, &item2), "Enqueue Match 2");
    ASSERT_TEST(q_size(q) == 2, "Queue size is 2");
    
    /* Advance status of Match 1 */
    ASSERT_TEST(q_advance_status(q, "MTR-TEST1"), "Advance MTR-TEST1 to Transport Scheduled");
    QueueItem* found = q_find_by_match_id(q, "MTR-TEST1");
    ASSERT_TEST(found && found->stage == STAGE_TRANSPORT_SCHEDULED, "MTR-TEST1 stage verified as Transport Scheduled");
    
    q_advance_status(q, "MTR-TEST1");
    ASSERT_TEST(found->stage == STAGE_IN_TRANSIT, "MTR-TEST1 stage advanced to In Transit");
    
    QueueItem dequeued;
    ASSERT_TEST(q_dequeue(q, &dequeued), "Dequeue front item");
    ASSERT_TEST(strcmp(dequeued.match_id, "MTR-TEST1") == 0, "FIFO order preserved (MTR-TEST1 dequeued first)");
    
    q_free(q);
}

static void test_greedy_matching_no_duplicates(void) {
    printf("\n--- Test Suite 6: Greedy Matching Invariant (1:1 Allocation & No Duplicates) ---\n");
    
    Organ organs[3];
    memset(organs, 0, sizeof(organs));
    
    /* Organ 1: Heart, O+, 3 hours left (Most urgent shelf life) */
    strncpy(organs[0].id, "ORG-TEST-1", MAX_ID_LEN - 1);
    strncpy(organs[0].organ_type, "Heart", MAX_TYPE_LEN - 1);
    strncpy(organs[0].blood_group, "O+", MAX_BLOOD_LEN - 1);
    organs[0].shelf_life_hours = 3.0;
    organs[0].hla_score = 80;
    strncpy(organs[0].availability, "Available", MAX_STATUS_LEN - 1);
    
    /* Organ 2: Heart, O+, 5 hours left */
    strncpy(organs[1].id, "ORG-TEST-2", MAX_ID_LEN - 1);
    strncpy(organs[1].organ_type, "Heart", MAX_TYPE_LEN - 1);
    strncpy(organs[1].blood_group, "O+", MAX_BLOOD_LEN - 1);
    organs[1].shelf_life_hours = 5.0;
    organs[1].hla_score = 85;
    strncpy(organs[1].availability, "Available", MAX_STATUS_LEN - 1);
    
    /* Organ 3: Kidney, A+, 24 hours left */
    strncpy(organs[2].id, "ORG-TEST-3", MAX_ID_LEN - 1);
    strncpy(organs[2].organ_type, "Kidney", MAX_TYPE_LEN - 1);
    strncpy(organs[2].blood_group, "A+", MAX_BLOOD_LEN - 1);
    organs[2].shelf_life_hours = 24.0;
    organs[2].hla_score = 90;
    strncpy(organs[2].availability, "Available", MAX_STATUS_LEN - 1);
    
    Recipient recs[2];
    memset(recs, 0, sizeof(recs));
    
    /* Recipient 1: Heart, O+, Critical */
    strncpy(recs[0].id, "REC-TEST-1", MAX_ID_LEN - 1);
    strncpy(recs[0].required_organ, "Heart", MAX_TYPE_LEN - 1);
    strncpy(recs[0].blood_group, "O+", MAX_BLOOD_LEN - 1);
    recs[0].urgency = URGENCY_CRITICAL;
    recs[0].waiting_time_days = 400;
    recs[0].hla_requirement = 80;
    strncpy(recs[0].status, "Waiting", MAX_STATUS_LEN - 1);
    
    /* Recipient 2: Heart, O+, High */
    strncpy(recs[1].id, "REC-TEST-2", MAX_ID_LEN - 1);
    strncpy(recs[1].required_organ, "Heart", MAX_TYPE_LEN - 1);
    strncpy(recs[1].blood_group, "O+", MAX_BLOOD_LEN - 1);
    recs[1].urgency = URGENCY_HIGH;
    recs[1].waiting_time_days = 300;
    recs[1].hla_requirement = 85;
    strncpy(recs[1].status, "Waiting", MAX_STATUS_LEN - 1);
    
    AllocationPlan plan = run_greedy_matching(organs, 3, recs, 2);
    
    ASSERT_TEST(plan.match_count == 2, "Exactly 2 matches formed for 2 eligible waiting heart patients");
    
    /* Verify 1:1 constraint */
    bool dup_organ = false;
    bool dup_rec = false;
    for (int i = 0; i < plan.match_count; i++) {
        for (int j = i + 1; j < plan.match_count; j++) {
            if (strcmp(plan.matches[i].organ_id, plan.matches[j].organ_id) == 0) dup_organ = true;
            if (strcmp(plan.matches[i].recipient_id, plan.matches[j].recipient_id) == 0) dup_rec = true;
        }
    }
    ASSERT_TEST(!dup_organ, "No organ was assigned more than once (1:1 organ invariant)");
    ASSERT_TEST(!dup_rec, "No recipient was assigned more than once (1:1 recipient invariant)");
    
    /* Verify most urgent shelf life (ORG-TEST-1) was matched first */
    ASSERT_TEST(strcmp(plan.matches[0].organ_id, "ORG-TEST-1") == 0,
                "Shortest shelf-life organ (3.0h) matched first");
}

static void run_all_unit_tests(void) {
    printf("=================================================================\n");
    printf("     ORGANSYNC C ENGINE AUTOMATED TEST SUITE EXECUTION           \n");
    printf("=================================================================\n");
    
    test_blood_compatibility();
    test_hash_table_operations();
    test_priority_queue_heaps();
    test_bipartite_graph();
    test_fifo_queue();
    test_greedy_matching_no_duplicates();
    
    printf("\n-----------------------------------------------------------------\n");
    printf("Test Results: %d Passed, %d Failed (Total %d Tests)\n",
           tests_passed, tests_failed, tests_passed + tests_failed);
    printf("Status: %s\n", (tests_failed == 0) ? "ALL TESTS PASSED SUCCESSFULLY! [OK]" : "SOME TESTS FAILED! [ERROR]");
    printf("=================================================================\n\n");
}

/* ========================================================================= */
/*                                MAIN ROUTINE                               */
/* ========================================================================= */

int main(int argc, char* argv[]) {
    if (argc < 2) {
        printf("OrganSync - C Matching Engine\n");
        printf("Usage:\n");
        printf("  %s --test                                 Run complete DSA unit tests\n", argv[0]);
        printf("  %s --match <organs.json> <recipients.json>  Run greedy matching and output JSON\n", argv[0]);
        printf("  %s --graph <organs.json> <recipients.json>  Generate bipartite compatibility graph JSON\n", argv[0]);
        printf("  %s --pq <organs.json> <recipients.json>     Generate priority queues (Max & Min Heaps) JSON\n", argv[0]);
        printf("  %s --hash <organs.json> <recipients.json>   Evaluate hash table indexing and collisions\n", argv[0]);
        return 0;
    }
    
    if (strcmp(argv[1], "--test") == 0) {
        run_all_unit_tests();
        return (tests_failed == 0) ? 0 : 1;
    }
    
    if (argc < 4) {
        fprintf(stderr, "Error: Missing input file paths. Usage: %s %s <organs.json> <recipients.json>\n", argv[0], argv[1]);
        return 1;
    }
    
    const char* organs_file = argv[2];
    const char* recipients_file = argv[3];
    
    Organ organs[MAX_LOAD_RECORDS];
    Recipient recipients[MAX_LOAD_RECORDS];
    
    int organ_count = load_organs_from_json_file(organs_file, organs, MAX_LOAD_RECORDS);
    int recipient_count = load_recipients_from_json_file(recipients_file, recipients, MAX_LOAD_RECORDS);
    
    if (organ_count == 0 || recipient_count == 0) {
        fprintf(stderr, "Error: Failed to load records (Loaded %d organs, %d recipients)\n", organ_count, recipient_count);
        return 1;
    }
    
    /* 1. MATCH COMMAND */
    if (strcmp(argv[1], "--match") == 0) {
        AllocationPlan plan = run_greedy_matching(organs, organ_count, recipients, recipient_count);
        write_allocation_plan_json(stdout, &plan);
        return 0;
    }
    
    /* 2. GRAPH COMMAND */
    if (strcmp(argv[1], "--graph") == 0) {
        BipartiteGraph* g = graph_create(organ_count, recipient_count);
        for (int i = 0; i < organ_count; i++) graph_set_organ(g, i, &organs[i]);
        for (int j = 0; j < recipient_count; j++) graph_set_recipient(g, j, &recipients[j]);
        graph_build_compatibility_edges(g);
        write_graph_json(stdout, g);
        graph_free(g);
        return 0;
    }
    
    /* 3. PRIORITY QUEUES COMMAND */
    if (strcmp(argv[1], "--pq") == 0) {
        PriorityQueue* rec_pq = pq_create(recipient_count, PQ_MAX_HEAP);
        for (int j = 0; j < recipient_count; j++) {
            /* Priority = (urgency * 100) + (waiting_days * 0.1) */
            double prio = (recipients[j].urgency * 100.0) + (recipients[j].waiting_time_days * 0.1);
            char detail[MAX_HOSPITAL_LEN];
            snprintf(detail, sizeof(detail), "%s | %s (%s)", recipients[j].hospital, recipients[j].required_organ, recipients[j].blood_group);
            char subtext[MAX_STATUS_LEN];
            snprintf(subtext, sizeof(subtext), "%s - %dd wait", recipients[j].urgency_str, recipients[j].waiting_time_days);
            pq_insert(rec_pq, recipients[j].id, prio, recipients[j].name, detail, subtext);
        }
        
        PriorityQueue* organ_pq = pq_create(organ_count, PQ_MIN_HEAP);
        for (int i = 0; i < organ_count; i++) {
            if (strcmp(organs[i].availability, "Available") == 0) {
                char detail[MAX_HOSPITAL_LEN];
                snprintf(detail, sizeof(detail), "%s | %s (%s)", organs[i].hospital, organs[i].organ_type, organs[i].blood_group);
                char subtext[MAX_STATUS_LEN];
                snprintf(subtext, sizeof(subtext), "%.1f hrs left", organs[i].shelf_life_hours);
                pq_insert(organ_pq, organs[i].id, organs[i].shelf_life_hours, organs[i].organ_type, detail, subtext);
            }
        }
        
        write_priority_queues_json(stdout, rec_pq, organ_pq);
        pq_free(rec_pq);
        pq_free(organ_pq);
        return 0;
    }
    
    /* 4. HASH TABLE COMMAND */
    if (strcmp(argv[1], "--hash") == 0) {
        HashTable* ht = ht_create(DEFAULT_HT_CAPACITY);
        for (int i = 0; i < organ_count; i++) ht_insert_organ(ht, &organs[i]);
        for (int j = 0; j < recipient_count; j++) ht_insert_recipient(ht, &recipients[j]);
        
        int size, collisions;
        double lf;
        ht_get_stats(ht, &size, &collisions, &lf);
        
        printf("{\n");
        printf("  \"capacity\": %d,\n", ht->capacity);
        printf("  \"total_records\": %d,\n", size);
        printf("  \"collisions\": %d,\n", collisions);
        printf("  \"load_factor\": %.4f,\n", lf);
        printf("  \"average_lookup_complexity\": \"O(1)\",\n");
        printf("  \"collision_resolution\": \"Separate Chaining (Linked Lists)\"\n");
        printf("}\n");
        
        ht_free(ht);
        return 0;
    }
    
    fprintf(stderr, "Unknown command argument: %s\n", argv[1]);
    return 1;
}
