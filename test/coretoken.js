const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CoreToken (CT)", function () {

  let token;
  let deployer;
  let treasury;
  let user;

  const INITIAL_SUPPLY =
    ethers.parseUnits("100000000", 18);

  beforeEach(async function () {
    [deployer, treasury, user] =
      await ethers.getSigners();

    const CoreToken = await ethers.getContractFactory(
      "CoreToken"
    );

    token = await CoreToken.deploy(treasury.address);
    await token.waitForDeployment();
  });

  it("should have the correct name and symbol", async function () {
    expect(await token.name()).to.equal("CoreToken");
    expect(await token.symbol()).to.equal("CT");
  });

  it("should use 18 decimals", async function () {
    expect(await token.decimals()).to.equal(18);
  });

  it("should create exactly 100 million CT", async function () {
    expect(await token.totalSupply()).to.equal(
      INITIAL_SUPPLY
    );
  });

  it("should allocate all initial tokens to treasury", async function () {
    expect(
      await token.balanceOf(treasury.address)
    ).to.equal(INITIAL_SUPPLY);

    expect(
      await token.balanceOf(deployer.address)
    ).to.equal(0);
  });

  it("should reject a zero treasury address", async function () {
    const CoreToken = await ethers.getContractFactory(
      "CoreToken"
    );

    await expect(
      CoreToken.deploy(ethers.ZeroAddress)
    ).to.be.revertedWith(
      "CoreToken: zero treasury address"
    );
  });

  it("should allow standard ERC-20 transfers", async function () {
    const amount = ethers.parseUnits("100", 18);

    await token.connect(treasury).transfer(
      user.address,
      amount
    );

    expect(
      await token.balanceOf(user.address)
    ).to.equal(amount);
  });

  it("should preserve total supply after transfers", async function () {
    await token.connect(treasury).transfer(
      user.address,
      ethers.parseUnits("500", 18)
    );

    expect(await token.totalSupply()).to.equal(
      INITIAL_SUPPLY
    );
  });

  it("should not expose mint or burn functions", async function () {
    const functionNames =
      token.interface.fragments
        .filter(fragment => fragment.type === "function")
        .map(fragment => fragment.name);

    expect(functionNames).not.to.include("mint");
    expect(functionNames).not.to.include("burn");
    expect(functionNames).not.to.include("burnFrom");
  });

});

