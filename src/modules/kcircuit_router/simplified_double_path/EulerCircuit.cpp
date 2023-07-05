#include "EulerCircuit.h"

extern int verbose;

void addEdge(vector<multiset<int>>& A, int u, int v) {
	A[u].insert(v);
	A[v].insert(u);
}
void removeEdge(vector<multiset<int>>& A, int u, int v) {
	//NB: A slightly modified version of .erase is used here to ensure that only one instance of an element is removed from the multiset (not all of them)
	A[u].erase(A[u].find(v));
	A[v].erase(A[v].find(u));
}
void extractCircuit(vector<multiset<int>>& A, list<int>& S, int s) {
	//Create a circuit from a vertex s, removing these edges from A. We halt when we get to a vertex with no other edges
	int u = s, v;
	while (true) {
		if (A[u].empty()) break;
		else {
			v = *A[u].begin();
			removeEdge(A, u, v);
			S.push_back(v);
			u = v;
		}
	}
	S.pop_back();
}
list<int> Hierholzer(vector<multiset<int>>& A, int s) {
	//Hierholzer's algorithm for determining a vertex ordering of an Eulerian circuit in an Eulerian graph.
	list<int> S, temp;
	//Start by forming an initial circuit S from s
	S = { s };
	extractCircuit(A, S, s);
	list<int>::iterator it = S.begin();
	while (true) {
		//Find insertion point along S
		while (true) {
			if (it == S.end()) {
				//If we are here, we can return S. If it contains m edges, it is Eulerian, else it has only found an Eulerian subgraph.
				S.push_back(S.front());
				return S;
			}
			else if (!(A[*it].empty())) {
				//We can start a new subtour from the vertex we are pointing to.
				break;
			}
			else {
				//The vertex we are pointing to has no edges remaining, so skip to the next one
				++it;
			}
		}
		int u = *it;
		extractCircuit(A, temp, u);
		//Splice temp into S at the correct position
		temp.push_back(u);
		it = S.insert(++it, temp.begin(), temp.end());
		temp.clear();
	}
}
vector<int> getEulerCircuit(multiset<Edge, minEdge>& E, int source) {
	//Here, E is a multiset of edges (integer pairs, u < v) defining an Eulerian graph. We need to set up two things: mappings between vertex labels 
	//and {0, 1, 2 ...}, and an adjacency matrix A that uses the labels 0,1,2,...
	set<int> VNames;
	map<int, int> NameToDummy;
	vector<int> DummyToName, circuit;
	list<int> S;
	int i = 0;
	if (E.size() <= 0) {
		//No circuit with length <=k was found. So return an "empty" circuit (source-to-source)
		circuit.push_back(source);
		return circuit;
	}
	//ID the names of all vertices in E
	for (auto& e : E) {
		VNames.insert(e.u);
		VNames.insert(e.v);
	}
	//make a mapping from names to dummies, and dummies to names
	for (auto& v : VNames) {
		NameToDummy[v] = i;
		DummyToName.push_back(v);
		i++;
	}
	//create an adjacency list A of this graph with vertices labelled from 0,1,2...
	int n = VNames.size();
	vector<multiset<int> > A(n, multiset<int>());
	for (auto& e : E) {
		addEdge(A, NameToDummy[e.u], NameToDummy[e.v]);
	}
	//Check that this graph is valid (all degrees are even). If not, there is an error.
	for (i = 0; i < n; i++) {
		if (A[i].size() % 2 == 1 || A[i].empty()) {
			logAndExit("Error: Edge multiset E given to getEulerianCircuit() has an odd- or zero-degree vertex. Exiting...\n");
		}
	}
	//We can now use Hierholzer's algorithm with A to produce an Eulerian circuit S, starting at source and ending at source
	S = Hierholzer(A, NameToDummy[source]);
	
	//Do some checks to see if S contains all edges (if the graph is connected it definately will)
	if (S.size() - 1 != E.size()) {
		logAndExit("Error: Multiset E given to getEulerianCircuit() is not a connected Eulerian Graph. Exiting...\n");
	}
	for (i = 0; i < n; i++) {
		if (A[i].size() > 0) {
			logAndExit("Error: Edge multiset E given to getEulerianCircuit() is not a connected Eulerian Graph. Exiting...\n");
		}
	}
	//Otherwise, relabel the vertices and return
	for (auto& v : S) {
		circuit.push_back(DummyToName[v]);
	}
	return(circuit);
}
