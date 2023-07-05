#include "Bhandari.h"

extern int verbose;

Path getPathFromPrev(int s, int t, vector<long long>& L, vector<int>& prev) {
	Path P;
	P.len = L[t];
	if (P.len < infty) {
		int u = t;
		while (u != s) {
			P.seq.push_back(u);
			u = prev[u];
		}
		P.seq.push_back(s);
		reverse(P.seq.begin(), P.seq.end());
	}
	return P;
}
Path getEdgeDisjointPath(Graph& G, Path& P, int SPAlg) {
	int s = P.seq[0], t = P.seq.back(), i, u, v;
	long long w;
	vector<int> prev;
	vector<long long> L;
	//Modify graph G with respect to path P. Note that this converts some edges into arcs, so G.m is not valid during this procedure
	for (i = 0; i < P.seq.size() - 1; i++) {
		u = P.seq[i];
		v = P.seq[i + 1];
		//Because arc (u,v) is in the path defined by P, remove (u,v) and (v,u)
		w = deleteArc(G, u, v);
		w = deleteArc(G, v, u);
		//And replace with the arcs (v,u) with appropriate new arcs
		addArc(G, v, u, -w);
		addArc(G, u, v, w + G.INF2);
	}
	//Now get the second path P2
	if (SPAlg == 2)			modifiedDijkstra(G, s, t, L, prev);
	else					MooresAlgorithm(G, s, t, L, prev);
	Path P2 = getPathFromPrev(s, t, L, prev);
	if (P2.len == infty) {
		logAndExit("Error: A second (edge-disjoint) " + to_string(s) + "-" + to_string(t) + "-path does not exist in this graph. Exiting...\n");
	}
	//Adjust P2's score to get rid of the INF2-values
	P2.len = P2.len % G.INF2;
	//Now reset the graph back to its previous state
	for (i = 0; i < P.seq.size() - 1; i++) {
		u = P.seq[i];
		v = P.seq[i + 1];
		w = deleteArc(G, u, v);
		w = deleteArc(G, v, u);
		addArc(G, u, v, -w);
		addArc(G, v, u, -w);
	}
	//Return the second path that was generated
	return P2;
}
Path getVertexDisjointPath(Graph& G, Path& P, int SPAlg) {
	int u, v, i, uPrime, s = P.seq[0], t = P.seq.back(), origN = G.n;
	long long w;
	vector<int> prev;
	vector<long long> L;
	map<int, int> partner;
	//Modify G with respect to path P. First, for each arc (u,v) in P, remove (v,u). Note that this converts some edges into arcs, so G.m is not valid during this procedure
	for (i = 0; i < P.seq.size() - 1; i++) {
		u = P.seq[i];
		v = P.seq[i + 1];
		w = deleteArc(G, v, u);
	}
	//Next, for each internal vertex u in P, create a new dummy vertex uPrime and transfer all out-arcs of u to uPrime
	for (i = 1; i < P.seq.size() - 1; i++) {
		u = P.seq[i];
		uPrime = G.n;
		partner[u] = uPrime;
		partner[uPrime] = u;
		G.AList.push_back(set<Neighbour, minNeighbour>());
		G.osmID.push_back(to_string(u) + "\'");
		G.n++;
		G.AList[u].swap(G.AList[uPrime]);
	}
	//Finally, create a "reversed route" through the graph with regards to P
	u = P.seq[0];
	v = P.seq[1];
	w = deleteArc(G, u, v);
	addArc(G, v, u, -w);
	addArc(G, u, v, G.INF2 + w);
	for (i = 1; i < P.seq.size() - 1; i++) {
		u = P.seq[i];
		uPrime = partner[u];
		v = P.seq[i + 1];
		w = deleteArc(G, uPrime, v);
		addArc(G, v, uPrime, -w);
		addArc(G, uPrime, u, 0);
		addArc(G, uPrime, v, G.INF2 + w);
		addArc(G, u, uPrime, G.INF2);
	}
	//We can now find the shortest s-t-path PTemp in this modified graph.
	if (SPAlg == 2)			modifiedDijkstra(G, s, t, L, prev);
	else					MooresAlgorithm(G, s, t, L, prev);
	Path PTemp = getPathFromPrev(s, t, L, prev);
	if (PTemp.len == infty) {
		logAndExit("Error: A second (vertex-disjoint) " + to_string(s) + "-" + to_string(t) + "-path does not exist in this graph. Exiting...\n");
	}
	//Adjust P2's score to get rid of the INF2-values
	PTemp.len = PTemp.len % G.INF2;
	//Now reset the graph. First, reverse the "reversed -ve path" we created and eliminate the zero arcs between partners
	u = P.seq[0];
	v = P.seq[1];
	w = deleteArc(G, u, v); 
	w = deleteArc(G, v, u);
	addArc(G, u, v, -w);
	for (i = 1; i < P.seq.size() - 1; i++) {
		u = P.seq[i];
		uPrime = partner[P.seq[i]];
		v = P.seq[i + 1];
		w = deleteArc(G, u, uPrime);
		w = deleteArc(G, uPrime, v);
		w = deleteArc(G, uPrime, u);
		w = deleteArc(G, v, uPrime);
		addArc(G, uPrime, v, -w);
	}
	//Next, for each internal vertex u in P, merge its dummy uPrime into u
	for (i = P.seq.size() - 2; i >= 1; i--) {
		u = P.seq[i];
		uPrime = partner[u];
		G.AList[u].swap(G.AList[uPrime]);
		G.AList.pop_back();
		G.osmID.pop_back();
		G.n--;
	}
	//Finally for each arc (u,v) in P, add (v,u)
	for (i = 0; i < P.seq.size() - 1; i++) {
		u = P.seq[i];
		v = P.seq[i + 1];
		w = getArcWeight(G, u, v);
		addArc(G, v, u, w);
	}
	//To get the second path P2, first relabel vertices in PTemp so that dummies are switched to their partners
	for (i = 0; i < PTemp.seq.size(); i++) {
		if (PTemp.seq[i] >= origN) {
			PTemp.seq[i] = partner[PTemp.seq[i]];
		}
	}
	//Now copy PTemp into P2, removing any adjacent duplicates
	Path P2 = { 0, { s } };
	for (i = 1; i < PTemp.seq.size(); i++) {
		if (PTemp.seq[i] != P2.seq.back()) {
			P2.seq.push_back(PTemp.seq[i]);
		}
	}
	//We can now return P2
	P2.len = PTemp.len;
	return P2;
}
EulerGraph unweave(Path& P1, Path& P2) {
	int u, v, i;
	EulerGraph H;
	H.len = P1.len + P2.len;
	//Add all arcs in P1.
	for (i = 0; i < P1.seq.size() - 1; i++) {
		u = P1.seq[i];
		v = P1.seq[i + 1];
		H.E.insert({ u,v });
	}
	//Add arcs (u,v) from P2. If the reverse arc (v,u) is already present in H.E, remove (v,u) and don't add (u,v)
	for (i = 0; i < P2.seq.size() - 1; i++) {
		u = P2.seq[i];
		v = P2.seq[i + 1];
		if (H.E.count({ v, u }) > 0) {
			H.E.erase({ v,u });
		}
		else {
			H.E.insert({ u,v });
		}
	}
	//Finally, convert the arcs in H.E to edges (u < v for all edges {u,v}) and keep track of all the endpoints of the edges
	multiset<Edge,minEdge> temp;
	for (auto& e : H.E) {
		if (e.u < e.v)	temp.insert({ e.u,e.v });
		else			temp.insert({ e.v,e.u });
		H.V.insert(e.u);
		H.V.insert(e.v);
	}
	H.E.swap(temp);
	return(H);
}
