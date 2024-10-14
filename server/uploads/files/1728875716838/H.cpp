#include <bits/stdc++.h>

using namespace std;

int minColoringActions(vector<string>& matrix) {
    int n = matrix.size();
    int m = matrix[0].size();
    int actions = 0;

    // Function to color a row or column
    auto colorLine = [&](int i, int j, bool isRow) {
        if (isRow) {
            while (j < m && matrix[i][j] == '#') {
                matrix[i][j] = 'C';  // 'C' for colored
                j++;
            }
        } else {
            while (i < n && matrix[i][j] == '#') {
                matrix[i][j] = 'C';
                i++;
            }
        }
    };

    // Iterate through the matrix
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) {
            if (matrix[i][j] == '#') {
                // Check if coloring row or column is better
                int rowCount = 0, colCount = 0;
                for (int k = j; k < m && matrix[i][k] == '#'; k++) rowCount++;
                for (int k = i; k < n && matrix[k][j] == '#'; k++) colCount++;

                if (rowCount >= colCount) {
                    colorLine(i, j, true);
                } else {
                    colorLine(i, j, false);
                }
                actions++;
            }
        }
    }

    return actions;
}

int main() {
    int n, m;
    cin >> n >> m;

    vector<string> matrix(n);
    for (int i = 0; i < n; i++) {
        cin >> matrix[i];
    }

    cout << minColoringActions(matrix) << endl;

    return 0;
}