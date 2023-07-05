#ifndef MAIN
#define MAIN

#include <time.h>
#include <climits>
#include <string>
#include <fstream>
#include <iostream>
#include <iomanip>
#include <vector>
#include <set>
#include <list>
#include <deque>
#include <map>
#include <algorithm>

using namespace std;
#pragma warning(disable: 4267)

void logAndExit(string s);

const long long infty = INT64_MAX;
const int null = -1;
const int white = 0;
const int grey = 1;
const int black = 2;

//Structs used in conjuntion with the priority queue
struct LabelItem {
	int vertex;
	long long label;
};
struct minLabel {
	bool operator() (const LabelItem& lhs, const LabelItem& rhs) const {
		return tie(lhs.label, lhs.vertex) < tie(rhs.label, rhs.vertex);
	}
};
struct minVertex {
	bool operator() (const LabelItem& lhs, const LabelItem& rhs) const {
		return tie(lhs.vertex, lhs.label) < tie(rhs.vertex, rhs.label);
	}
};

//Structs for holding the neighbours of a vertex. This is used as part of an adjacency list representation
struct Neighbour {
	int vertex;
	long long weight;
};
struct minNeighbour {
	bool operator() (const Neighbour& lhs, const Neighbour& rhs) const {
		return lhs.vertex < rhs.vertex;
	}
};

//Structs for holding an edge. We must be careful when using this to ensure that u<v at all times (this means we can treat them as an unordered pair/edge)
struct Edge {
	int u;
	int v;
};
struct minEdge {
	bool operator() (const Edge& lhs, const Edge& rhs) const {
		return tie(lhs.u, lhs.v) < tie(rhs.u, rhs.v);
	}
};

//Structs for holding a weighted arc (ordered pair)
struct WArc {
	int u;
	int v;
	long long weight;
};
struct minWArc {
	bool operator() (const WArc& lhs, const WArc& rhs) const {
		return tie(lhs.u, lhs.v, lhs.weight) < tie(rhs.u, rhs.v, rhs.weight);
	}
};

//Struct for holding a path, represented as a sequence of vertices
struct Path {
	long long len = 0;
	vector<int> seq;
};

//Struct for holding a circuit represented as a sequence of vertices. The start and end vertices must be the same. (I.e. x edges gives a sequence of x + 1 vertices)
struct Circuit {
	long long len = 0;
	vector<int> seq;
	vector<long long> cumulative;
	bool atLocalOpt = false;
};

//Struct for holding an Eulerian multigraph represented as a multiset of edges (unordered pairs), and the corresponding endpoints (vertices)
struct EulerGraph {
	multiset<Edge, minEdge> E;
	set<int> V;
	long long len = 0;
};

//Struct used for storing a graph as an adjacency list
struct Graph {
	int n = 0;										//Number of vertices in the graph
	int m = 0;										//Number of edges in a graph. This figure is only valid if all edges are bidirectional
	int numDummies = 0;								//Number of dummys added for bridges and articulation points (these come at the end)
	vector<set<Neighbour, minNeighbour> > AList;	//Adjacency list (each list is a set ordered by vetex)
	vector<string> osmID;							//Actual name of the vertex (used by osm)
	vector<int> parent;								//If the vertex is a dummy, this number refers to its "parent" vertex. If not, it refers to itself.
	long long maxEdgeWeight;						//Keeps a record of the largest edge weight in the graph (used for chicking for overflow)
	long long INF2 = 0;								//Constant used in Bhandari's algorithm for dealing with graphs with connectivity of less than two. Calculated as sum of edge weights plus one
	set<int> APs;									//Set used to hold all articulation points in the graph
	set<Edge, minEdge> bridges;						//Set used to hold all bridges {u,v} in the graph
};

int minVal(int a, int b);
void logAndExit(string s);
void swapVals(int& a, int& b);

#endif //MAIN