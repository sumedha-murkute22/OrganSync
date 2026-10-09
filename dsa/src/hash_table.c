/**
 * OrganSync - Hash Table Implementation
 * 
 * DJB2 hashing with separate chaining collision resolution.
 * Automatically resizes when load factor exceeds 0.75.
 * Provides O(1) average-time lookups for clinical entities.
 */

#include "../include/hash_table.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

unsigned long ht_hash(const char* str, int capacity) {
    if (!str || capacity <= 0) return 0;
    unsigned long hash = 5381;
    int c;
    while ((c = (unsigned char)*str++)) {
        hash = ((hash << 5) + hash) + c; /* hash * 33 + c */
    }
    return hash % (unsigned long)capacity;
}

HashTable* ht_create(int capacity) {
    if (capacity <= 0) capacity = DEFAULT_HT_CAPACITY;
    
    HashTable* ht = (HashTable*)malloc(sizeof(HashTable));
    if (!ht) return NULL;
    
    ht->buckets = (HashNode**)calloc(capacity, sizeof(HashNode*));
    if (!ht->buckets) {
        free(ht);
        return NULL;
    }
    
    ht->capacity = capacity;
    ht->size = 0;
    ht->collisions = 0;
    return ht;
}

void ht_free(HashTable* ht) {
    if (!ht) return;
    for (int i = 0; i < ht->capacity; i++) {
        HashNode* curr = ht->buckets[i];
        while (curr) {
            HashNode* temp = curr;
            curr = curr->next;
            free(temp);
        }
    }
    free(ht->buckets);
    free(ht);
}

static void ht_resize(HashTable* ht) {
    int new_capacity = ht->capacity * 2;
    HashNode** new_buckets = (HashNode**)calloc(new_capacity, sizeof(HashNode*));
    if (!new_buckets) return;
    
    ht->collisions = 0;
    for (int i = 0; i < ht->capacity; i++) {
        HashNode* curr = ht->buckets[i];
        while (curr) {
            HashNode* next = curr->next;
            unsigned long new_idx = ht_hash(curr->key, new_capacity);
            if (new_buckets[new_idx] != NULL) {
                ht->collisions++;
            }
            curr->next = new_buckets[new_idx];
            new_buckets[new_idx] = curr;
            curr = next;
        }
    }
    free(ht->buckets);
    ht->buckets = new_buckets;
    ht->capacity = new_capacity;
}

bool ht_insert_organ(HashTable* ht, const Organ* organ) {
    if (!ht || !organ || organ->id[0] == '\0') return false;
    
    if ((double)(ht->size + 1) / ht->capacity > HT_MAX_LOAD_FACTOR) {
        ht_resize(ht);
    }
    
    unsigned long idx = ht_hash(organ->id, ht->capacity);
    HashNode* curr = ht->buckets[idx];
    
    while (curr) {
        if (strcmp(curr->key, organ->id) == 0 && curr->type == NODE_TYPE_ORGAN) {
            curr->data.organ = *organ;
            return true;
        }
        curr = curr->next;
    }
    
    HashNode* node = (HashNode*)malloc(sizeof(HashNode));
    if (!node) return false;
    
    strncpy(node->key, organ->id, MAX_ID_LEN - 1);
    node->key[MAX_ID_LEN - 1] = '\0';
    node->type = NODE_TYPE_ORGAN;
    node->data.organ = *organ;
    
    if (ht->buckets[idx] != NULL) {
        ht->collisions++;
    }
    node->next = ht->buckets[idx];
    ht->buckets[idx] = node;
    ht->size++;
    return true;
}

Organ* ht_search_organ(const HashTable* ht, const char* organ_id) {
    if (!ht || !organ_id) return NULL;
    unsigned long idx = ht_hash(organ_id, ht->capacity);
    HashNode* curr = ht->buckets[idx];
    while (curr) {
        if (strcmp(curr->key, organ_id) == 0 && curr->type == NODE_TYPE_ORGAN) {
            return &curr->data.organ;
        }
        curr = curr->next;
    }
    return NULL;
}

bool ht_delete_organ(HashTable* ht, const char* organ_id) {
    if (!ht || !organ_id) return false;
    unsigned long idx = ht_hash(organ_id, ht->capacity);
    HashNode* curr = ht->buckets[idx];
    HashNode* prev = NULL;
    
    while (curr) {
        if (strcmp(curr->key, organ_id) == 0 && curr->type == NODE_TYPE_ORGAN) {
            if (prev) {
                prev->next = curr->next;
            } else {
                ht->buckets[idx] = curr->next;
            }
            free(curr);
            ht->size--;
            return true;
        }
        prev = curr;
        curr = curr->next;
    }
    return false;
}

bool ht_insert_recipient(HashTable* ht, const Recipient* recipient) {
    if (!ht || !recipient || recipient->id[0] == '\0') return false;
    
    if ((double)(ht->size + 1) / ht->capacity > HT_MAX_LOAD_FACTOR) {
        ht_resize(ht);
    }
    
    unsigned long idx = ht_hash(recipient->id, ht->capacity);
    HashNode* curr = ht->buckets[idx];
    
    while (curr) {
        if (strcmp(curr->key, recipient->id) == 0 && curr->type == NODE_TYPE_RECIPIENT) {
            curr->data.recipient = *recipient;
            return true;
        }
        curr = curr->next;
    }
    
    HashNode* node = (HashNode*)malloc(sizeof(HashNode));
    if (!node) return false;
    
    strncpy(node->key, recipient->id, MAX_ID_LEN - 1);
    node->key[MAX_ID_LEN - 1] = '\0';
    node->type = NODE_TYPE_RECIPIENT;
    node->data.recipient = *recipient;
    
    if (ht->buckets[idx] != NULL) {
        ht->collisions++;
    }
    node->next = ht->buckets[idx];
    ht->buckets[idx] = node;
    ht->size++;
    return true;
}

Recipient* ht_search_recipient(const HashTable* ht, const char* recipient_id) {
    if (!ht || !recipient_id) return NULL;
    unsigned long idx = ht_hash(recipient_id, ht->capacity);
    HashNode* curr = ht->buckets[idx];
    while (curr) {
        if (strcmp(curr->key, recipient_id) == 0 && curr->type == NODE_TYPE_RECIPIENT) {
            return &curr->data.recipient;
        }
        curr = curr->next;
    }
    return NULL;
}

bool ht_delete_recipient(HashTable* ht, const char* recipient_id) {
    if (!ht || !recipient_id) return false;
    unsigned long idx = ht_hash(recipient_id, ht->capacity);
    HashNode* curr = ht->buckets[idx];
    HashNode* prev = NULL;
    
    while (curr) {
        if (strcmp(curr->key, recipient_id) == 0 && curr->type == NODE_TYPE_RECIPIENT) {
            if (prev) {
                prev->next = curr->next;
            } else {
                ht->buckets[idx] = curr->next;
            }
            free(curr);
            ht->size--;
            return true;
        }
        prev = curr;
        curr = curr->next;
    }
    return false;
}

bool ht_insert_str(HashTable* ht, const char* key, const char* val) {
    if (!ht || !key || !val) return false;
    
    if ((double)(ht->size + 1) / ht->capacity > HT_MAX_LOAD_FACTOR) {
        ht_resize(ht);
    }
    
    unsigned long idx = ht_hash(key, ht->capacity);
    HashNode* curr = ht->buckets[idx];
    while (curr) {
        if (strcmp(curr->key, key) == 0 && curr->type == NODE_TYPE_GENERIC) {
            strncpy(curr->data.value, val, 255);
            curr->data.value[255] = '\0';
            return true;
        }
        curr = curr->next;
    }
    
    HashNode* node = (HashNode*)malloc(sizeof(HashNode));
    if (!node) return false;
    strncpy(node->key, key, MAX_ID_LEN - 1);
    node->key[MAX_ID_LEN - 1] = '\0';
    node->type = NODE_TYPE_GENERIC;
    strncpy(node->data.value, val, 255);
    node->data.value[255] = '\0';
    
    node->next = ht->buckets[idx];
    ht->buckets[idx] = node;
    ht->size++;
    return true;
}

const char* ht_search_str(const HashTable* ht, const char* key) {
    if (!ht || !key) return NULL;
    unsigned long idx = ht_hash(key, ht->capacity);
    HashNode* curr = ht->buckets[idx];
    while (curr) {
        if (strcmp(curr->key, key) == 0 && curr->type == NODE_TYPE_GENERIC) {
            return curr->data.value;
        }
        curr = curr->next;
    }
    return NULL;
}

int ht_size(const HashTable* ht) {
    return ht ? ht->size : 0;
}

int ht_collisions(const HashTable* ht) {
    return ht ? ht->collisions : 0;
}
