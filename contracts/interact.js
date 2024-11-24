document.addEventListener('DOMContentLoaded', function() {
    const web3 = new Web3(window.ethereum);
    const compileData = "./Election.json";  // Path to compile data
    const contractAddrHolesky = "0x0fd985d0b61f73dfC6AaBe7263B27eabA2b988bD";   // In holesky
    //const contractAddrSepolia = "0xd53E487c319265aB35553f735DCa065422E101be";   // In sepolia (Not updated)
    const contractAddrDict = {"Holesky": contractAddrHolesky, "Sepolia": contractAddrSepolia};
    let contractAddr;


    let metaData;
    let myContract;
    let account;

    fetch(compileData)
        .then(response => {
            return response.json();
        })
        .then(data => {
            metaData = data;
            selectChain();
        });
        
    const radios = document.getElementsByName("chain");
    function selectChain() {
        for (let radio of radios)  {
            if (radio.checked) {
                contractAddr = contractAddrDict[radio.value];
                console.log(radio.value);
                myContract = new web3.eth.Contract(metaData.abi, contractAddr);
                console.log("Switch to " + radio.value);
            }
        }
    }

    radios.forEach(radio => {
        radio.addEventListener("change", selectChain);
    });

    

    document.getElementById("connectButton").addEventListener("click", async() => {

        const networkId = await web3.eth.net.getId(); 
        console.log("Connected to :", networkId);
        if (networkId == 17000n) {
            contractAddr = contractAddrHolesky;
        }
        else if (networkId == 11155111n) {
            contractAddr = contractAddrSepolia;
        }

        if (typeof window.ethereum === "undefined") {
            console.log("MetaMask is not installed. Please install it to use this app.");
        }
        else {
            console.log("MetaMask is installed!");
            try {
                const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                console.log("Connected account:", accounts[0]);
                account = accounts[0];
            }
            catch (e) {
                console.error(e);
            }
        }
    });

    document.getElementById("restart").addEventListener("click", async () => {
        try {
            await myContract.methods.restart().estimateGas({from: account});
            await myContract.methods.restart().send({from: account})
                .on("receipt", function() {
                    console.log("Done");
                })
        }
        catch (e) {
            console.log(e.data.message);
        }
    });

    document.getElementById("addVoter").addEventListener("click", async() => {
        try {
            const sid = document.getElementById("voterSID").value;
            const info = document.getElementById("voterInfo").value;
            await myContract.methods.addVoter(sid, info).estimateGas({from: account})
            await myContract.methods.addVoter(sid, info).send({from: account})
                .on("receipt", function() {
                    console.log("Done");
                });
        }
        catch (e) {       
            console.log(e.data.message);
        }
    });

    document.getElementById("addCandidate").addEventListener("click", async() => {
        try {
            const info = document.getElementById("candidateInfo").value;
            await myContract.methods.addCandidate(info).estimateGas({from: account})
            await myContract.methods.addCandidate(info).send({from: account})
                .on("receipt", function() {
                    console.log("Done");
                });
        }
        catch (e) {
            console.log(e.data.message);
        }
    });

    document.getElementById("getAllVoter").addEventListener("click", async() => {
        const result = await myContract.methods.getAllVoters().call();
        console.log(result);
    });

    document.getElementById("getAllCandidate").addEventListener("click", async() => {
        const result = await myContract.methods.getAllCandidates().call();
        console.log(result);
    });

    document.getElementById("editTime").addEventListener("click", async() => {
        try {
            const startTime = document.getElementById("startTime").value;
            const endTime = document.getElementById("endTime").value;
            await myContract.methods.editStartEndTimestamp(startTime,endTime).estimateGas({from: account});
            await myContract.methods.editStartEndTimestamp(startTime,endTime).send({from: account})
                .on("receipt", function() {
                    console.log("Done");
                });
        }
        catch (e) {
            console.log(e.data.message);
        }
    });

    document.getElementById("getTime").addEventListener("click", async() => {
        const result = await myContract.methods.getStartEndTime().call();
        console.log(result);
    })


    document.getElementById("vote").addEventListener("click", async() => {
        try {
            const address = document.getElementById("candidateAddress").value;
            await myContract.methods.voteCandidate(address).estimateGas({from: account});
            await myContract.methods.voteCandidate(address).send({from: account})
                .on("receipt", function() {
                    console.log("Done");
                });
        }
        catch (e) {
            console.log(e.data.message);
        }
    });

    document.getElementById("calWin").addEventListener("click", async() => {
        try {
            await myContract.methods.findWinningCandidate().estimateGas({from: account});
            await myContract.methods.findWinningCandidate().send({from: account})
                .on("receipt", async function() {
                    console.log("Done");
                });
        }
        catch (e) {
            console.log(e.data.message);
        }
    });

    document.getElementById("getWin").addEventListener("click", async() => {
        try {
            await myContract.methods.getWinningCandidate().estimateGas({from: account});
            const result = await myContract.methods.getWinningCandidate().call();
            console.log(result);
        }
        catch (e) {
            console.log(e);
            console.log(e.data.message);
        }
    });
    

});