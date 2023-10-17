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
} from "./reducers/markets";

import IUniswapV2FactoryABI from "@uniswap/v2-core/build/IUniswapV2Factory.json";
import IUniswapV2RouterABI from "@uniswap/v2-periphery/build/IUniswapV2Router02.json";
import IUniswapV2PairABI from "@uniswap/v2-core/build/IUniswapV2Pair.json";
import IERC20 from "@openzeppelin/contracts/build/contracts/ERC20.json";

export const loadAccount = async (dispatch) => {
  // Fetch accounts
  console.log("Requesting metamask");
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  console.log("Given");
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
  console.log(chainId);
  const uniswapFactory = new ethers.Contract(
    config[chainId].DEXES.uniswap.FACTORY_ADDRESS,
    IUniswapV2FactoryABI.abi,
    provider
  );
  const uniswapRouter = new ethers.Contract(
    config[chainId].DEXES.uniswap.V2_ROUTER_02_ADDRESS,
    IUniswapV2RouterABI.abi,
    provider
  );
  const sushiswapFactory = new ethers.Contract(
    config[chainId].DEXES.sushiswap.FACTORY_ADDRESS,
    IUniswapV2FactoryABI.abi,
    provider
  );
  const sushiswapRouter = new ethers.Contract(
    config[chainId].DEXES.sushiswap.V2_ROUTER_02_ADDRESS,
    IUniswapV2RouterABI.abi,
    provider
  );

  const dexContracts = {
    uniswap: {
      router: uniswapRouter,
      factory: uniswapFactory,
    },
    sushiswap: {
      router: sushiswapRouter,
      factory: sushiswapFactory,
    },
  };

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
      //console.log(`symbols: ${[...symbols]}`);
    })
    .catch((err) => {
      console.log(err.message);
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
  // Build token contract dict
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

  const tokens = {
    [pair.base]: token0Contract,
    [pair.quote]: token1Contract,
  };
  dispatch(setTokenContracts(tokens));
  dispatch(setSelectedPair(pair));
};
// --------------------------------------------------------------------------------------
// LOAD CONTRACTS

//------------------------------------------------------------------------
// Load Balances & Shares

export const loadBalances = async (amm, tokens, account, dispatch) => {
  const balance1 = await tokens[0].balanceOf(account);
  const balance2 = await tokens[1].balanceOf(account);

  dispatch(setBalances([toEth(balance1), toEth(balance2)]));
};
