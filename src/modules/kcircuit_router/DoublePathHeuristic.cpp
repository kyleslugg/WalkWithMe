#include "DoublePathHeuristic.h"

extern int verbose;

int getVertexWithMaxLabel(set<LabelItem, minVertex>& T) {
	int t = null;
	long long max = -1;
	for (auto& el : T) {
		if (el.label > max) {
			t = el.vertex;
			max = el.label;
		}
	}
	return t;
}
int getRandVertex(set<LabelItem, minVertex>& T) {
	int t = null, cnt = 0;
	int r = rand() % T.size();
	for (auto& el : T) {
		if (cnt == r) {
			t = el.vertex;
			break;
		}
		else cnt++;
	}
	return t;
}
int getVertexWithMinLabel(set<LabelItem, minVertex>& T) {
	int t = null;
	long long min = infty;
	for (auto& el : T) {
		if (el.label < min) {
			t = el.vertex;
			min = el.label;
		}
	}
	return t;
}
void getDescendants(vector<vector<int>>& adj, int start, set<int>& S, deque<int> Q) {
	//Produce a set S of all vertices reachable from "start" (including "start" itself) using BFS
	S.clear();
	Q.clear();
	S.insert(start);
	Q.push_back(start);
	while (!Q.empty()) {
		int u = Q.front();
		for (auto& v : adj[u]) {
			if (S.count(v) == 0) Q.push_back(v);
		}
		Q.pop_front();
		S.insert(u);
	}
}
vector<Circuit> doublePathHeuristic(Graph& G, int s, int k, int solChoice, int algChoice, int SPAlg, bool haltAtOptimal, int& numIts, clock_t& splitTime) {
	//Heuristic algorithm for identifying a circuit/cycle
	int v, t, it = 0, alg = algChoice;
	bool justOneSolution = false;
	vector<int> prev, L2, prev2;
	vector<long long> L;
	Path P1, P2;
	EulerGraph H, HUpper = { {}, {}, infty }, HLower = { {}, {}, 0 };
	set<LabelItem, minVertex> T;
	vector<vector<int> > SPTree(G.n, vector<int>());
	set<int> S;
	deque<int> Q;
	if (alg == 5) {
		//Use alg 4 to select any s-circuit/cycle
		alg = 4;
		justOneSolution = true;
	}
	else if (alg == 7) {
		//Use alg 1 to produce a long(ish) s-circuit/cycle
		alg = 1;
		justOneSolution = true;
	}

	//Construct a shortest path tree from source s. This is defined by L and prev. Then make an adjacency list SPTree.
	Dijkstra(G, s, -1, L, prev);
	for (v = 0; v < G.n; v++) if (prev[v] != null)
		SPTree[prev[v]].push_back(v);

	//Now populate a set T of target vertices together with their label values. This initially contains all vertices within distance (k+1)/2 of the source
	for (v = 0; v < G.n; v++)
		if (L[v] < (k + 1) / 2) T.insert({ v, L[v] });
	T.erase({ s, 0 });

	//Main algorithm.
	while (!T.empty()) {
		//Identify a target vertex t and remove it from T.
		if (alg == 2)		t = getVertexWithMinLabel(T);
		else if (alg == 3)	t = getRandVertex(T);
		else if (alg == 4)	t = getRandVertex(T);
		else				t = getVertexWithMaxLabel(T);
		T.erase({ t, L[t] });

		//Get the shortest s-t path P1 and then the second path with respect to P1
		P1 = getPathFromPrev(s, t, L, prev);
		if (solChoice == 2) P2 = getVertexDisjointPath(G, P1, SPAlg);
		else				P2 = getEdgeDisjointPath(G, P1, SPAlg);
		//Use P1 and P2 to create a set of edges that form an Eulerian graph H (This is done by "unweaving" the paths here)
		H = unweave(P1, P2);

		//Some output information
		it++;
		if (verbose >= 2) {
			cout << setw(8) << it << ") |T| = " << setw(8) << T.size() << "\tt =" << setw(8) << t << "\tL(t)=" << setw(8) << L[t] << "\t";
			printEulerGraphEdges(H);
		}

		//If apt, carry out some vertex filtering
		if (alg != 4) {
			if (H.len <= k) {
				//H is too short so delete all vertices u in H.
				for (auto& u : H.V) T.erase({ u, L[u] });
			}
			else {
				if (alg != 1) {
					//H is too long, and there may be descendants of t in the SPTree. So we can remove them
					getDescendants(SPTree, t, S, Q);
					for (auto& u : S) T.erase({ u, L[u] });
				}
			}
		}

		//Keep track of the best solution whose length is less than or equal to k
		if (HLower.len < H.len && H.len <= k) {
			splitTime = clock();
			HLower = H;
		}
		//and the best solution whose length is greater than or equal to k
		if (HUpper.len > H.len && H.len >= k) {
			splitTime = clock();
			HUpper = H;
		}
		//Under certain circumstances, we can halt early
		if (haltAtOptimal && HUpper.len == HLower.len) {
			//The target length has been found
			break;
		}
		if (justOneSolution && (HUpper.len != infty || HLower.len != 0)) {
			//A single solution has been found and we wish to stop
			break;
		}
	}

	//The set of edges in HUpper and HLower define undirected Eulerian multigraphs. Calculate valid circuits/cycles from them and return them
	vector<Circuit> sols;
	Circuit C;
	C.seq = getEulerCircuit(HLower.E, s);
	C.len = HLower.len;
	sols.push_back(C);
	C.seq = getEulerCircuit(HUpper.E, s);
	C.len = HUpper.len;
	sols.push_back(C);
	numIts = it;
	return sols;
}
