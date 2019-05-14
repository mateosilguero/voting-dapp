const Election = artifacts.require("./Election.sol");

contract("Election", accounts => {
  it("...should vote Yes.", async () => {
    const electionInstance = await Election.deployed();

    // vote for Yes
    await electionInstance.vote(1, { from: accounts[0] });

    // Get choice
    const vote = await electionInstance.voters(accounts[0]);

    assert.equal(vote, "Yes", "not voted.");
  });

  it("...should vote No.", async () => {
    const electionInstance = await Election.deployed();

    // vote for Yes
    await electionInstance.vote(2, { from: accounts[1] });

    // Get choice
    const vote = await electionInstance.voters(accounts[1]);

    assert.equal(vote, "No", "not voted.");
  });
});
