import { ethers } from "ethers";
import provider, {
  setAccount,
  setProvider,
  setChainId,
} from "./reducers/provider";
import { setBalances, setTokenContracts } from "./reducers/tokens";
import { toEth, tokens } from "../utils_fe";
import { useSelector } from "react-redux";

import config from "../config.json";
import {
  setPairs,
  setSymbols,
  setDexContracts,
  setSelectedSymbol,
  setMatchingSymbols,
  setSelectedPair,
  setBestRateAt,
} from "./reducers/markets";

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
  const uniswapFactory = new ethers.Contract(
    config[chainId].DEXES.uniswap.FACTORY_ADDRESS,
    IUniswapV2FactoryABI.abi,
    signer
  );
  const uniswapRouter = new ethers.Contract(
    config[chainId].DEXES.uniswap.V2_ROUTER_02_ADDRESS,
    IUniswapV2RouterABI.abi,
    signer
  );
  const sushiswapFactory = new ethers.Contract(
    config[chainId].DEXES.sushiswap.FACTORY_ADDRESS,
    IUniswapV2FactoryABI.abi,
    signer
  );
  const sushiswapRouter = new ethers.Contract(
    config[chainId].DEXES.sushiswap.V2_ROUTER_02_ADDRESS,
    IUniswapV2RouterABI.abi,
    signer
  );

  const dexContracts = [
    {
      name: "Uniswap",
      router: uniswapRouter,
      factory: uniswapFactory,
    },
    {
      name: "Sushiswap",
      router: sushiswapRouter,
      factory: sushiswapFactory,
    },
  ];

  dispatch(setDexContracts(dexContracts));
};

// --------------------------------------------------------------------------------------
// LOAD MARKETS

export const loadMarkets = async (provider, dispatch) => {
  fetch(
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
      dispatch(setPairs(pairs));
      dispatch(setSymbols([...symbols]));
    })
    .catch((err) => {
      console.warn(err.message);
    });
};

export const selectFirstToken = (symbol, dispatch) => {
  dispatch(setSelectedSymbol(symbol));
};

export const selectMatchingSymbols = (symbols, dispatch) => {
  dispatch(setMatchingSymbols(symbols));
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
};

export const setPair = async (pair, dispatch) => {
  // A pair has been chosen, get the pair and token contracts
  const provider = getProvider();
  const signer = await provider.getSigner();
  const pairContract = new ethers.Contract(
    pair.pairAddress,
    IUniswapV2PairABI.abi,
    signer
  );
  const token0Address = await pairContract.token0();
  const token1Address = await pairContract.token1();

  const token0Contract = new ethers.Contract(token0Address, IERC20.abi, signer);
  const token1Contract = new ethers.Contract(token1Address, IERC20.abi, signer);

  // assign by symbols base and quote with their corresponding contract
  const tokens = {
    [await token0Contract.symbol()]: token0Contract,
    [await token1Contract.symbol()]: token1Contract,
  };
  dispatch(setTokenContracts(tokens));
  dispatch(setSelectedPair(pair));
};

export const storeBestRateDex = (bestRate, dispatch) => {
  console.log(`storeBestRate: ${bestRate.name}`);
  dispatch(setBestRateAt(bestRate.name));
};
// --------------------------------------------------------------------------------------
// LOAD CONTRACTS
export const loadDexie = async (provider, chainId, dispatch) => {
  const signer = provider.getSigner();
  const dexie = new ethers.Contract(
    config[chainId].dexie.address,
    DexieABI,
    provider
  );

  dispatch(setContract(dexie));
};

//------------------------------------------------------------------------
// Load Balances & Shares

export const loadBalances = async (tokens, account, dispatch) => {
  const balances = await Promise.all(
    tokens.map(async (token) => await token.balanceOf(account))
  );

  const decimals = await Promise.all(
    tokens.map(async (token) => await token.decimals())
  );

  dispatch(
    setBalances([
      toEth(balances[0], decimals[0]),
      toEth(balances[1], decimals[1]),
    ])
  );
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
  const inputAmountWei = tokens(inputAmount, inputDecimals);
  const minOutputAmountWei = tokens(minOutputAmount, outputDecimals);
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
