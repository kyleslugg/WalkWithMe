#ifndef SHORTESTPATH
#define SHORTESTPATH

#include "main.h"

using namespace std;

void Dijkstra(Graph& G, int s, int t, vector<long long>& L, vector<int>& prev);
void DijkstraSet(Graph& G, int s, set<int>& T, vector<long long>& L, vector<int>& prev);
void DijkstraMaxDist(Graph& G, int s, long long dist, vector<long long>& L, vector<int>& prev);
void modifiedDijkstra(Graph& G, int s, int t, vector<long long>& L, vector<int>& prev);
void MooresAlgorithm(Graph& G, int s, int t, vector<long long>& L, vector<int>& prev);
void bfsSet(Graph& G, int s, set<int>& T, vector<long long>& L, vector<int>& prev);

#endif //SHORTESTPATH




