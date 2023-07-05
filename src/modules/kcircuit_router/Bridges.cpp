#include "Bridges.h"

extern int verbose;

void bridgeDFS(Graph& G, int u, vector<bool>& visited, vector<int>& disc, vector<int>& low, vector<int>& pred, int& time, set<Edge, minEdge>& B) {
	// A recursive function that finds all bridges using DFS traversal. "u" is the vertex to be visited next, 
	// "visited" keeps track of visited vertices, "disc[]" stores discovery times of visited vertices and
	// "pred" stores predecessors from in DFS tree 
	visited[u] = true;
	disc[u] = low[u] = ++time;
	for (auto& el : G.AList[u]) {
		int v = el.vertex;
		if (!visited[v]) {
			pred[v] = u;
			bridgeDFS(G, v, visited, disc, low, pred, time, B);
			low[u] = minVal(low[u], low[v]);
			// If the lowest vertex reachable from subtree under v is below u in DFS tree, then the edge {u,v} is a bridge 
			if (low[v] > disc[u]) {
				if (u < v) B.insert({ u, v });
				else B.insert({ v, u });
			}
		}
		else if (v != pred[u]) {
			low[u] = minVal(low[u], disc[v]);
		}
	}
}
set<Edge, minEdge> getBridges(Graph& G) {
	//Returns a set containing all bridges. This uses Tarjan's algorithm (i.e., via a DFS traversal). 
	//Note that this is a recursive algorithm -- as a result, for very large graphs we could get a stack overflow error. These
	//are not usually picked up with a try... catch... condition in c++ and can therefore cause an unexplained crash. If this 
	//is the case there are two solutions:
	//(a) Change the compiler options to allow a bigger stack in memory. In Visual Studio, the default stack size is 1MB.
	//    This can be increased manually by going to Project >> Properties >> Linker >> All Options, and then specifying a different value for 
	//    "Stack Commit Size" and "Stack Reserve Size". This value is specified in Bytes, so 10,485,760‬ specifies 10 MB.
	//(b) A second, more sustainable, option it to implement an iterative version of this algorithm (pending...)
	int time = 0;
	set<Edge, minEdge> B;
	vector<bool> visited(G.n, false);
	vector<int> disc(G.n), low(G.n), pred(G.n, null);
	for (int i = 0; i < G.n; i++) {
		if (visited[i] == false) bridgeDFS(G, i, visited, disc, low, pred, time, B);
	}
	return B;
}
