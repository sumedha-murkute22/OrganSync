#ifndef HASH_TABLE_H
#define HASH_TABLE_H

#include "models.h"
#include <stdbool.h>

#define DEFAULT_HT_CAPACITY 64
#define HT_MAX_LOAD_FACTOR 0.75

typedef enum {
    NODE_TYPE_ORGAN = 1,
    NODE_TYPE_RECIPIENT = 2,
    NODE_TYPE_GENERIC = 3
} NodeType;

typedef struct HashNode {
    char key[MAX_ID_LEN];
    NodeType type;
    union {
        Organ organ;
        Recipient recipient;
        char value[256];
    } data;
    struct HashNode* next;
} HashNode;

typedef struct {
    HashNode** buckets;
    int capacity;
    int size;
    int collisions;
} HashTable;

HashTable* ht_create(int capacity);
void ht_free(HashTable* ht);
unsigned long ht_hash(const char* str, int capacity);

bool ht_insert_organ(HashTable* ht, const Organ* organ);
Organ* ht_search_organ(const HashTable* ht, const char* organ_id);
bool ht_delete_organ(HashTable* ht, const char* organ_id);

bool ht_insert_recipient(HashTable* ht, const Recipient* recipient);
Recipient* ht_search_recipient(const HashTable* ht, const char* recipient_id);
bool ht_delete_recipient(HashTable* ht, const char* recipient_id);

bool ht_insert_str(HashTable* ht, const char* key, const char* val);
const char* ht_search_str(const HashTable* ht, const char* key);

int ht_size(const HashTable* ht);
int ht_collisions(const HashTable* ht);

#endif /* HASH_TABLE_H */
