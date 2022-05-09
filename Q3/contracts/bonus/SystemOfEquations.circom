pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";
// include ""; // hint: you can use more than one templates in circomlib-matrix to help you
include "../../node_modules/circomlib-matrix/circuits/matMul.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";

template SystemOfEquations(n) { // n is the number of variables in the system of equations
    signal input x[n]; // this is the solution to the system of equations
    signal input A[n][n]; // this is the coefficient matrix
    signal input b[n]; // this are the constants in the system of equations
    signal output out; // 1 for correct solution, 0 for incorrect solution

    // [bonus] insert your code here

    component multiplication = matMul(n,n,1);
    // Initialization of A and x:
    for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++) {
            multiplication.a[i][j] <== A[i][j];
        }
        multiplication.b[i][0] <== x[i];
    }

    // Compare A[i][:]*x and b[i]
    component equals_axb[n]; 
    for (var i = 0; i < n; i++) {
        equals_axb[i] = IsEqual();
        equals_axb[i].in[0] <== multiplication.out[i][0];
        equals_axb[i].in[1] <== b[i];
    }

    // Check all comarisons
    signal all_equals[n];
    all_equals[0] <== equals_axb[0].out;
    for (var i = 1; i < n; i++) {
        all_equals[i] <== all_equals[i-1] * equals_axb[i].out;
    }
    out <== all_equals[n-1];

}

component main {public [A, b]} = SystemOfEquations(3);