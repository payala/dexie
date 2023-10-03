const hre = require("hardhat");
const ethers = hre.ethers;
const FileSystem = require("fs");
const path = require("path");

const { mine } = require("@nomicfoundation/hardhat-network-helpers");
const erc20Build = require("@openzeppelin/contracts/build/contracts/ERC20.json");
const erc20Abi = erc20Build.abi;

const toBytes32 = (bn) =>
  ethers.hexlify(ethers.zeroPadValue(ethers.toBeHex(bn), 32));

const setStorageAt = async (address, index, value) => {
  await hre.network.provider.send("hardhat_setStorageAt", [
    address,
    index,
    value,
  ]);
  await hre.network.provider.send("hardhat_mine", ["0x100"]);
};

module.exports = {
  /**** Hardhat utilities ****/
  mineAndWaitBlocks: async (numBlocks = 1) => {
    const initialBlock = await ethers.provider.getBlockNumber();
    await hre.network.provider.send("hardhat_mine", [
      "0x" + numBlocks.toString(16),
    ]);
    module.exports.waitUntilBlock(initialBlock + numBlocks);
  },
  waitBlocks: async (numBlocks = 1) => {
    const initialBlock = await ethers.provider.getBlockNumber();
    module.exports.waitUntilBlock(initialBlock + numBlocks);
  },
  waitUntilBlock: async (finalBlockNumber) => {
    while ((await ethers.provider.getBlockNumber()) < finalBlockNumber);
  },
  setTokens: async (userAddress, tokenAddress, tokenAmount) => {
    const signer = await ethers.provider.getSigner();
    const tokenContract = await ethers.getContractAt(
      erc20Abi,
      tokenAddress,
      signer
    );
    const decimals = await tokenContract.decimals();
    const symbol = await tokenContract.symbol();

    const knownSymbols = {
      USDT: {
        balanceSlot: 2,
      },
      WETH: {
        balanceSlot: 3,
      },
      USDC: {
        balanceSlot: 9,
      },
    };

    const slot = knownSymbols[symbol].balanceSlot;

    const index = ethers.solidityPackedKeccak256(
      ["uint256", "uint256"],
      [userAddress, slot]
    );
    await setStorageAt(
      tokenAddress,
      index.toString(),
      toBytes32(tokenAmount).toString()
    );
  },
  /**** Type Conversion functions ****/

  toEth: (wei, decimals = 18) => {
    return ethers.formatUnits(wei, decimals);
  },

  toEthNum: (...args) => {
    return Number(module.exports.toEth(...args));
  },

  tokens: (n, decimals = 18) => {
    return ethers.parseUnits(n.toString(), decimals);
  },

  ether: (n) => module.exports.tokens(n),

  /**** File utility functions ****/

  saveObject: (obj, relativePath) => {
    const configPath = path.join(__dirname, relativePath);
    const filename = path.basename(relativePath);

    FileSystem.writeFile(
      configPath,
      JSON.stringify(obj, null, 2),
      "utf-8",
      (error) => {
        if (error) {
          console.error(`An error occured while saving ${filename}`, error);
        } else {
          console.log(`${filename} saved successfully`);
        }
      }
    );
  },

  /* Useful for saving the config automatically. For example, it can be used in the
deploy script after having added the contract addresses to the config.

To import the config in the first place, you can just use:
`const config = require("../src/config.json");`
*/
  saveConfig: (config, relativeFullPath) => {
    return module.exports.saveObject(config, relativeFullPath);
  },

  copyAbi: (contractName, relativeArtifactsPath) => {
    const srcAbiPath = path.join(
      __dirname,
      relativeArtifactsPath,
      `contracts/${contractName}.sol/${contractName}.json`
    );
    const dstRelAbiPath = path.join(
      relativeArtifactsPath,
      `../src/abis/${contractName}.json`
    );

    const abi = require(srcAbiPath);

    const trueAbi = abi.abi;

    module.exports.saveObject(trueAbi, dstRelAbiPath);
  },
};
