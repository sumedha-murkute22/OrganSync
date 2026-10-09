# OrganSync C DSA Engine Makefile
CC = gcc
CFLAGS = -Wall -Wextra -std=c11 -O2 -Iinclude
SRC = src/models.c src/stack.c src/queue.c src/hash_table.c src/priority_queue.c src/graph.c src/compatibility.c src/matching_engine.c

all: organsync_engine test_dsa

organsync_engine: $(SRC) src/main.c
	$(CC) $(CFLAGS) -o organsync_engine.exe src/main.c $(SRC) -lm

test_dsa: $(SRC) tests/test_dsa.c
	$(CC) $(CFLAGS) -o test_dsa.exe tests/test_dsa.c $(SRC) -lm

clean:
	rm -f organsync_engine.exe test_dsa.exe *.o
