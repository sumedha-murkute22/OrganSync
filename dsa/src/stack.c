/**
 * OrganSync - Stack Implementation
 * 
 * Used for tracking case review history and reversible non-clinical workflow steps.
 * Clinical decisions and finalized audit trails remain immutable.
 */

#include "../include/stack.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

Stack* stack_create(int initial_capacity) {
    if (initial_capacity <= 0) initial_capacity = 16;
    Stack* stack = (Stack*)malloc(sizeof(Stack));
    if (!stack) return NULL;
    
    stack->items = (WorkflowStep*)malloc(sizeof(WorkflowStep) * initial_capacity);
    if (!stack->items) {
        free(stack);
        return NULL;
    }
    
    stack->top = -1;
    stack->capacity = initial_capacity;
    return stack;
}

void stack_free(Stack* stack) {
    if (!stack) return;
    if (stack->items) {
        free(stack->items);
    }
    free(stack);
}

bool stack_push(Stack* stack, const WorkflowStep* step) {
    if (!stack || !step) return false;
    
    /* Dynamically resize if full */
    if (stack->top + 1 >= stack->capacity) {
        int new_capacity = stack->capacity * 2;
        WorkflowStep* new_items = (WorkflowStep*)realloc(stack->items, sizeof(WorkflowStep) * new_capacity);
        if (!new_items) return false;
        stack->items = new_items;
        stack->capacity = new_capacity;
    }
    
    stack->top++;
    stack->items[stack->top] = *step;
    return true;
}

bool stack_pop(Stack* stack, WorkflowStep* out_step) {
    if (!stack || stack->top < 0) return false;
    
    if (out_step) {
        *out_step = stack->items[stack->top];
    }
    stack->top--;
    return true;
}

bool stack_peek(const Stack* stack, WorkflowStep* out_step) {
    if (!stack || stack->top < 0) return false;
    
    if (out_step) {
        *out_step = stack->items[stack->top];
    }
    return true;
}

bool stack_is_empty(const Stack* stack) {
    if (!stack) return true;
    return stack->top < 0;
}

int stack_size(const Stack* stack) {
    if (!stack) return 0;
    return stack->top + 1;
}

void stack_clear(Stack* stack) {
    if (stack) {
        stack->top = -1;
    }
}
