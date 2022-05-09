const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16, plonk } = require("snarkjs");

function unstringifyBigInts(o) {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return BigInt(o);
    } else if ((typeof(o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o) ))  {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        if (o===null) return null;
        const res = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

describe("HelloWorld", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("HelloWorldVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2"}, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm","contracts/circuits/HelloWorld/circuit_final.zkey"); // generates a zk Proof using input parameters. 
        
        console.log('1x2 =',publicSignals[0]); // print string and output of the circuit

        const editedPublicSignals = unstringifyBigInts(publicSignals); // get the BigInt values from the circuit output
        const editedProof = unstringifyBigInts(proof); // get the BigInt values from the circuit witness 
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals); // convert witness and output signals into obfuscated string, which then will be used as parameter of the verifyProof for verifier contract

        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString()); // parse the string into number arguments
    
        const a = [argv[0], argv[1]]; // assign the first pair of arguments as the first term
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]]; // assign next two pair of arguments as the second term
        const c = [argv[6], argv[7]]; // assign fithe forth pair of arguments as the result of summation
        const Input = argv.slice(8); // assign rest parameters (which are the encrypted circuit output) as Input 

        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true; // proof verification (on the verifier side)
    });
    it("Should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with Groth16", function () {
    let Verifier;
    let verifier;
    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("Multiplier3Verifier");
        verifier = await Verifier.deploy(); 
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        const { proof, publicSignals } = await groth16.fullProve({"a":"3","b":"2","c":"6"}, "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3/circuit_final.zkey"); 
        
        console.log('3x2x6 =',publicSignals[0]);

        const editedPublicSignals = unstringifyBigInts(publicSignals); // get the BigInt values from the circuit output
        const editedProof = unstringifyBigInts(proof); // get the BigInt values from the circuit witness 
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals); // convert witness and output signals into obfuscated string, which then will be used as parameter of the verifyProof for verifier contract

        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString()); // parse the string into number arguments

        const a = [argv[0], argv[1]]; // assign the first pair of arguments as the first term
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]]; // assign next two pair of arguments as the second term
        const c = [argv[6], argv[7]]; // assign fithe forth pair of arguments as the result of summation
        const Input = argv.slice(8); // assign rest parameters (which are the encrypted circuit output) as Input 
        // expect(true).to.be.true;

        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true; // proof verification (on the verifier side)
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with PLONK", function () {
    let Verifier;
    let verifier;
    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("PlonkVerifier");
        verifier = await Verifier.deploy(); 
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        const { proof, publicSignals } = await plonk.fullProve({"a":"3","b":"2","c":"6"}, "contracts/circuits/Multiplier3_plonk/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3_plonk/circuit_final.zkey"); 
        
        console.log('3x2x6 =',publicSignals[0]);

        const editedPublicSignals = unstringifyBigInts(publicSignals); // get the BigInt values from the circuit output
        const editedProof = unstringifyBigInts(proof); // get the BigInt values from the circuit witness 
        const calldata = await plonk.exportSolidityCallData(editedProof, editedPublicSignals); // convert witness and output signals into obfuscated string, which then will be used as parameter of the verifyProof for verifier contract

        // console.log(editedPublicSignals);
        // console.log(editedProof);


        // const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString()); // parse the string into number arguments
        const a = calldata.split(',')[0];
        const b = JSON.parse(calldata.split(',')[1]);

        expect(await verifier.verifyProof(a, b)).to.be.true; // proof verification (on the verifier side)
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = '0x00';
        let b = ['0'];
        expect(await verifier.verifyProof(a, b)).to.be.false;
    });
});