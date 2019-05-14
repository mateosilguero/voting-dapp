import React, { Component } from "react";
import ElectionContract from "./contracts/Election.json";
import getWeb3 from "./utils/getWeb3";

import "./App.css";

class App extends Component {
  state = {
    web3: null,
    accounts: null,
    contract: null,
    hasVoted: null,
    positiveVotes: 0,
    negativeVotes: 0
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();      

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = ElectionContract.networks[networkId];
      const instance = new web3.eth.Contract(
        ElectionContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
      const [ hasVoted, yesVotes, noVotes ] = await this.updateCounters(instance, accounts[0]);
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({
        web3,
        accounts,
        contract: instance,
        hasVoted,
        positiveVotes: yesVotes.voteCount,
        negativeVotes: noVotes.voteCount
      });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  updateCounters = (contract, address) => {
    return Promise.all([
      contract.methods.voters.call(this, address).call(),
      contract.methods.candidates.call(this, 1).call(),
      contract.methods.candidates.call(this, 2).call()
    ])
    .then(res => res);
  }

  vote = async (value) => {
    const { accounts, contract } = this.state;

    // Vote.
    await contract.methods.vote(value).send({ from: accounts[0], gas: 1000000 });
    const [ hasVoted, yesVotes, noVotes ] = await this.updateCounters(contract, accounts[0]);
    this.setState({
      hasVoted,
      positiveVotes: yesVotes.voteCount,
      negativeVotes: noVotes.voteCount
    });
  };

  render() {
    const { web3, hasVoted, positiveVotes, negativeVotes } = this.state;
    if (!web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    const totalVotes = Number(positiveVotes) + Number(negativeVotes);

    return (
      <div className="App">
        <h1>Binary Election</h1>
        <p>You should choose between YES and NO.</p>
        <p>
        choice cannot be edited.
        </p>
        {
          hasVoted ?
            <div>Your choice was: {hasVoted}</div> :
            <React.Fragment>
              <button onClick={() => this.vote(1)}>
                YES
              </button>
              <button onClick={() => this.vote(2)}>
                NO
              </button>
            </React.Fragment>
        }

        <h2>Parcial Result:</h2>
        <div className="results">
          <p 
            style={{ 
              background: 'lightgreen',
              width: `${(positiveVotes * 100) / totalVotes}%`
            }}>
            YES: {positiveVotes} votes
          </p>
          <p
            style={{
              background: 'orangered',
              width: `${(negativeVotes * 100) / totalVotes}%`
            }}>
            NO: {negativeVotes} votes
          </p>
        </div>
      </div>
    );
  }
}

export default App;
