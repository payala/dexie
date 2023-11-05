import { ethers } from "ethers";
import { setAccount, setProvider, setChainId } from "./reducers/provider";
import {
  setBalances,
  setTokenContracts,
  setTokenData,
} from "./reducers/tokens";
import { fixNum, toEth, tokens } from "../utils_fe";

import config from "../config.json";
import { setPairs, setSymbols, setDexContracts } from "./reducers/markets";

import { setBestRate } from "./reducers/dexie";

import IUniswapV2FactoryABI from "@uniswap/v2-core/build/IUniswapV2Factory.json";
import IUniswapV2RouterABI from "@uniswap/v2-periphery/build/IUniswapV2Router02.json";
import IUniswapV2PairABI from "@uniswap/v2-core/build/IUniswapV2Pair.json";
import IERC20 from "@openzeppelin/contracts/build/contracts/ERC20.json";
import DexieABI from "../abis/Dexie.json";
import { setContract } from "./reducers/dexie";

export const loadAccount = async (dispatch) => {
  // Fetch accounts
  console.log("Requesting metamask");
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  const account = ethers.getAddress(accounts[0]);
  dispatch(setAccount(account));

  return account;
};

export const loadProvider = (dispatch) => {
  const provider = getProvider();
  dispatch(setProvider(provider));
  return provider;
};

export const getProvider = () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  return provider;
};

export const loadNetwork = async (provider, dispatch) => {
  const { chainId } = await provider.getNetwork();
  dispatch(setChainId(chainId.toString()));

  return chainId;
};

// --------------------------------------------------------------------------------------
// LOAD EXCHANGES

export const loadDexes = async (provider, chainId, dispatch) => {
  const signer = await provider.getSigner();
  const dexContracts = [];
  for (const dex of Object.values(config[chainId].DEXES)) {
    const factoryContract = new ethers.Contract(
      dex.FACTORY_ADDRESS,
      IUniswapV2FactoryABI.abi,
      signer
    );
    const routerContract = new ethers.Contract(
      dex.V2_ROUTER_02_ADDRESS,
      IUniswapV2RouterABI.abi,
      signer
    );
    dexContracts.push({
      name: dex.name,
      router: routerContract,
      factory: factoryContract,
    });
  }

  dispatch(setDexContracts(dexContracts));
};

// --------------------------------------------------------------------------------------
// LOAD MARKETS

export const loadMarkets = async (provider, dispatch) => {
  let uniswapPairs;
  let uniswapSymbols;
  let oneInchTokens;
  // Fetch list of uniswap pairs from tokenlists.org
  await fetch(
    `https://raw.githubusercontent.com/jab416171/uniswap-pairtokens/master/uniswap_pair_tokens.json`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Error Fetching Pairs data from Uniswap: The status is ${response.status}`
        );
      }
      return response.json();
    })
    .then((actualData) => {
      let pairs = [];
      const symbols = new Set();

      pairs = actualData.tokens.map((token) => ({
        base: token.name.replace("Uniswap V2 - ", "").split("/")[0],
        quote: token.name.replace("Uniswap V2 - ", "").split("/")[1],
        pairAddress: token.address,
        decimals: token.decimals,
        chainId: token.chainId,
      }));

      for (const pair of pairs) {
        symbols.add(pair.quote);
        symbols.add(pair.base);
      }
      uniswapPairs = pairs;
      uniswapSymbols = [...symbols];
    })
    .catch((err) => {
      console.warn(err.message);
    });
  // Curate with the list of tokens from 1Inch also from tokenlists.org
  await fetch(
    `https://wispy-bird-88a7.uniswap.workers.dev/?url=http://tokens.1inch.eth.link`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Error Fetching Pairs data from 1Inch: The status is ${response.status}`
        );
      }
      return response.json();
    })
    .then((actualData) => {
      let symbols = {};

      for (const token of actualData.tokens) {
        symbols[token.symbol] = {
          address: token.address,
          chainId: token.chainId,
          name: token.name,
          symbol: token.symbol,
          decimals: token.decimals,
          logoURI: token.logoURI,
        };
      }

      oneInchTokens = symbols;
    })
    .catch((err) => {
      console.warn(err.message);
    });

  // Remove all uniswap tokens and pairs which are not in 1Inch tokens
  const oneInchSymbols = Object.keys(oneInchTokens);
  const pairs = uniswapPairs.filter(
    (pair) =>
      oneInchSymbols.includes(pair.quote) && oneInchSymbols.includes(pair.base)
  );
  const symbols = uniswapSymbols.filter((s) => oneInchSymbols.includes(s));
  dispatch(setPairs(pairs));
  dispatch(setSymbols([...symbols]));
  dispatch(setTokenData(oneInchTokens));
};

export const findMatchingSymbols = (symbol, pairs) => {
  // Returns a list of symbols that have a pair with symbol
  const relevantPairs = pairs.filter(
    (pair) => pair.base === symbol || pair.quote === symbol
  );
  const matchingSymbols = relevantPairs.map((pair) =>
    pair.quote === symbol ? pair.base : pair.quote
  );

  return matchingSymbols;
};

export const setTokenContract = async (
  symbol,
  pairs,
  tokenContracts,
  dispatch
) => {
  const provider = getProvider();
  const signer = await provider.getSigner();

  // Find a pair that includes the token to get the token contract
  const pair = pairs.find(
    (pair) => pair.base === symbol || pair.quote === symbol
  );
  const pairContract = new ethers.Contract(
    pair.pairAddress,
    IUniswapV2PairABI.abi,
    signer
  );
  let tokenAddress;
  if (pair.base === symbol) {
    tokenAddress = await pairContract.token0();
  } else {
    tokenAddress = await pairContract.token1();
  }

  const tokenContract = new ethers.Contract(tokenAddress, IERC20.abi, signer);
  // Add the token contract to the token contracts dict
  tokenContracts = { ...tokenContracts, [symbol]: tokenContract };
  dispatch(setTokenContracts(tokenContracts));
  return tokenContracts;
};

// --------------------------------------------------------------------------------------
// LOAD CONTRACTS
export const loadDexie = async (provider, chainId, dispatch) => {
  const dexie = new ethers.Contract(
    config[chainId].dexie.address,
    DexieABI,
    provider
  );

  dispatch(setContract(dexie));
};

//------------------------------------------------------------------------
// Load Balances & Shares

export const loadBalances = async (
  tokens,
  tokenContracts,
  pairs,
  account,
  dispatch
) => {
  const filteredTokens = tokens.filter((token) => Boolean(token));
  let updatedTokenContracts = { ...tokenContracts };
  if (filteredTokens.length === 0) return;
  for (const token of filteredTokens) {
    if (!Object.keys(tokenContracts).includes(token)) {
      updatedTokenContracts = await setTokenContract(
        token,
        pairs,
        tokenContracts,
        dispatch
      );
    }
  }
  const contracts = filteredTokens.map((token) => updatedTokenContracts[token]);
  const balances = await Promise.all(
    contracts.map(async (contract) => await contract.balanceOf(account))
  );

  const symbols = filteredTokens;

  const decimals = await Promise.all(
    contracts.map(async (contract) => await contract.decimals())
  );

  const balanceObj = {};
  for (let i = 0; i < balances.length; i++) {
    balanceObj[symbols[i]] = toEth(balances[i], decimals[i]);
  }

  dispatch(setBalances(balanceObj));
};

//------------------------------------------------------------------------
// Swapping

export const executeBestRateSwap = async (
  dexie,
  bestRateAt,
  dexContracts,
  inputTokenContract,
  outputTokenContract,
  inputAmount,
  minOutputAmount,
  signer
) => {
  const bestDex = dexContracts.find((dex) => dex.name === bestRateAt);
  const inputDecimals = await inputTokenContract.decimals();
  const outputDecimals = await outputTokenContract.decimals();
  const inputAmountWei = tokens(
    fixNum(inputAmount, inputDecimals),
    inputDecimals
  );
  const minOutputAmountWei = tokens(
    fixNum(minOutputAmount, outputDecimals),
    outputDecimals
  );
  // Approve sending tokens
  const approveTx = await inputTokenContract.approve(dexie, inputAmountWei);
  await approveTx.wait();
  // Now do the swap if all went fine
  const tx = await dexie
    .connect(signer)
    .swapOnUniV2(
      bestDex.router,
      [inputTokenContract.target, outputTokenContract.target],
      inputAmountWei,
      minOutputAmountWei
    );
  const result = await tx.wait();
  return result;
};

//------------------------------------------------------------------------
// Application data

export const storeBestRate = (bestRate, dispatch) => {
  // Convert all bigints to string because Redux Devtools cannot serialize them
  for (let key of Object.keys(bestRate)) {
    if (typeof bestRate[key] === "bigint") {
      bestRate[key] = bestRate[key].toString();
    }
  }
  dispatch(setBestRate(bestRate));
};

export const storeInputSymbol = (inputSymbol, swapData, dispatch) => {};
