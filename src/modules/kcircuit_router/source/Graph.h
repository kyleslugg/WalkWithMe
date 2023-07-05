#ifndef GRAPH
#define GRAPH

#include "main.h"
#include "IO.h"
#include "APs.h"
#include "Bridges.h"
#include "Connected.h"
#include "ShortestPath.h"

using namespace std;

Graph makeGraph(vector<set<Neighbour, minNeighbour> >& adjList, vector<string>& vName, int k, int& s, bool remDegOne, bool addDummies);
Graph getInducedGraph(Graph& G, set<int>& X, int& source);
long long getArcWeight(Graph& G, int u, int v);
long long deleteArc(Graph& G, int u, int v);
void addArc(Graph& G, int u, int v, long long w);
bool existsArc(Graph& G, int u, int v);
bool isBridge(Graph& G, int u, int v);

#endif //GRAPH