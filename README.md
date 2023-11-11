# Dexie, simple DEX aggregator

This is a simple DEX aggregator that finds the best rate for a swap between different DEXes and routes your swap to the one that gives the best rate for the amount to be swapped.

Currently, it reflects what I considered to be an MVP, with simple but complete functionality.

It is backed by a generic, interface oriented smart contract that allows to route a swap and to get the rates for any DEX that implements the UniswapV2 interface. Additional DEXes can be incorporated by just changing the frontend.

You can find it live [here](https://dexie.payala.me)

# Features

### Support extensive list of tokens

I considered adding a manual set of ERC20 Tokens, but this didn't seem "complete" enough for me. Currently, the list of tokens are fetched from https://tokenlists.org/ using the list of Uniswap Pairs, and curated against the list of 1Inch Tokens for better data quality.

### Smooth UI

There are some challenges in supporting such a wide list of tokens from a UI perspective. Currently, the list of tokens in the respective dropdowns are populated dynamically to ensure that there exists at least one pair in Uniswap for them. So once one token is selected, the other dropdown is conditioned to tokens that would form a valid pair at least on one DEX.

With such a big list of tokens, it is important to be able to find your token. To make this easier, while you have the dropdown open, it is possible to type, and the list of available tokens will be filtered to the ones that match your input.

### Deployed to Mainnet

As part of making this complete and fully functional, I considered it is necessary to deploy this to Mainnet, so swaps on real tokens can be done. So the smart contract is deployed to:

- ETH Mainnet: `0x8dfB32087B9CDE0dF71d0D6Bbc11F34AEB1da177`
- Goerli Testnet: `0x8a4D021cd661D233bf1Ce3b9583116bfd1d490d3`

And a functional frontend supporting Mainnet and Hardhat local node can be found at https://dexie.payala.me.

# Future enhancements

- Support native ETH swapping
- Detail panel with the rates of all DEXes and how they compare
- Additional DEXes
- Additional DEX interfaces
- Deploy on Arbitrum, Polygon, and ZkSync
- Splitting of large swaps among several DEXes to minimize slippage, while minimizing gas usage

# Languages and Tools used

- Solidity
- React.js
- Hardhat

# Installation instructions

- clone repo
- install dependencies `npm install`
- Optional: run tests `npx hardhat test`

## Local development

- Start hardhat node `npx hardhat node --network localhost`
- Deploy contract to node `npx hardhat run scripts/deploy.js --network localhost`
- Start react server `npm run start`

# Compiling smart contract

- `npx hardhat compile`

# Deploying to ETH Mainnet

- fill `.env` file with at least these fields, use .env.example as a template
  - ALCHEMY_API_KEY
  - PRIVATE_KEY: pay attention to the format already existing in .env.example
- `npx hardhat run scripts/deploy.js

# Acknowledgements

Especial thanks to [Gregory McCubbin](https://www.dappuniversity.com/) and [Anthony Romagnolo](https://anthonyromagnolo.wordpress.com/) for their mentorship and sharing their knowledge with me. And to all the folks from the DappUniversity mentorship program with who I had the pleasure to work with.

# Contact

You can find my contact details at [my personal site](https://bdev.payala.me)
