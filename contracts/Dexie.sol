// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
using SafeERC20 for IERC20;

import "hardhat/console.sol";


contract Dexie {

    function getAmountsIn(address _dexAddress, uint256 _amountOut, address[] memory _path) public view returns (uint[] memory _amounts) {
        return IUniswapV2Router02(_dexAddress).getAmountsIn(_amountOut, _path);
    }

    function getAmountsOut(address _dexAddress, uint256 _amountIn, address[] memory _path) public view returns (uint[] memory _amounts) {
        return IUniswapV2Router02(_dexAddress).getAmountsOut(_amountIn, _path);
    }

    function swapOnUniV2(
        address _dexAddress, 
        address[] memory _path, 
        uint256 _amountIn, 
        uint256 _minAmountOut
    ) public 
    returns (uint256 finalAmountOut) {
        require(_dexAddress != address(0), "Invalid DEX address");
        require(_amountIn > 0, "Invalid input amount");

        IERC20(_path[0]).safeTransferFrom(msg.sender, address(this), _amountIn);
        
        uint[] memory amounts = _swapOnIUniV2(_dexAddress, _path, _amountIn, _minAmountOut);

        IERC20(_path[1]).safeTransfer(msg.sender, amounts[1]);        

        return amounts[1];
    }

    function _swapOnIUniV2(
        address dexAddress,
        address[] memory _path,
        uint256 _amountIn,
        uint256 _amountOut
    ) internal returns (uint[] memory amounts){
        IUniswapV2Router02 router = IUniswapV2Router02(dexAddress);
        
        require(
            IERC20(_path[0]).approve(address(router), _amountIn),
            "DEX approval failed."
        );

        return router.swapExactTokensForTokens(
            _amountIn,
            _amountOut,
            _path,
            address(this),
            (block.timestamp + 1200)
        );
    }
}
