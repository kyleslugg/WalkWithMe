#ifndef DOUBLEPATHHEURISTIC
#define DOUBLEPATHHEURISTIC

#include "main.h"
#include "Bhandari.h"

using namespace std;

vector<Circuit> doublePathHeuristic(Graph& G, int s, int k, int solChoice, int algChoice, int SPAlg, bool haltAtOptimal, int& numIts, clock_t& splitTime);

#endif //DOUBLEPATHHEURISTIC
