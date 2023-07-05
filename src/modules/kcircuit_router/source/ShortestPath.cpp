#include "ShortestPath.h"

void Dijkstra(Graph& G, int s, int t, vector<long long>& L, vector<int>& prev) {
	//Standard Dijkstra's algorithm from source s using a priority queue Q. Halts when (a) Q is empty, or (b) t becomes distinguished. 
	//If t is not in the vertex set (e.g. t == -1), then a shortest path tree rooted at s is returned in L and prev.
	//Any infty-weighted edges are ignored (i.e. we pretend they are not there)
	int u, v;
	long long w;
	set<LabelItem, minLabel> Q;
	set<LabelItem, minLabel>::iterator minPtr;
	L.resize(G.n);
	prev.resize(G.n);
	vector<bool> D(G.n);
	for (v = 0; v < G.n; v++) {
		D[v] = false;
		prev[v] = null;
		L[v] = infty;
	}
	L[s] = 0;
	Q.emplace(LabelItem{ s, 0 });
	while (!Q.empty()) {
		minPtr = Q.begin();
		u = (*minPtr).vertex;
		Q.erase(minPtr);
		D[u] = true;
		if (u == t) {
			return;
		}
		for (auto& e : G.AList[u]) {
			v = e.vertex;
			w = e.weight;
			if (w != infty && D[v] == false) {
				if (L[u] + w < L[v]) {
					if (L[v] != infty) {
						Q.erase({ v, L[v] });
					}
					L[v] = L[u] + w;
					Q.emplace(LabelItem{ v, L[v] });
					prev[v] = u;
				}
			}
		}
	}
}
void DijkstraSet(Graph& G, int s, set<int>& T, vector<long long>& L, vector<int>& prev) {
	//Standard Dijkstra's algorithm from source s. Halts when (a) Q is empty, or (b) all vertices in T have become distinguished. 
	//Any infty-weighted edges are ignored (i.e. we pretend they are not there)
	int u, v;
	long long w;
	set<LabelItem, minLabel> Q;
	set<LabelItem, minLabel>::iterator minPtr;
	L.resize(G.n);
	prev.resize(G.n);
	vector<bool> D(G.n);
	for (v = 0; v < G.n; v++) {
		D[v] = false;
		prev[v] = null;
		L[v] = infty;
	}
	L[s] = 0;
	Q.emplace(LabelItem{ s, 0 });
	while (!Q.empty()) {
		minPtr = Q.begin();
		u = (*minPtr).vertex;
		Q.erase(minPtr);
		D[u] = true;
		T.erase(u);
		if (T.empty()) {
			return;
		}
		for (auto& e : G.AList[u]) {
			v = e.vertex;
			w = e.weight;
			if (w != infty && D[v] == false) {
				if (L[u] + w < L[v]) {
					if (L[v] != infty) {
						Q.erase({ v, L[v] });
					}
					L[v] = L[u] + w;
					Q.emplace(LabelItem{ v, L[v] });
					prev[v] = u;
				}
			}
		}
	}
}
void DijkstraMaxDist(Graph& G, int s, long long dist, vector<long long>& L, vector<int>& prev) {
	//Standard Dijkstra's algorithm from source s. Halts when (a) Q is empty, or (b) all remaining undistinguished vertices are more than "dist" units from s. 
	//Any infty-weighted edges are ignored (i.e. we pretend they are not there)
	int u, v;
	long long w;
	set<LabelItem, minLabel> Q;
	set<LabelItem, minLabel>::iterator minPtr;
	L.resize(G.n);
	prev.resize(G.n);
	vector<bool> D(G.n);
	for (v = 0; v < G.n; v++) {
		D[v] = false;
		prev[v] = null;
		L[v] = infty;
	}
	L[s] = 0;
	Q.emplace(LabelItem{ s, 0 });
	while (!Q.empty()) {
		minPtr = Q.begin();
		if ((*minPtr).label > dist) {
			return;
		}
		u = (*minPtr).vertex;
		Q.erase(minPtr);
		D[u] = true;
		for (auto& e : G.AList[u]) {
			v = e.vertex;
			w = e.weight;
			if (w != infty && D[v] == false) {
				if (L[u] + w < L[v]) {
					if (L[v] != infty) {
						Q.erase({ v, L[v] });
					}
					L[v] = L[u] + w;
					Q.emplace(LabelItem{ v, L[v] });
					prev[v] = u;
				}
			}
		}
	}
}
void modifiedDijkstra(Graph& G, int s, int t, vector<long long>& L, vector<int>& prev) {
	//Modified Dijkstra's algorithm from source s. Halts when t becomes distinguished. This version can handle negative edges (but not negative cycles),
	//but it's worst case run time is also exponential. Any infty-weighted edges are ignored (i.e. we pretend they are not there)
	int u, v;
	long long w;
	set<LabelItem, minLabel> Q;
	set<LabelItem, minLabel>::iterator minPtr;
	L.resize(G.n);
	prev.resize(G.n);
	vector<bool> D(G.n);
	for (v = 0; v < G.n; v++) {
		D[v] = false;
		prev[v] = null;
		L[v] = infty;
	}
	L[s] = 0;
	Q.emplace(LabelItem{ s, 0 });
	while (!Q.empty()) {
		minPtr = Q.begin();
		u = (*minPtr).vertex;
		Q.erase(minPtr);
		D[u] = true;
		if (u == t) {
			return;
		}
		for (auto& e : G.AList[u]) {
			v = e.vertex;
			w = e.weight;
			if (w != infty) {
				if (L[u] + w < L[v]) {
					Q.erase({ v, L[v] });
					L[v] = L[u] + w;
					Q.emplace(LabelItem{ v, L[v] });
					D[v] = false;
					prev[v] = u;
				}
			}
		}
	}
}
void MooresAlgorithm(Graph& G, int s, int t, vector<long long>& L, vector<int>& prev) {
	//Moores/SPFA algorithm for computing the shortest s-t-path. This handles negative weights and runs in O(nm) time.
	//Any infty-weighted edges are ignored (i.e. we pretend they are not there)
	int v;
	long long w;
	L.resize(G.n);
	prev.resize(G.n);
	set<int> A, B;
	for (v = 0; v < G.n; v++) {
		prev[v] = null;
		L[v] = infty;
	}
	L[s] = 0;
	B.insert(s);
	while (!B.empty()) {
		A.clear();
		for (auto& u : B) {
			for (auto& e : G.AList[u]) {
				v = e.vertex;
				w = e.weight;
				if (w != infty) {
					if (L[u] + w < L[v] && L[u] + w < L[t]) {
						L[v] = L[u] + w;
						prev[v] = u;
						A.insert(v);
					}
				}
			}
		}
		B.swap(A);
		B.erase(t);
	}
}
void bfsSet(Graph& G, int s, set<int> &T, vector<long long>& L, vector<int>& prev) {
	//O(m) breadth-first search algorithm. The process if all vertices in T have been painted black of if all vertices in G have been painted black. 
	//Any infty-weighted edges are ignored (i.e. we pretend they are not there)
	int u, v;
	long long w;
	L.resize(G.n);
	prev.resize(G.n);
	vector<int> col(G.n);
	for (v = 0; v < G.n; v++) {
		prev[v] = null;
		L[v] = infty;
		col[v] = white;
	}
	deque<int> Q = { s };
	col[s] = grey;
	L[s] = 0;
	while (!Q.empty()) {
		u = Q.front();
		for (auto& el : G.AList[u]) {
			v = el.vertex;
			w = el.weight;
			if (w != infty) {
				if (col[v] == white) {
					col[v] = grey;
					prev[v] = u;
					L[v] = L[u] + w;
					Q.push_back(v);
				}
			}
		}
		Q.pop_front();
		col[u] = black;
		T.erase(u);
		if (T.empty()) {
			return;
		}
	}
}