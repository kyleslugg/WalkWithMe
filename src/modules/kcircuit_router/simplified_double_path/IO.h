#ifndef IO
#define IO

#include "main.h"
#include "Graph.h"
#include "DoublePathHeuristic.h"

using namespace std;

void readInputFile(string fname, vector<set<Neighbour, minNeighbour> >& AdjList, vector<string>& vName, int& origN, int& origM);
void printGraph(Graph& G);
void printEulerGraphEdges(EulerGraph& H);
void printCircuit(Graph& G, Circuit &C, int solChoice);
void writeCircuitsToFile(Graph& G, vector<Circuit>& C, string& fName);

#endif //IO



