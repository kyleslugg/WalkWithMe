#ifndef BHANDARI
#define BHANDARI

#include "main.h"
#include "IO.h"
#include "EulerCircuit.h"

using namespace std;

Path getPathFromPrev(int s, int t, vector<long long>& L, vector<int>& prev);
Path getEdgeDisjointPath(Graph& G, Path& P, int SPAlg);
Path getVertexDisjointPath(Graph& G, Path& P, int SPAlg);
EulerGraph unweave(Path& P1, Path& P2);

#endif //BHANDARI
