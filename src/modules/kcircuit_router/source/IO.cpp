#include "IO.h"

extern int verbose;

void readInputFile(string fname, vector<set<Neighbour, minNeighbour> >& adjList, vector<string>& vName, int& origN, int& origM) {
	//Reads an edge-weighted undirected graph in DIMACS format file and creates the corresponding adjacency list. All weights must be nonnegative
	ifstream inStream;
	inStream.open(fname);
	if (inStream.fail()) {
		logAndExit("Error opening input file " + fname + ". Exiting...\n");
	}
	cout << "Input = " << fname << endl;
	int line = 1, i, j, n, m, w = 0;
	string str, name;
	try {
		while (true) {
			inStream >> str;
			if (str == "c") {
				//Ignore the rest of the line, it is a comment
				getline(inStream, str);
				line++;
			}
			else if (str == "p") {
				//Read the basic information about the graph
				inStream >> n >> m;
				origN = n;
				origM = m;
				line++;
				break;
			}
			else {
				logAndExit("Invalid input in file <" + fname + ">. Exiting...\n");
			}
		}
		//Set up the data structures
		vName.resize(n, "");
		adjList.resize(n, set<Neighbour, minNeighbour>());
		//Now read in all of the vertices' aliases
		if (verbose >= 1) {
			cout << "Reading " << n << " vertex names ... \n";
		}
		for (int v = 0; v < n; v++) {
			//Read in information about a vertex 
			inStream >> str >> name;
			if (str != "v") {
				logAndExit("Error. Corruption on line " + to_string(line) + " when reading vertex IDs. Exiting...\n");
			}
			vName[v] = name;
			line++;
		}
		//Now read in all of the edges
		if (verbose >= 1) {
			cout << "Reading " << m << " edges ... \n";
		}
		for (int e = 0; e < m; e++) {
			//Read in information about an edge: its start point i, endpoint j, and weight w
			inStream >> str >> i >> j >> w;
			if (str != "e" || i < 0 || i >= n || j < 0 || j >= n || i == j) {
				logAndExit("Error. Corruption on line " + to_string(line) + " when reading an edge. Exiting...\n");
			}
			//We are looking to add edge {i,j} with weight w. Do a check for duplicates and out of bounds
			if (w == INT_MAX || w < 0) {
				logAndExit("Error. Corruption on line " + to_string(line) + ". Weights in the input file should be in the set {0, 1,..., INT_MAX}. Exiting...\n");
			}
			if (adjList[i].count({ j, w }) > 0 || adjList[j].count({ i, w }) > 0) {
				logAndExit("Error. Corruption on line " + to_string(line) + ". Edge {" + to_string(i) + ", " + to_string(j) + "} is already defined. Exiting...\n");
			}
			//Assuming it is OK, the information is added to the adjacency list
			adjList[i].insert({ j, w });
			adjList[j].insert({ i, w });
			line++;
		}
	}
	catch (...) {
		logAndExit("Error: Corrupted input file (line " + to_string(line) + "). Exiting...\n");
	}
	inStream.close();
}
void printGraph(Graph& G) {
	//Prints a graph as an adjacency list. Can cause a lot output
	cout << "\n--------------\nn = " << G.n << "\nm = " << G.m << "\nmaxW = " << G.maxEdgeWeight << "\n";
	cout << setw(8) << "ID" << setw(12) << "OsmID" << "\tNeighbourhood\n";
	int u, v;
	long long w;
	for (u = 0; u < G.n; u++) {
		cout << setw(8) << u << setw(12) << G.osmID[u] << "\t{ ";
		for (auto& el : G.AList[u]) {
			v = el.vertex;
			w = el.weight;
			if (w != infty)	cout << "(" << v << "," << w << ") ";
			else			cout << "(" << v << ",inf.) ";
		}
		cout << "}\n";
	}
	cout << "--------------\n\n";
}
void printEulerGraphEdges(EulerGraph& H) {
	//Prints as a multiset of edges, an Eulerian graph
	cout << "len = ";
	if (H.len == infty) {
		cout << "inf.\t( no path )\n";
		return;
	}
	cout << H.len << "\t{ ";
	for (auto& e : H.E) {
		cout << "{" << e.u << ", " << e.v << "} ";
	}
	cout << "}\n";
}
long long getCircuitWeight(Graph& G, Circuit& C) {
	//Goes through a list of vertices and returns it length
	if (C.seq.size() <= 1) return 0;
	long long tot = 0;
	for (int i = 0; i < C.seq.size() - 1; i++) {
		tot += getArcWeight(G, C.seq[i], C.seq[i + 1]);
	}
	return tot;
}
void printCircuit(Graph& G, Circuit &C, int solChoice) {
	//Prints a circuit/cycle as a list of vertices. Also double checks that the claimed weight C.len is correct, plus a few other checks
	cout << "len = ";
	string str = "";
	if (C.len == infty) {
		cout << "inf.\t[-]\n";
		return;
	}
	if (C.seq.size() <= 1) {
		cout << "0\t[-]\n";
		return;
	}
	cout << C.len << "\t[";
	for (int i = 0; i < C.seq.size() - 1; i++) {
		cout << C.seq[i] << ",";
	}
	cout << C.seq.back() << "]\n";
	if (getCircuitWeight(G, C) != C.len) {
		str += "Error: this cycle's weight is not stored correctly. It should be " + to_string(getCircuitWeight(G, C)) + "\n";
	}
	//Check that the source is at both ends
	if(C.seq.front() != C.seq.back())
		str += "Error: The source does not appear at the front and back of this vertex sequence.\n";
	//Check for repeated vertices
	vector<int> freq(G.n, 0);
	for (auto& v : C.seq) freq[v]++;
	freq[C.seq.front()]--;
	for (int v = 0; v < G.n; v++) {
		if (solChoice == 2 && freq[v] > 1 && G.APs.count(v) == 0) {
			str += "Error: vertex v-" + to_string(v) + " (ID:" + G.osmID[v] + ") is repeated in the cycle, but it is not an articulation point\n";
		}
	}
	//Check for repeated edges
	set<Edge, minEdge> E;
	for (int i = 0; i < C.seq.size() - 1; i++) {
		int u = C.seq[i];
		int v = C.seq[i + 1];
		if (u > v) swapVals(u, v);
		if (E.count({ u,v }) >= 1 && G.bridges.count({ u,v }) == 0) {
			str += "Error: edge {" + to_string(u) + "," + to_string(v) + "} (ID: {" + G.osmID[u] + "," + G.osmID[v] + "}) is repeated in the circuit/cycle, but is not a bridge\n";
		}
		else if (E.count({ u,v }) > 2 && G.bridges.count({ u,v }) == 1) {
			str += "Error: edge {" + to_string(u) + "," + to_string(v) + "} (ID: {" + G.osmID[u] + "," + G.osmID[v] + "}) is a bridge, but is being used " + to_string(E.count({ u,v })) + " times. (Maximum is two).\n";
		}
		E.insert({ u,v });
	}
	if (str != "") logAndExit(str);
}
string makePythonOSMString(Graph& G, Circuit& C) {
	//Go through a circuit, convert node labels to their OSM labels, eliminate consecutive duplicates, and put in a string representing a Python list
	int i;
	if (C.seq.empty()) return("[]");
	vector<string> temp = { G.osmID[C.seq[0]] };
	for (i = 1; i < C.seq.size(); i++) {
		if (G.osmID[C.seq[i]] != temp.back()) {
			temp.push_back(G.osmID[C.seq[i]]);
		}
	}
	string str;
	str = "[";
	for (i = 0; i < temp.size() - 1; i++) {
		str += temp[i] + ", ";
	}
	str += temp[i] + "]";
	return str;
}
void writeCircuitsToFile(Graph& G, vector<Circuit>& sols, string& fName) {
	//Prints out the vector of cycles as a list of lists (Python)
	int i;
	ofstream fout(fName + "_sol.txt");
	if (sols.empty()) {
		fout << "NULL\n";
		fout.close();
		return;
	}
	//Print out each cycle. 
	fout << "[\n";
	for (i = 0; i < sols.size() - 1; i++) {
		fout << " " << makePythonOSMString(G, sols[i]) << ",\n";
	}
	fout << " " << makePythonOSMString(G, sols[i]) << "\n";
	fout << "]\n";
	fout.close();
}