#include "Connected.h"

extern int verbose;

void connectedBFS(Graph& G, int s, set<int>& reachable, set<int>& unreachable) {
	//Uses BFS to produce two sets: vertices reachable from the vertex s, and vertices not reachable from s
	int u, v;
	reachable.clear();
	unreachable.clear();
	vector<int> col(G.n, white);
	deque<int> Q;
	col[s] = grey;
	Q.push_back(s);
	while (!Q.empty()) {
		u = Q.front();
		for (auto& el : G.AList[u]) {
			v = el.vertex;
			if (col[v] == white) {
				col[v] = grey;
				Q.push_back(v);
			}
		}
		Q.pop_front();
		col[u] = black;
	}
	//All reachable vertices are coloured black.
	for (v = 0; v < G.n; v++) {
		if (col[v] == black)	reachable.insert(v);
		else					unreachable.insert(v);
	}
}
bool isConnected(Graph& G) {
	//The (undirected) graph is connected iff all vertices can be reached from vertex zero. 
	set<int> reachable, unreachable;
	connectedBFS(G, 0, reachable, unreachable);
	if (reachable.size() == G.n)	return true;
	else							return false;
}
set<int> getReachable(Graph& G, int source) {
	//Returns the set of vertices reachable from source
	set<int> reachable, unreachable;
	connectedBFS(G, source, reachable, unreachable);
	return(reachable);
}
set<int> getUnreachable(Graph& G, int source) {
	//Returns the set of vertices not reachable from source
	set<int> reachable, unreachable;
	connectedBFS(G, source, reachable, unreachable);
	return(unreachable);
}
