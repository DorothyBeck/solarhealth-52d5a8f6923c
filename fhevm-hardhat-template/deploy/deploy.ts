import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Deploy SolarHealth contract with FHEVM support
  const deployedSolarHealth = await deploy("SolarHealth", {
    from: deployer,
    log: true,
  });

  console.log(`SolarHealth contract deployed at: `, deployedSolarHealth.address);
};
export default func;
func.id = "deploy_solarHealth"; // id required to prevent reexecution
func.tags = ["SolarHealth"];
