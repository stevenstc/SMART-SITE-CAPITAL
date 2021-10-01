pragma solidity >=0.7.0;
// SPDX-License-Identifier: Apache 2.0

interface Binary_Interface {

    function investors(address _user) external view returns (bool registered,
    bool recompensa,
    uint256 plan,
    uint256 balanceRef,
    uint256 totalRef,
    uint256 amount,
    uint256 almacen,
    uint256 inicio,
    uint256 invested,
    uint256 paidAt,
    uint256 withdrawn,
    uint256 directos);

    function withdrawable(address _user) external returns (uint256);
}