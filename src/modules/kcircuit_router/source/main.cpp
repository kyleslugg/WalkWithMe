#include "main.h"
#include "Graph.h"
#include "IO.h"
#include "Yen.h"
#include "LS.h"

using namespace std;
int verbose;

int minVal(int a, int b) {
	if (a < b) return a;
	else return b;
}
void swapVals(int& a, int& b) {
	int x = a; a = b; b = x;
}
void logAndExit(string s) {
	//Writes message s to screen and log file and then exits the program
	ofstream resultsLog("resLog.txt", ios::app);
	resultsLog << s;
	cout << s;
	resultsLog.close();
	exit(1);
}
void usage() {
	cout << "Approximation Algorithms for finding an s-circuit/cycle of length k. (R. Lewis 2021, www.rhydlewis.eu)\n"
		<< "If a k-length solution is not found, lower- and upper-bound candidate solutions are output.\n\n"
		<< "Usage:\n"
		<< "----------------------\n"
		<< "-i <string>       (Required. Must define a file in the recognised format -- see the documentation for further details.)\n"
		<< "----------------------\n"
		<< "-k <int>          (Desired length (default = 1000).)\n"
		<< "-s <int>          (Source Vertex (default = 0).)\n"
		<< "-c <int>          (Solution choice\n"
		<< "                      1: Circuit (default)\n"
		<< "                      2: Cycle.)\n"
		<< "-a <int>          (Solution generation algorithm:\n"
		<< "                      1: Double-path heuristic w/ filtering: choose furthest remaining vertex at each step (default)\n"
		<< "                      2: Double-path heuristic w/ filtering: choose closest remaining vertex at each step\n"
		<< "                      3: Double-path heuristic w/ filtering: choose random remaining vertex at each step\n"
		<< "                      4: Double-path heuristic w/o filtering: choose random remaining vertex at each step\n"
		<< "                      5: Make a random circuit/cycle (uses Option 4, but halts with the first observed solution)\n"
		<< "                      6: Split s into <s> and <s'> and run Yen's algorithm until an s-s'-path of length k has been reached)\n"
		<< "                      7: Make a long(ish) circuit/cycle (uses Option 1 and halts with first observed solution).)\n"
		<< "-r <int>          (Random seed (default = 1).)\n"
		<< "-LS <int>         (Once a solution has been formed using the option selected with '-a', carry out local search using one of these options:\n"
		<< "                      0: Do not do any local search (default)\n"
		<< "                      1: Use Dijkstra's algorithm with local search until a local optimum is reached\n"
		<< "                      2: Use BFS with local search until a local optimum is reached\n"
		<< "                      3: Use BFS with local search until a local optimum is reached then, from this, use Dijkstra's algorithm with LS until a local optimum is reached).\n"
		<< "-sp <int>         (Shortest path algorithm to be used with double-path heuristic:\n"
		<< "                      1: Moore's BFS shortest path algorithm\n"
		<< "                      2: Modified Dijkstra's algorithm (default))\n"
		<< "-v                (Verbosity. If present, output is sent to the console. If -v is repeated, more output is given.)\n"
		<< "-o                (If present, remove all degree-one vertices before running the chosen algorithm.)\n"
		<< "-h                (If present, the double path heuristic halts as soon (and if) a solution with length k is found.)\n"
		<< "----------------------\n"
		<< " NOTES: * When option '-a 6' is used (Yen's algorithm):\n"
		<< "              - The file <YenEppstein.jar> should be in the same folder as this executable\n"
		<< "              - The program will run for a maximum of 30 minutes. In this case it will halt with the best solution found.\n"
		<< "		      - The parameters -c, -sp, -h, -r, and -LS have no effect. Only cycles are considered.\n"
		<< "              - Dummy vertices and edges are introduced for every articulation point. This means that, in the original\n"
		<< "                graph there may be non-bridge edges that are used twice (this will not be picked up by the solution\n"
		<< "                checker due to the dummies). The solutions from this algorithm are therefore not subject to the same constraints\n"
		<< "                as the other algorithms. The algorithm can be VERY slow for large values of -k\n";
	exit(1);
}
int main(int argc, char** argv) {

	//Convert the input arguments to a vector of strings
	vector<string> argList(argv, argv + argc);
	if (argList.size() <= 1) usage();

	//Main variables
	int i, solChoice = 1, source = 0, origSource = 0, k = 1000, algChoice = 1, seed = 1, origN = 0, origM = 0, SPAlg = 2, numIts = 0, LSOption = 0, LSIts = 0;
	bool remDegOne = false, haltAtOptimal = false, addDummies = false;
	vector<set<Neighbour, minNeighbour> > adjList;
	vector<string> vName;
	string inFile = "";
	verbose = 0;

	//Parse the command line arguments
	try {
		for (i = 1; i < argc; i++) {
			if (argList[i] == "-i") {
				inFile = argList[++i];
				readInputFile(inFile, adjList, vName, origN, origM);
			}
			else if (argList[i] == "-c") {
				solChoice = stoi(argList[++i]);
			}
			else if (argList[i] == "-s") {
				source = stoi(argList[++i]);
				origSource = source;
			}
			else if (argList[i] == "-k") {
				k = stoi(argList[++i]);
			}
			else if (argList[i] == "-a") {
				algChoice = stoi(argList[++i]);
			}
			else if (argList[i] == "-r") {
				seed = stoi(argList[++i]);
			}
			else if (argList[i] == "-sp") {
				SPAlg = stoi(argList[++i]);
			}
			else if (argList[i] == "-o") {
				remDegOne = true;
			}
			else if (argList[i] == "-h") {
				haltAtOptimal = true;
			}
			else if (argList[i] == "-LS") {
				LSOption = stoi(argList[++i]);
			}
			else if (argList[i] == "-v") {
				verbose++;
			}
			else {
				cout << "Error with input statement. Ending...\n";
				usage();
			}
		}
	}
	catch (...) {
		cout << "Error with input statement. Ending...\n";
		usage();
	}

	//Check some input combinations
	if (source < 0 || source >= adjList.size())		logAndExit("Invalid algorithm option. Specified source vertex does not exist. Ending...\n");
	if (k <= 0)										logAndExit("Invalid input for k. It must be a positive value. Ending...\n");
	if (SPAlg <= 0 || SPAlg > 2)					logAndExit("Invalid input. -sp needs to be in {1,2}. Ending...\n");
	if (LSOption < 0 || LSOption > 3)				logAndExit("Invalid input for -LS. Ending...\n");
	if (algChoice == 6) {
		addDummies = true;
		LSOption = 0;
		cout << "Running Yen's algorithm until a solution of length k=" << k << " is reached ...\n"
			<< "Note that parameters -c, -sp, -h, -r, and -LS have no effect ..." << endl;
	}
		
	//Set random seed
	srand(seed);

	//Create the graph G
	Graph G = makeGraph(adjList, vName, k, source, remDegOne, addDummies);

	//Start the timer and execute the selected algorithm
	clock_t runStart = clock(), splitTime, runEnd;
	double initAlgTime, timeBestInitGapFound, overallRunTime;
	vector<Circuit> sols;
	
	if (algChoice != 6) {
		sols = doublePathHeuristic(G, source, k, solChoice, algChoice, SPAlg, haltAtOptimal, numIts, splitTime);
		clock_t stop = clock();
		initAlgTime = (stop - runStart) / double(CLOCKS_PER_SEC);
		timeBestInitGapFound = (splitTime - runStart) / double(CLOCKS_PER_SEC);
	}
	else {
		sols = doYen(G, source, k, initAlgTime, numIts);
		timeBestInitGapFound = initAlgTime;
	}
	long long initLB = sols[0].len;
	long long initUB = sols[1].len;

	if (verbose >= 1) {
		cout << "Solutions from Heuristic/Yen = \n";
		printCircuit(G, sols[0], solChoice);
		printCircuit(G, sols[1], solChoice);
	}		
	
	if (LSOption > 0) {
		LSIts = 0;	//This variable keeps track of how many calls to the SPAlg are made in the LS procedure
		doLocalSearch(G, sols, k, solChoice, algChoice, SPAlg, LSOption, LSIts);
		if (verbose >= 1) {
			cout << "Solutions from Local Search (Option " << LSOption << "):\n";
			printCircuit(G, sols[0], solChoice);
			printCircuit(G, sols[1], solChoice);
		}
	}

	runEnd = clock();
	overallRunTime = (runEnd - runStart) / double(CLOCKS_PER_SEC);

	writeCircuitsToFile(G, sols, inFile);
	if (verbose >= 1) cout << "Total time taken in run = " << overallRunTime << " s." << endl;
	
	//Output some information (on a single line) to the screen and also append it to the log file 'resLog.txt'
	string s =
		inFile + "\t" +
		to_string(origN) + "\t" +
		to_string(origM) + "\t" +
		to_string(origSource) + "\t" +
		to_string(k) + "\t" +
		to_string(solChoice) + "\t" +
		to_string(SPAlg) + "\t" +
		to_string(algChoice) + "\t" +
		to_string(remDegOne) + "\t" +
		to_string(seed) + "\t" +
		to_string(verbose) + "\t" +
		to_string(haltAtOptimal) + "\t" +
		to_string(LSOption) + "\t" +
		to_string(G.n) + "\t" +
		to_string(G.m) + "\t" +
		to_string(G.numDummies) + "\t" +
		to_string(numIts) + "\t" +
		to_string(initLB) + "\t" +
		to_string(initUB) + "\t" +
		to_string(timeBestInitGapFound) + "\t" +
		to_string(initAlgTime) + "\t" +
		to_string(sols[0].len) + "\t" +
		to_string(sols[1].len) + "\t" +
		to_string(LSIts) + "\t" +
		to_string(overallRunTime) + "\n";
	logAndExit(s);

	return 0;
}