#ifndef HASH_TABLE_H
#define HASH_TABLE_H

#include "models.h"
#include <stdbool.h>

#define DEFAULT_HT_CAPACITY 101

typedef enum {
    ENTRY_ORGAN = 1,
    ENTRY_RECIPIENT = 2
} EntryType;

typedef struct HashNode {
    char key[MAX_ID_LEN];
    EntryType type;
    union {
        Organ organ;
        Recipient recipient;
    } data;
    struct HashNode* next;
} HashNode;

typedef struct {
    HashNode** buckets;
    int capacity;
    int size;
    int collisions;
} HashTable;

/* Hash Table Lifecycle */
HashTable* ht_create(int capacity);
void ht_free(HashTable* ht);

/* Hashing Algorithm (DJB2) */
unsigned long ht_hash(const char* str, int capacity);

/* Organ Operations */
bool ht_insert_organ(HashTable* ht, const Organ* organ);
Organ* ht_search_organ(HashTable* ht, const char* id);
bool ht_delete_organ(HashTable* ht, const char* id);

/* Recipient Operations */
bool ht_insert_recipient(HashTable* ht, const Recipient* recipient);
Recipient* ht_search_recipient(HashTable* ht, const char* id);
bool ht_delete_recipient(HashTable* ht, const char* id);

/* Diagnostics and Statistics */
void ht_get_stats(const HashTable* ht, int* size, int* collisions, double* load_factor);
void ht_print_diagnostics(const HashTable* ht);

#endif /* HASH_TABLE_H */
