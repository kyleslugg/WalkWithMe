#include "Graph.h"

extern int verbose;

long long getArcWeight(Graph& G, int u, int v) {
	//Returns the weight of arc (u, v) in the adjacency list
	set<Neighbour, minNeighbour>::iterator it = G.AList[u].find({ v, 0 });
	if (it != G.AList[u].end()) {
		return((*it).weight);
	}
	else {
		logAndExit("Error: Accessing a weight of a non-existent edge. Ending... \n");
		return -1;
	}
}
long long deleteArc(Graph& G, int u, int v) {
	//Deletes the arc (u, v) in the adjacency list and returns its weight
	set<Neighbour, minNeighbour>::iterator it = G.AList[u].find({ v, 0 });
	long long w = (*it).weight;
	G.AList[u].erase(it);
	return w;
}
void addArc(Graph& G, int u, int v, long long w) {
	//Adds the arc (u, v) with weight w to the adjacency list
	G.AList[u].insert({ v, w });
}
bool existsArc(Graph& G, int u, int v) {
	//Checks if (u,v) exists in the adjacency list
	if (G.AList[u].count({ v, 0 }) != 0) return true;
	else return false;
}
bool isBridge(Graph& G, int u, int v) {
	//Checks if {u,v} is a bridge
	if (u > v) swapVals(u, v);
	if (G.bridges.count({ u,v }) >= 0) return true;
	else return false;
}
Graph getInducedGraph(Graph& G, set<int>& X, int& source) {
	//Return the induced subgraph of G specified by the vertices in X. Start by making an alias for each vertex we will keep
	vector<int> alias(G.n, null);
	int cnt = 0, x;
	for (auto& v : X) {
		alias[v] = cnt;
		cnt++;
	}
	//Now construct the new graph GPrime from G
	Graph GPrime;
	GPrime.n = X.size();
	GPrime.numDummies = 0;
	GPrime.AList.resize(GPrime.n, set<Neighbour, minNeighbour>());
	GPrime.osmID.resize(GPrime.n);
	GPrime.parent.resize(GPrime.n);
	GPrime.m = 0;
	GPrime.maxEdgeWeight = -1;
	for (auto& u : X) {
		x = alias[u];
		GPrime.osmID[x] = G.osmID[u];
		GPrime.parent[x] = x;
		for (auto& v : G.AList[u]) {
			if (alias[v.vertex] != null) {
				addArc(GPrime, x, alias[v.vertex], v.weight);
				GPrime.m++;
				if (v.weight > GPrime.maxEdgeWeight) GPrime.maxEdgeWeight = v.weight;
			}
		}
	}
	GPrime.m = GPrime.m / 2;
	//Now relabel the source and return this new graph
	source = alias[source];
	return GPrime;
}
set<int> IDLeafVertices(Graph& G, int& source) {
	//Repeatedly remove all degree-1 vertices (not including the source). Return the set of reamining vertices. Uses a copy of G's AList
	int u, v, w = 0;
	vector<set<Neighbour, minNeighbour>> A = G.AList;
	set<int> S;
	for (v = 0; v < G.n; v++) {
		if (A[v].size() == 1) S.insert(v);
	}
	S.erase(source);
	//Now isolate degree-1 vertices, and ID any resulting degree-1 vertices. Continue until there are no degree-1 vertices.	
	while (!S.empty()) {
		u = *S.begin();
		v = (*A[u].begin()).vertex;
		A[u].erase({ v, w });
		A[v].erase({ u, w });
		S.erase(u);
		if (A[v].size() == 1 && v != source) {
			S.insert(v);
		}
	}
	//Now ID all non-isolated vertices and return this set
	S.clear();
	for (u = 0; u < G.n; u++) {
		if (!A[u].empty()) S.insert(u);
	}
	S.insert(source);
	return(S);
}
void raiseVertexConnectivityToTwo(Graph& G, set<int>& A) {
	for (auto& u : A) {
		//Add a dummy vertex uPrime to the graph. The "parent" of uPrime is u
		int uPrime = G.n;
		G.n++;
		G.numDummies++;
		G.osmID.push_back(G.osmID[u]);
		G.parent.push_back(u);
		G.AList.push_back(set<Neighbour, minNeighbour>());
		//Add appropriate arcs
		for (auto& v : G.AList[u]) {
			addArc(G, uPrime, v.vertex, v.weight);
			addArc(G, v.vertex, uPrime, v.weight);
			G.m++;
		}
		addArc(G, u, uPrime, 0);
		addArc(G, uPrime, u, 0);
		G.m++;
	}
}
Graph makeGraph(vector<set<Neighbour, minNeighbour> >& adjList, vector<string>& vName, int k, int& source, bool remDegOne, bool addDummies) {
	//Construct the graph G from a vector of vertex names and an adjacency list
	Graph G;
	G.n = adjList.size();
	G.numDummies = 0;
	G.AList.swap(adjList);
	G.osmID.swap(vName);
	G.parent.resize(G.n);
	G.m = 0;
	G.maxEdgeWeight = -1;
	for (int u = 0; u < G.n; u++) {
		G.parent[u] = u;
		G.m += G.AList[u].size();
		for (auto& v : G.AList[u]) {
			if (v.weight > G.maxEdgeWeight) G.maxEdgeWeight = v.weight;
		}
	}
	G.m = G.m / 2;
	if (verbose >= 1) {
		if (verbose >= 4) printGraph(G);
		cout << "Starting graph has " << G.n << " vertices, " << G.m << " edges, and ";
		if (isConnected(G)) cout << "is connected ...\n";
		else cout << "is not connected ...\n";
	}	
	//Use Dijkstras algorithm to determine a set X of all vertices within (k + 1) / 2 units of s
	vector<int> prev;
	vector<long long> L;
	long long maxDist = (k + 1) / 2;
	DijkstraMaxDist(G, source, maxDist, L, prev);
	set<int> X;
	for (int i = 0; i < L.size(); i++) {
		if (L[i] <= maxDist) {
			X.insert(i);
		}
	}
	//Now set G to be the connected graph induced by X. This will now be connected. We also need to relabel the source here
	G = getInducedGraph(G, X, source);
	if (verbose >= 1) cout << "Removing vertices more than " << k << " / 2 units from the source. Resultant (connected) graph has " << G.n << " vertices and " << G.m << " edges ...\n";
	//We can now also remove all degree-1 vertices if we want to
	if (remDegOne) {
		X = IDLeafVertices(G, source);
		G = getInducedGraph(G, X, source);
		if (verbose >= 1) cout << "Removing all degree-1 vertices. Resultant (connected) graph has " << G.n << " vertices and " << G.m << " edges ...\n";
	}
	//If using Yen's algorithm we need to raise the vertex connectivity to two by adding dummy vertices and edges for each articulation point
	if (addDummies) {
		set<int> A = getArticPoints(G);
		if (!A.empty()) raiseVertexConnectivityToTwo(G, A);
		if (verbose >= 1) cout << "Raising vertex-connectivity to two. Resultant (connected) graph has " << G.n << " vertices and " << G.m << " edges ...\n";
	}
	//The final graph has now been constructed. We now calculate a value for INF2 (called B in the paper). Before we do this, we need to check for the possibility
	//of overflow. In the worst case, INF2 = G.m * G.maxEdgeWeight, and we will produce a path with value:
	// n * (INF2 + G.maxWeightEdge) (for edge-disjoint paths). 
	// n * (INF2 + G.maxWeightEdge) + n * (INF2)
	// To be extra safe, we use the latter, hence we check that (2 * n * INF2) + (n * G.maxWeightEdge) is less than INT64_MAX
	//Rearranging this slightly gives the following check.
	if (G.m > 0) {
		if (((long long)(G.m) * G.maxEdgeWeight * 2) > ((INT64_MAX - (long long)(G.n * G.maxEdgeWeight)) / G.n)) {
			logAndExit("Error. There is a risk of overflow due to the graph's size and the edge weights used. Exiting ... \n");
		}
	}
	for (int i = 0; i < G.n; i++) {
		for (auto& el : G.AList[i]) {
			if (el.weight < infty) {
				G.INF2 += el.weight;
			}
		}
	}
	G.INF2 = (G.INF2 / 2) + 1;
	//Finally, we want to calculate the articulation points and bridges of this graph
	G.APs = getArticPoints(G);
	G.bridges = getBridges(G);
	if (verbose >= 1) cout << "This has " << G.APs.size() << " articulation points and " << G.bridges.size() << " bridges ...\n";
	if (verbose >= 3) printGraph(G);
	return(G);
}
