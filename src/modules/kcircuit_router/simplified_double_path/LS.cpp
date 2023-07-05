#include "LS.h"

extern int verbose;

vector<int> getRandPerm(int n) {
	//Create a permutation of the values 0,1,...,n-1
	vector<int> perm;
	for (int i = 0; i < n; i++) perm.push_back(i);
	random_shuffle(perm.begin(), perm.end());
	return perm;
}
vector<long long> getCumulative(Graph& G, vector<int>& C) {
	//Produce vector of the cumulative length of the circuit C
	if (C.size() <= 2) return(vector<long long>{});
	vector<long long> A = { 0 };
	for (int i = 1; i < C.size(); i++) {
		A.push_back(A[i - 1] + getArcWeight(G, C[i - 1], C[i]));
	}
	return(A);
}
void doMove(Graph& G, Circuit& sol, int uPos, int vPos, vector<int>& P, long long newLen) {
	//Given the sequnce [....,uPos,...,vPos,...], replace everything between and including [uPos,...,vPos] with P
	if (uPos > vPos) swapVals(uPos, vPos);
	vector<int> S;
	for (int i = 0; i < uPos; i++) S.push_back(sol.seq[i]);
	for (int i = 0; i < P.size(); i++) S.push_back(P[i]);
	for (int i = vPos + 1; i < sol.seq.size(); i++) S.push_back(sol.seq[i]);
	sol.seq.swap(S);
	sol.len = newLen;
	sol.cumulative = getCumulative(G, sol.seq);
}
long long evaluateMove(Circuit& sol, int uPos, int vPos, int v, vector<long long>& L) {
	//assuming that uPos != vPos
	if (uPos < vPos)	return sol.len - (sol.cumulative[vPos] - sol.cumulative[uPos]) + L[v];
	else				return sol.len - (sol.cumulative[uPos] - sol.cumulative[vPos]) + L[v];
}
vector<int> getPath(int s, int t, vector<int>& prev, vector<long long>& L, bool flip) {
	//if flip is true, returns a t-s-path, else returns an s-t-path
	vector<int> P;
	if (L[t] < infty) {
		int u = t;
		while (u != s) {
			P.push_back(u);
			u = prev[u];
		}
		P.push_back(s);
		if (!flip) reverse(P.begin(), P.end());
	}
	return P;
}
set<int> getPath(int s, int t, vector<int>& prev, vector<long long>& L) {
	//returns the nodes in the s-t-path as a set
	set<int> P;
	if (L[t] < infty) {
		int u = t;
		while (u != s) {
			P.insert(u);
			u = prev[u];
		}
		P.insert(s);
	}
	return P;
}
bool moveIsFeasible(Graph& G, Circuit& sol, int uPos, int vPos, vector<int>& prev, vector<long long>& L) {
	set<int> P = getPath(sol.seq[uPos], sol.seq[vPos], prev, L);
	if (uPos > vPos) swapVals(uPos, vPos);
	//Given the sequence with indices [0,...,uPos,...,vPos,...,len-1], we are looking to replace everything between and including [uPos,...,vPos] with P
	//We therefore need to check for common elements between [0,...,uPos-1] and P, and then [vPos+1,...,len-1] and P that are not articulation points
	for (int i = 0; i < uPos; i++) {
		if (G.APs.count(sol.seq[i]) == 0 && P.count(sol.seq[i]) >= 1) return false;
	}
	for (int i = vPos + 1; i < sol.seq.size(); i++) {
		if (G.APs.count(sol.seq[i]) == 0 && P.count(sol.seq[i]) >= 1) return false;
	}
	return true;
}
void removeCircuit(Graph& G, Circuit& C, set<WArc, minWArc>& H_E, set<int>& H_V) {
	//"Removes" the circuit C from the graph G by setting all of its edges to infinity weights. The original edge weights are stored in H_E
	int i, u, v;
	long long w;
	H_E.clear();
	H_V.clear();
	for (i = 0; i < C.seq.size() - 1; i++) {
		u = C.seq[i];
		v = C.seq[i + 1];
		if (existsArc(G, u, v)) {
			w = deleteArc(G, u, v);
			H_E.insert({ u,v,w });
		}
		if (existsArc(G, v, u)) {
			w = deleteArc(G, v, u);
			H_E.insert({ v,u,w });
		}
		H_V.insert(u);
	}
	H_V.insert(v);
	for (auto& el : H_E) {
		addArc(G, el.u, el.v, infty);
	}
}
void reinstateCircuit(Graph& G, set<WArc, minWArc>& H_E) {
	//Uses H_E to reset the edge weights of the circuit in the graph
	for (auto& el : H_E) {
		deleteArc(G, el.u, el.v);
	}
	for (auto& el : H_E) {
		addArc(G, el.u, el.v, el.weight);
	}
}
void optimise(Graph& G, Circuit& sol, Circuit& otherSol, int k, int solChoice, bool descending, int LSOption, int& LSIts) {
	//This carries out local search on sol. It also allows otherSol to be updated if an improvement is found
	vector<int> prev, P, perm;
	vector<long long> L;
	set<WArc, minWArc> H_E;
	set<int> H_V;
	int u = -1, v = -1, uPos, vPos, bestV, bestVPos, permPos;
	bool flip, bestFlip;
	long long newLen, bestLen;
	if (verbose >= 1) {
		if (descending) cout << "-Descent-------\n";
		else cout << "-Ascent-------\n";
		cout << "S_1 = \t";
		printCircuit(G, sol, solChoice);
		cout << "S_2 = \t";
		printCircuit(G, otherSol, solChoice);
	}
	perm = getRandPerm(sol.seq.size());
	permPos = 0;
	while (true) {
		if (sol.seq.size() <= 2) {
			//Cannot apply local search on a null solution ([ ], [s], or [s, s]), so exit
			sol.atLocalOpt = true;
			break;
		}
		//Initialise variables
		uPos = perm[permPos];
		u = sol.seq[uPos];
		bestLen = sol.len;
		bestV = null;
		bestVPos = null;
		bestFlip = false;
		//Remove the solution's edges from G, an run the shortest path algorithm from vertex u to get paths to all possible vertices in H_V. Then reinstate the edges
		removeCircuit(G, sol, H_E, H_V);
		if(LSOption == 1)	DijkstraSet(G, u, H_V, L, prev);
		else				bfsSet(G, u, H_V, L, prev);
		reinstateCircuit(G, H_E);
		LSIts++;
		//Now go through each item v in the cycle sol and look at changes for the u-v-paths
		for (vPos = 0; vPos < sol.seq.size(); vPos++) {
			v = sol.seq[vPos];
			if (vPos == uPos) {
				//Do nothing (this would create a new "path" between a vertex and itself)
			}
			else {
				//Evaluate the effect of removing the u-v-path in C and replacing it with the u-v-path from the SP-tree
				if (L[v] != infty) {
					//There exists and alternative u-v-path
					newLen = evaluateMove(sol, uPos, vPos, v, L);
					if ( (descending == true && newLen < bestLen && newLen >= k) || (descending == false && newLen > bestLen && newLen <= k) ) {
						if (solChoice == 1 || (solChoice == 2 && moveIsFeasible(G, sol, uPos, vPos, prev, L))) {
							//This move will improve sol and keep it feasible, so save the move
							bestLen = newLen;
							bestV = v;
							bestVPos = vPos;
							if (uPos <= vPos)	bestFlip = false;
							else				bestFlip = true;
						}
					}
					if ((descending == true && newLen > otherSol.len && newLen <= k) || (descending == false && newLen < otherSol.len && newLen >= k)) {
						if (solChoice == 1 || (solChoice == 2 && moveIsFeasible(G, sol, uPos, vPos, prev, L))) {
							//We have found an opportunity to improve otherSol from otherSol.len to newLen by altering a copy of sol.
							otherSol = sol;
							if (uPos <= vPos)	flip = false;
							else				flip = true;
							P = getPath(u, v, prev, L, flip);
							doMove(G, otherSol, uPos, vPos, P, newLen);
							otherSol.atLocalOpt = false;
							if (verbose >= 1) {
								cout << "oth =\t";
								printCircuit(G, otherSol, solChoice);
							}
						}
					}
				}
			}
		}
		//If an improving move has been found, do it.
		if ((descending == true && bestLen < sol.len) || (descending == false && bestLen > sol.len)) {
			//Found an improving move from vertex u at uPos, so do it
			P = getPath(u, bestV, prev, L, bestFlip);
			doMove(G, sol, uPos, bestVPos, P, bestLen);
			if (verbose >= 1) {
				cout << "new =\t";
				printCircuit(G, sol, solChoice);
			}
			//Because the solution has changed, reset the permutation to induce another iteration of optimisation
			permPos = 0;
			perm = getRandPerm(sol.seq.size());
		}
		else {
			//Improving move not found from vertex u at uPos
			permPos++;
		}
		if (sol.len == k || permPos >= sol.seq.size()) {
			//Have found an optimal, or we are at a local optimum
			sol.atLocalOpt = true;
			break;
		}
	}
}
int getInsertionPos(vector<int> seq, int u) {
	//Return position of first u seen in seq
	for (int i = 0; i < seq.size(); i++) {
		if (seq[i] == u) return i;
	}
	logAndExit("Error in getInsertionPos. The required vertex is not in the sequence. Ending ...\n");
	return -1;
}
bool vertexIsSuitable(Graph& G, int u, long long target) {
	//A vertex u in the current circuit is considered suitable to build a new subtour from if: 
	//(a) it is an articulation point (necessary), AND
	//    (b1) The total length of two different incident, non-infty, edges is <= target. (This is a heuristic -- there's no guarantee that a suitable subtour can then be acheived)
	//    OR (b2) u has an incident bridge whose length, doubled, is smaller or equal to the target.
	if (G.APs.count(u) == 0) return false;
	long long min1 = infty, min2 = infty, w;
	int v;
	for (auto& el : G.AList[u]) {
		v = el.vertex;
		w = el.weight;
		if (w < infty && w * 2 <= target && isBridge(G, u, v)) {
			return true;
		}
		if (w < min1) {
			min2 = min1;
			min1 = w;
		}
		else if (w < min2) {
			min2 = w;
		}
	}
	if (min1 < infty && min2 < infty && min1 + min2 <= target) return true;
	else return false;
}
Graph getGPrime(Graph& G, Circuit& sol, int& uPrime) {
	set<Neighbour, minNeighbour> S;
	set<int> X;
	int v;
	long long w;
	Graph GPrime;
	vector<int> prev;
	vector<long long> L;
	//Temporarily remove uPrime from G (by deleting all of its incident edges)
	S.swap(G.AList[uPrime]);
	for (auto& el : S) {
		v = el.vertex;
		w = deleteArc(G, v, uPrime);
	}
	//Now determine the set X of all vertices in G that cannot be reached from any vertex in the circuit sol (i.e. paths would have to go through uPrime)
	if(uPrime == sol.seq[0])	X = getUnreachable(G, sol.seq[1]);
	else						X = getUnreachable(G, sol.seq[0]);
	//and then reset G by reinserting all of its incident edges of uPrime
	G.AList[uPrime].swap(S);
	for (auto& el : G.AList[uPrime]) {
		addArc(G, el.vertex, uPrime, el.weight);
	}
	//We now want to form the graph induced by the vertices of X, plus uPrime
	X.insert(uPrime);
	GPrime = getInducedGraph(G, X, uPrime);
	//Now reduce this further by only considering vertices reachable from uPrime (this ensures GPrime is connected and contains uPrime)
	X = getReachable(GPrime, uPrime);
	GPrime = getInducedGraph(GPrime, X, uPrime);
	//Finally calculate INF2 for this graph and then end
	for (v = 0; v < GPrime.n; v++) {
		for (auto& el : GPrime.AList[v]) {
			if (el.weight < infty) GPrime.INF2 += el.weight;
		}
	}
	GPrime.INF2 = (GPrime.INF2 / 2) + 1;
	return(GPrime);
}
void addSubtour(Graph& G, Circuit& sol, Circuit& otherSol, int k, int solChoice, int algChoice, int SPAlg) {
	//Assumes sol is too short and otherSol is too long.
	if (sol.len >= k || otherSol.len <= k) logAndExit("Error: invalid solutions given to addSubtour procedure. Ending ...\n");
	if (verbose >= 1) {
		cout << "-Seeking to add subtour-\n";
		cout << "S_1 = \t";
		printCircuit(G, sol, solChoice);
		cout << "S_2 = \t";
		printCircuit(G, otherSol, solChoice);
	}
	if (sol.seq.size() <= 2) {
		//Cannot apply local search on a null solution ([ ], [s], or [s, s]), so exit
		if (verbose >= 1) cout << "No improving subtour identified\n";
		return;
	}
	set<WArc, minWArc> H_E;
	set<int> H_V, X;
	vector<string> vName;
	vector<Circuit> newSols;
	vector<int> newSubtourLower, newSubtourUpper;
	Graph GPrime;
	int i, uPrime, numIts, pos, target = k - int(sol.len);
	clock_t null;
	//Because we're working with subgraphs, we keep a record of G's original node labels. We swap these back at the end
	for (i = 0; i < G.n; i++) vName.push_back(to_string(i));
	G.osmID.swap(vName);
	//"Remove" sol's edges from G by switching their weights to infty
	removeCircuit(G, sol, H_E, H_V);
	//Identify all vertices in sol that might be suitable for forming a circuit from. Then put these into a vector V, and randomly shuffle
	for (auto& v : H_V) {
		if (vertexIsSuitable(G, v, target)) {
			X.insert(v);
		}
	}
	vector<int> V(X.begin(), X.end());
	random_shuffle(V.begin(), V.end());
	for (auto& u : V) {
		//Create a new induced subgraph GPrime of G.
		uPrime = u;
		GPrime = getGPrime(G, sol, uPrime);
		//Run the Bahandari-based heuristic on GPrime to get one or two subtours starting at uPrime. 
		newSols.clear();
		newSols = doublePathHeuristic(GPrime, uPrime, target, solChoice, algChoice, SPAlg, true, numIts, null);
		//If these subtours are suitable, copy them into two new vectors, using their original vertex labels
		newSubtourLower.clear();
		newSubtourUpper.clear();
		if (newSols[0].len > 0 && newSols[0].seq.size() >= 2)		for (auto& v : newSols[0].seq) newSubtourLower.push_back(stoi(GPrime.osmID[v]));
		if (newSols[1].len < infty && newSols[1].seq.size() >= 2)	for (auto& v : newSols[1].seq) newSubtourUpper.push_back(stoi(GPrime.osmID[v]));
		//Now determine if we are going to make changes to sol or otherSol (or both). If we can, we do, and then exit the procedure.
		if ( (!newSubtourLower.empty() && sol.len + newSols[0].len <= k) || (!newSubtourUpper.empty() && sol.len + newSols[1].len < otherSol.len)) {
			reinstateCircuit(G, H_E);
			G.osmID.swap(vName);
			if (!newSubtourUpper.empty() && sol.len + newSols[1].len < otherSol.len) {
				//Update otherSol
				otherSol = sol;
				pos = getInsertionPos(otherSol.seq, newSubtourUpper.front());
				doMove(G, otherSol, pos, pos, newSubtourUpper, otherSol.len + newSols[1].len);
				otherSol.atLocalOpt = false;
				if (verbose >= 1) printCircuit(G, otherSol, solChoice);
			}
			if (!newSubtourLower.empty() && sol.len + newSols[0].len <= k) {
				//Update sol
				pos = getInsertionPos(sol.seq, newSubtourLower.front());
				doMove(G, sol, pos, pos, newSubtourLower, sol.len + newSols[0].len);
				sol.atLocalOpt = false;
				if (verbose >= 1) {
					cout << "new =\t";
					printCircuit(G, sol, solChoice);
				}
			}
			return;
		}
	}
	//If we are here, then we haven't managed to insert a new subtour in either solution
	if (verbose >= 1) cout << "No improving subtour identified\n";
	reinstateCircuit(G, H_E);	
	G.osmID.swap(vName);
}
void doLocalSearch(Graph& G, vector<Circuit>& sol, int k, int solChoice, int algChoice, int SPAlg, int LSOption, int& LSIts) {
	//Add values to the remaining fields in the Circuit struct
	for (int i = 0; i < sol.size(); i++) {
		sol[i].atLocalOpt = false;
		sol[i].cumulative = getCumulative(G, sol[i].seq);
	}
	bool doLSTwice = false;
	if (LSOption == 3) {
		LSOption = 2;
		doLSTwice = true;
	}
	//Run the overall local-search algorithm
DOLS:
	if (verbose >= 1) cout << "-----Starting LS (option " << LSOption << ") -----------\n";
	while (true) {
		if (sol[0].len == k || sol[1].len == k) {
			//Target solution has been found, so end
			break;
		}
		if (!sol[0].atLocalOpt) {
			optimise(G, sol[0], sol[1], k, solChoice, false, LSOption, LSIts);
		}
		else if (!sol[1].atLocalOpt) {
			optimise(G, sol[1], sol[0], k, solChoice, true, LSOption, LSIts);
		}
		else if (sol[0].atLocalOpt && sol[1].atLocalOpt) {
			addSubtour(G, sol[0], sol[1], k, solChoice, algChoice, SPAlg);
			if (sol[0].atLocalOpt && sol[1].atLocalOpt) {
				//No further improvements possible, so end
				break;
			}
		}
	}
	if (verbose >= 1) cout << "-----Ending  LS (option " << LSOption << ") ------------\n";
	if (doLSTwice == true) {
		LSOption = 1;
		sol[0].atLocalOpt = false;
		sol[1].atLocalOpt = false;
		doLSTwice = false;
		goto DOLS;
	}
}