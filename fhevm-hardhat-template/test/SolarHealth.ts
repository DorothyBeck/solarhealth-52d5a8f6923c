import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { SolarHealth, SolarHealth__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("SolarHealth")) as SolarHealth__factory;
  const solarHealthContract = (await factory.deploy()) as SolarHealth;
  const solarHealthContractAddress = await solarHealthContract.getAddress();

  return { solarHealthContract, solarHealthContractAddress };
}

describe("SolarHealth", function () {
  let signers: Signers;
  let solarHealthContract: SolarHealth;
  let solarHealthContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    // Tests require mock FHEVM for encrypted operations
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ solarHealthContract, solarHealthContractAddress } = await deployFixture());
  });

  it("should record health data (weight)", async function () {
    const date = Math.floor(Date.now() / 1000);
    const weight = 705; // 70.5kg * 10
    
    const encryptedWeight = await fhevm
      .createEncryptedInput(solarHealthContractAddress, signers.alice.address)
      .add16(weight)
      .encrypt();
    
    const tx = await solarHealthContract
      .connect(signers.alice)
      .recordHealthData(
        date,
        0, // category: weight
        encryptedWeight.handles[0],
        encryptedWeight.inputProof
      );
    
    await tx.wait();
    
    // Verify data was recorded
    const handle = await solarHealthContract.connect(signers.alice).getHealthDataHandle(date, 0);
    expect(handle).to.not.eq(ethers.ZeroHash);
  });

  it("should record health data (steps)", async function () {
    const date = Math.floor(Date.now() / 1000);
    const steps = 10000;
    
    const encryptedSteps = await fhevm
      .createEncryptedInput(solarHealthContractAddress, signers.alice.address)
      .add32(steps)
      .encrypt();
    
    const tx = await solarHealthContract
      .connect(signers.alice)
      .recordSteps(
        date,
        encryptedSteps.handles[0],
        encryptedSteps.inputProof
      );
    
    await tx.wait();
    
    // Verify data was recorded
    const handle = await solarHealthContract.connect(signers.alice).getStepsHandle(date);
    expect(handle).to.not.eq(ethers.ZeroHash);
  });

  it("should calculate average", async function () {
    const date1 = Math.floor(Date.now() / 1000);
    const date2 = date1 + 86400; // next day
    const weight1 = 700; // 70.0kg
    const weight2 = 710; // 71.0kg
    
    // Record first weight
    const encryptedWeight1 = await fhevm
      .createEncryptedInput(solarHealthContractAddress, signers.alice.address)
      .add16(weight1)
      .encrypt();
    
    await solarHealthContract
      .connect(signers.alice)
      .recordHealthData(date1, 0, encryptedWeight1.handles[0], encryptedWeight1.inputProof);
    
    // Record second weight
    const encryptedWeight2 = await fhevm
      .createEncryptedInput(solarHealthContractAddress, signers.alice.address)
      .add16(weight2)
      .encrypt();
    
    await solarHealthContract
      .connect(signers.alice)
      .recordHealthData(date2, 0, encryptedWeight2.handles[0], encryptedWeight2.inputProof);
    
    // Calculate average
    const dates = [date1, date2];
    const tx = await solarHealthContract.connect(signers.alice).calculateAverage(dates, 0);
    await tx.wait();
    
    // Call again to get the handle after authorization
    const avgHandle = await solarHealthContract.connect(signers.alice).calculateAverage.staticCall(dates, 0);
    
    expect(avgHandle).to.not.eq(ethers.ZeroHash);
    
    // Decrypt and verify (average should be ~705)
    const decrypted = await fhevm.userDecryptEuint(
      FhevmType.euint16,
      avgHandle,
      solarHealthContractAddress,
      signers.alice
    );
    expect(decrypted).to.be.closeTo(705, 5); // Allow small rounding error
  });

  it("should calculate trend", async function () {
    const date1 = Math.floor(Date.now() / 1000);
    const date2 = date1 + 86400;
    const weight1 = 700;
    const weight2 = 710;
    
    // Record weights
    const encryptedWeight1 = await fhevm
      .createEncryptedInput(solarHealthContractAddress, signers.alice.address)
      .add16(weight1)
      .encrypt();
    
    await solarHealthContract
      .connect(signers.alice)
      .recordHealthData(date1, 0, encryptedWeight1.handles[0], encryptedWeight1.inputProof);
    
    const encryptedWeight2 = await fhevm
      .createEncryptedInput(solarHealthContractAddress, signers.alice.address)
      .add16(weight2)
      .encrypt();
    
    await solarHealthContract
      .connect(signers.alice)
      .recordHealthData(date2, 0, encryptedWeight2.handles[0], encryptedWeight2.inputProof);
    
    // Calculate trend (should be rising)
    const tx = await solarHealthContract.connect(signers.alice).calculateTrend(date1, date2, 0);
    await tx.wait();
    
    // Call again to get the handle after authorization
    const isRisingHandle = await solarHealthContract.connect(signers.alice).calculateTrend.staticCall(date1, date2, 0);
    
    const decrypted = await fhevm.userDecryptEbool(
      isRisingHandle,
      solarHealthContractAddress,
      signers.alice
    );
    expect(decrypted).to.be.true;
  });

  it("should set and get goals", async function () {
    const targetWeight = 680; // 68.0kg
    const deadline = Math.floor(Date.now() / 1000) + 86400 * 30; // 30 days
    
    const encryptedTarget = await fhevm
      .createEncryptedInput(solarHealthContractAddress, signers.alice.address)
      .add16(targetWeight)
      .encrypt();
    
    const tx = await solarHealthContract
      .connect(signers.alice)
      .setGoal(0, encryptedTarget.handles[0], encryptedTarget.inputProof, deadline);
    
    await tx.wait();
    
    // Get active goals
    const goals = await solarHealthContract.connect(signers.alice).getActiveGoals();
    expect(goals.length).to.eq(1);
    expect(goals[0].category).to.eq(0);
    expect(goals[0].active).to.be.true;
  });

  it("should calculate health score", async function () {
    const date1 = Math.floor(Date.now() / 1000);
    const date2 = date1 + 86400;
    const steps1 = 8000;
    const steps2 = 12000;
    
    // Record steps
    const encryptedSteps1 = await fhevm
      .createEncryptedInput(solarHealthContractAddress, signers.alice.address)
      .add32(steps1)
      .encrypt();
    
    await solarHealthContract
      .connect(signers.alice)
      .recordSteps(date1, encryptedSteps1.handles[0], encryptedSteps1.inputProof);
    
    const encryptedSteps2 = await fhevm
      .createEncryptedInput(solarHealthContractAddress, signers.alice.address)
      .add32(steps2)
      .encrypt();
    
    await solarHealthContract
      .connect(signers.alice)
      .recordSteps(date2, encryptedSteps2.handles[0], encryptedSteps2.inputProof);
    
    // Calculate health score
    const dates = [date1, date2];
    const tx = await solarHealthContract.connect(signers.alice).calculateHealthScore(dates);
    await tx.wait();
    
    // Call again to get the handle after authorization
    const scoreHandle = await solarHealthContract.connect(signers.alice).calculateHealthScore.staticCall(dates);
    
    expect(scoreHandle).to.not.eq(ethers.ZeroHash);
    
    // Decrypt and verify (average steps = 10000, score should be ~100)
    const decrypted = await fhevm.userDecryptEuint(
      FhevmType.euint16,
      scoreHandle,
      solarHealthContractAddress,
      signers.alice
    );
    expect(decrypted).to.be.greaterThan(0);
  });

  it("should perform risk assessment", async function () {
    const date1 = Math.floor(Date.now() / 1000);
    const date2 = date1 + 86400;
    const date3 = date2 + 86400;
    
    const bp1 = 120;
    const bp2 = 125;
    const bp3 = 118;
    
    // Record blood pressures
    for (let i = 0; i < 3; i++) {
      const date = i === 0 ? date1 : i === 1 ? date2 : date3;
      const bp = i === 0 ? bp1 : i === 1 ? bp2 : bp3;
      
      const encryptedBP = await fhevm
        .createEncryptedInput(solarHealthContractAddress, signers.alice.address)
        .add16(bp)
        .encrypt();
      
      await solarHealthContract
        .connect(signers.alice)
        .recordHealthData(date, 1, encryptedBP.handles[0], encryptedBP.inputProof); // category 1 = systolicBP
    }
    
    // Perform risk assessment
    const dates = [date1, date2, date3];
    const tx = await solarHealthContract.connect(signers.alice).riskAssessment(dates);
    await tx.wait();
    
    // Call again to get the handle after authorization
    const riskHandle = await solarHealthContract.connect(signers.alice).riskAssessment.staticCall(dates);
    
    expect(riskHandle).to.not.eq(ethers.ZeroHash);
    
    // Decrypt risk level
    const decrypted = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      riskHandle,
      solarHealthContractAddress,
      signers.alice
    );
    expect(decrypted).to.be.greaterThanOrEqual(0);
    expect(decrypted).to.be.lessThanOrEqual(100);
  });
});
