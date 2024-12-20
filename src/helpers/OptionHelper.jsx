import { useContext } from "react";
import { Web3Context } from "../App";
import Web3 from "web3";

const OptionHelper = () => {
  const {
    changeWeb3,
    accountAddr,
    changeAccountAddr,
    contract,
    changeEndTime,
  } = useContext(Web3Context);

  const getAccount = async () => {
    if (!accountAddr) {
      // No account connected
      const web3 = new Web3(window.ethereum);
      if (web3) {
        // Wallet found
        changeWeb3(web3);
        try {
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          changeAccountAddr(accounts[0]);
          localStorage.setItem("accountAddr", accounts[0]);
          console.log("Connected account:", accounts[0]);
          return accounts[0];
        } catch (error) {
          console.error("User denied account access or error occurred:", error);
        }
      } else {
        // No wallet found
        console.error("No Wallet Found!");
      }
    } else {
      // Account already connected
      console.log("Wallet already connected:", accountAddr);
      return accountAddr;
    }
  };

  const handleOption = async (option, formData, formResult = []) => {
    let account;
    switch (option) {
      case "Vote":
        account = await getAccount();

        try {
          await contract.methods
            .voteCandidate(formResult[0])
            .estimateGas({ from: account });
          await contract.methods
            .voteCandidate(formResult[0])
            .send({ from: account });
          return "Voted successfully.";
        } catch (error) {
          if (error.data && error.data.message) {
            return error.data.message;
          } else {
            return "Error voting.";
          }
        }
      case "Register as Student":
        account = await getAccount();

        try {
          await contract.methods.addVoter(formData).estimateGas({
            from: account,
          });
          await contract.methods.addVoter(formData).send({ from: account });
          return "Voter added successfully.";
        } catch (error) {
          if (error.data && error.data.message) {
            return error.data.message;
          } else {
            return "Error adding voter.";
          }
        }
      case "Apply as Candidate":
        account = await getAccount();

        try {
          await contract.methods
            .addCandidate(formResult)
            .estimateGas({ from: account });
          await contract.methods
            .addCandidate(formResult)
            .send({ from: account });
          return "Candidate added successfully.";
        } catch (error) {
          console.error("Error adding candidate:", error);
          if (error.data && error.data.message) {
            return error.data.message;
          } else {
            return "Error adding candidate.";
          }
        }
      case "View Time":
        try {
          const result = await contract.methods.getStartEndTime().call();
          const startTime = new Date(Number(result[0]) * 1000).toLocaleString();
          const endTime = new Date(Number(result[1]) * 1000).toLocaleString();
          return "Start Time: " + startTime + "\nEnd Time: " + endTime;
        } catch (error) {
          console.error("Error viewing time:", error);
          if (error.data && error.data.message) {
            return error.data.message;
          } else {
            return "Error viewing time.";
          }
        }
      case "View Winner":
        account = await getAccount();

        try {
          await contract.methods
            .findWinningCandidate()
            .estimateGas({ from: account });
          await contract.methods.findWinningCandidate().send({ from: account });
          const result = await contract.methods.getWinningCandidate().call();
          return result
            .map(
              (winner) =>
                `Organization Name: ${winner.info[0]}\nName: ${winner.info[1]}\nAddress: ${winner.addr}\nVotes: ${winner.votes}`
            )
            .join("\n");
        } catch (error) {
          if (error.data && error.data.message) {
            return error.data.message;
          } else {
            return "Error viewing winner.";
          }
        }
      case "View Past Winners":
        try {
          const result = await contract.methods.getPastWinner().call();
          const pastWinners = result.map((winner) => ({
            address: winner.addr,
            suName: winner.info[0],
            name: winner.info[1],
            votes: winner.votes,
          }));
          return pastWinners
            .map(
              (winner) =>
                `Organization Name: ${winner.suName}\nName: ${winner.name}\nAddress: ${winner.address}\nVotes: ${winner.votes}`
            )
            .join("\n\n");
        } catch (error) {
          if (error.data && error.data.message) {
            return error.data.message;
          } else {
            return "Error viewing past winners.";
          }
        }
      case "View All Voters":
        try {
          const result = await contract.methods.getAllVoters().call();
          return result
            .map(
              (voter) =>
                `Address: ${voter.addr}\nVoted: ${voter.voted}\nCandidate ID: ${voter.candidateId}\nSID: ${voter.sid}`
            )
            .join("\n");
        } catch (error) {
          if (error.data && error.data.message) {
            return error.data.message;
          } else {
            return "Error viewing all voters.";
          }
        }
      case "Edit Start/End Time":
        const [startTime, endTime] = formData.split(",");
        account = await getAccount();
        const convertedStartTime = Number(startTime);
        const convertedEndTime = Number(endTime);

        try {
          await contract.methods
            .editStartEndTimestamp(convertedStartTime, convertedEndTime)
            .estimateGas({ from: account });
          await contract.methods
            .editStartEndTimestamp(convertedStartTime, convertedEndTime)
            .send({ from: account });
          changeEndTime(convertedEndTime);
          return "Start/End time edited successfully.";
        } catch (error) {
          if (error.data && error.data.message) {
            return error.data.message;
          } else {
            return "Error editing start/end time.";
          }
        }
      case "Initiate an Election":
        account = await getAccount();

        try {
          await contract.methods.restart().estimateGas({ from: account });
          await contract.methods.restart().send({ from: account });
          changeEndTime(0);
          return "Election initiated successfully.";
        } catch (error) {
          if (error.data && error.data.message) {
            return error.data.message;
          } else {
            return "Error initiating election.";
          }
        }
      default:
        return "Invalid option.";
    }
  };

  return { handleOption };
};

export default OptionHelper;
