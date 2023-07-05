EXEC=kcircuit
HEADS=APs.h Bhandari.h Bridges.h Connected.h DoublePathHeuristic.h EulerCircuit.h Graph.h IO.h LS.h main.h ShortestPath.h Yen.h
OBJ=APs.o Bhandari.o Bridges.o Connected.o DoublePathHeuristic.o EulerCircuit.o Graph.o IO.o LS.o main.o ShortestPath.o Yen.o
CPP=g++
OPTS=-std=c++14 -O3 ${GFLAGS}

all: ${EXEC}

${EXEC}: ${OBJ}
	${CPP} ${OPTS} -o $@ ${OBJ}

%.o: %.cpp ${HEADS}
	${CPP} ${OPTS} -c -o $@ $<

clean:
	rm -f ${OBJ} ${EXEC}
