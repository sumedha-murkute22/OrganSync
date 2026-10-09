#ifndef STACK_H
#define STACK_H

#include <stdbool.h>

#define MAX_STACK_STR 128

typedef struct {
    char action_id[64];
    char case_id[64];
    char previous_state[64];
    char new_state[64];
    char actor[64];
    char timestamp[64];
    char details[256];
    bool is_reversible;
} WorkflowStep;

typedef struct {
    WorkflowStep* items;
    int top;
    int capacity;
} Stack;

Stack* stack_create(int initial_capacity);
void stack_free(Stack* stack);
bool stack_push(Stack* stack, const WorkflowStep* step);
bool stack_pop(Stack* stack, WorkflowStep* out_step);
bool stack_peek(const Stack* stack, WorkflowStep* out_step);
bool stack_is_empty(const Stack* stack);
int stack_size(const Stack* stack);
void stack_clear(Stack* stack);

#endif /* STACK_H */
