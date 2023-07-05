#include "Yen.h"

extern int verbose;

void addDummyVetex(Graph& G, int s) {
	//Adds a new vertex sPrime to the graph. All of s's in-edges are then redirected to sPrime
	int sPrime = G.n, v;
	long long w;
	G.AList.push_back(set<Neighbour, minNeighbour>());
	G.n++;
	for (auto& el : G.AList[s]) {
		v = el.vertex;
		w = el.weight;
		//Remove edge (v,s) and add edge (v,sPrime,w)
		deleteArc(G, v, s);
		addArc(G, v, sPrime, w);
	}
}
void removeDummyVertex(Graph& G, int s) {
	//Redirects all of SPrime's in-edges to s, then removes sPrime all together
	G.n--;
	G.AList.pop_back();
	int sPrime = G.n, v;
	long long w;
	for (auto& el : G.AList[s]) {
		v = el.vertex;
		w = el.weight;
		//Remove edge (v,sPrime) and add edge (v,s,w)
		deleteArc(G, v, sPrime);
		addArc(G, v, s, w);
	}
}
vector<Circuit> doYen(Graph& G, int s, int k, double& overallRunTime, int& numIts) {
	//This procedure modifies the graph by adding a dummy vertex s'. It then runs the program YenEppstein.jar until an s-s'-path with length >= k is found
	int u, l, i;
	double f;
	string command;
	//First modify the graph by making a dummy vertex sPrime that takes all the in-edges of s
	addDummyVetex(G, s);
	//Write this graph to a file in the format recognised for YenEppstein.jar
	ofstream fout("tempX.txt");
	for (u = 0; u < G.n; u++) for (auto& el : G.AList[u]) fout << u << " " << el.vertex << " " << el.weight << "\n";
	fout.close();
	//Execute Yen's algorithm using the jar file YenEppstein.jar with the apt arguments.
	double yenTimeLimitSecs = 1800;
	cout << "-------------\nExecuting Yen's algorithm using <YenEppstein.jar> for maximum " << yenTimeLimitSecs << " secs ...\n";
	command = "java -jar YenEppstein.jar -i tempX.txt -K -1 -TL " + to_string(yenTimeLimitSecs) + " -T " + to_string(k) + " -s " + to_string(s) + " -t " + to_string(G.n - 1);
	for (i = 0; i < verbose; i++) command += " -v";
	system(command.c_str());
	cout << "\n-------------\n";
	//Reset the graph by deleting sPrime and re-directing its in-edges back to s
	removeDummyVertex(G, s);
	//Get info from the out file, ignoring the last vertex sPrime and adding s instead
	ifstream fin("outx.txt");
	fin >> overallRunTime >> numIts >> f >> l;
	Circuit C;
	for (i = 0; i < l - 1; i++) {
		fin >> u;
		C.seq.push_back(u);
	}
	C.seq.push_back(s);
	fin.close();
	C.len = int(f + 0.5);
	//Delete the temporary files that were created
	command = "del tempX.txt";
	system(command.c_str());
	command = "del outx.txt";
	system(command.c_str());
	//The following check is necesarry, because sometimes the returned "cycle" will only have two edges (s,v) and (v,s), which is wrong.
	if (C.seq.size() <= 2) {
		logAndExit("Error: The 'cycle' returned by Yen's algorithm contains only " + to_string(C.seq.size()) + " edges, which is invalid in the program. Ending...\n");
	}
	//Finally, return the solution in the sols data structure
	vector<Circuit> sols(2);
	if (C.len < k) {
		sols[0] = C;
		sols[1].seq = {s};
		sols[1].len = infty;
	}
	else if (C.len > k) {
		sols[0].seq = {s};
		sols[0].len = 0;
		sols[1] = C;
	}
	else {
		sols[0] = C;
		sols[1] = C;
	}
	return sols;
}