#ifndef LS
#define LS

#include "main.h"
#include "Graph.h"
#include "ShortestPath.h"
#include "DoublePathHeuristic.h"

using namespace std;

void doLocalSearch(Graph& G, vector<Circuit>& archive, int k, int solChoice, int algChoice, int SPAlg, int LSOption, int& LSIts);

#endif //LS