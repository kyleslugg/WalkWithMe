#include "APs.h"

extern int verbose;

void APDFS(Graph& G, int u, vector<bool>& visited, vector<int>& disc, vector<int>& low, vector<int>& pred, vector<bool>& AP, int& time) {
	// Here "u" is the vertex to be visited next,  "visited" keeps track of visited vertices, 
	// "disc" stores the discovery times of visited vertices, "pred" stores the predecessors in the DFS tree, 
	// and AP stores the articulation points
	int v, children = 0;
	visited[u] = true;
	disc[u] = low[u] = ++time;
	for (auto& el : G.AList[u]) {
		v = el.vertex;
		if (!visited[v]) {
			children++;
			pred[v] = u;
			APDFS(G, v, visited, disc, low, pred, AP, time);
			low[u] = minVal(low[u], low[v]);
			//u is an AP if (1) u is the root of DFS tree and has two or more children, or (2) u is not the root, and the lowest value 
			//of one of its children is more than the discovery value of u.
			if (pred[u] == null && children > 1) AP[u] = true;
			if (pred[u] != null && low[v] >= disc[u]) AP[u] = true;
		}
		else if (v != pred[u]) {
			low[u] = minVal(low[u], disc[v]);
		}
	}
}
set<int> getArticPoints(Graph& G) {
	//Returns a set containing all articulation points in G. This uses Tarjan's algorithm (i.e., via a DFS traversal). 
	//This is a recursive algorithm -- as a result, for very large graphs we could get a stack overflow error. These
	//are not usually picked up with a try... catch... condition in c++ and can therefore cause an unexplained crash. If this 
	//is the case there are two solutions:
	//(a) Change the compiler options to allow a bigger stack in memory. In Visual Studio, the default stack size is a tiny 1MB.
	//    This can be increased manually by going to Project >> Properties >> Linker >> All Options, and then specifying a different value for 
	//    "Stack Commit Size" and "Stack Reserve Size". This value is specified in bytes, so 10,485,760‬ specifies 10 MB.
	//(b) A second, more sustainable, option it to implement an iterative version of this algorithm (pending...)
	set<int> X;
	vector<bool> visited(G.n, false), AP(G.n, false);
	vector<int> disc(G.n), low(G.n), pred(G.n, null);
	int time = 0;
	for (int i = 0; i < G.n; i++) {
		if (visited[i] == false) APDFS(G, i, visited, disc, low, pred, AP, time);
	}
	//AP now contains all articulation points. Put them into X and return it
	for (int i = 0; i < G.n; i++) if (AP[i] == true) X.insert(i);
	return X;
}
