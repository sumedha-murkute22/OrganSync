CC = gcc
CFLAGS = -Wall -Wextra -O2 -std=c99
LDFLAGS = -lm

SRCS = main.c models.c hash_table.c priority_queue.c graph.c queue.c matching.c json_io.c
OBJS = $(SRCS:.c=.o)
TARGET = organsync_engine.exe

all: $(TARGET)

$(TARGET): $(OBJS)
	$(CC) $(OBJS) -o $(TARGET) $(LDFLAGS)

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	del /Q *.o $(TARGET) 2>NUL || rm -f *.o $(TARGET)

test: $(TARGET)
	./$(TARGET) --test

.PHONY: all clean test
