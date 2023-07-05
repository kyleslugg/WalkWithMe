#ifndef CONNECTED
#define CONNECTED

#include "main.h"

using namespace std;

bool isConnected(Graph& G);
set<int> getReachable(Graph& G, int source);
set<int> getUnreachable(Graph& G, int source);

#endif //CONNECTED

