// Business Source License 1.1
// Use Limitation: https://www.smartsitecapital.com/ only
// Change Date: 2028-01-01
// After the Change Date, usage becomes governed by MIT License

// SPDX-License-Identifier: BSL-1.1
pragma solidity ^0.8.0;

interface ITRC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function balanceOf(address who) external view returns (uint256);
}

contract MultiLockup {
    address public owner;
    ITRC20 public immutable token;

    struct Lock {
        uint256 amount;
        uint256 unlockTimestamp;
        bool withdrawn;
    }

    mapping(address => Lock[]) public locks;

    // 🔐 Nuevo: total global de tokens actualmente bloqueados
    uint256 public totalCurrentlyLocked;

    event TokensLocked(address indexed beneficiary, uint256 amount, uint256 unlockTime);
    event TokensUnlocked(address indexed beneficiary, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "No autorizado");
        _;
    }

    constructor(address _token) {
        token = ITRC20(_token);
        owner = msg.sender;
    }

    function lockTokens(
        address _beneficiary,
        uint256 _amount,
        uint256 _unlockTimestamp
    ) external onlyOwner {
        require(_unlockTimestamp > block.timestamp, "Fecha invalida");
        require(_amount > 0, "Monto invalido");

        require(token.transferFrom(msg.sender, address(this), _amount), "Fallo la transferencia");

        locks[_beneficiary].push(
            Lock({
                amount: _amount,
                unlockTimestamp: _unlockTimestamp,
                withdrawn: false
            })
        );

        totalCurrentlyLocked += _amount; // 👈 Suma al total bloqueado

        emit TokensLocked(_beneficiary, _amount, _unlockTimestamp);
    }

    function unlockTokens() external {
        Lock[] storage userLocks = locks[msg.sender];
        uint256 totalToTransfer = 0;

        for (uint i = 0; i < userLocks.length; i++) {
            Lock storage l = userLocks[i];
            if (!l.withdrawn && block.timestamp >= l.unlockTimestamp) {
                totalToTransfer += l.amount;
                l.withdrawn = true;

                totalCurrentlyLocked -= l.amount; // 👈 Resta del total bloqueado

                emit TokensUnlocked(msg.sender, l.amount);
            }
        }

        require(totalToTransfer > 0, "Nada desbloqueado");
        require(token.transfer(msg.sender, totalToTransfer), "Fallo el retiro");
    }

    function getLocks(address _beneficiary) external view returns (
        uint256[] memory amounts,
        uint256[] memory unlockTimes,
        bool[] memory statuses
    ) {
        uint256 len = locks[_beneficiary].length;
        amounts = new uint256[](len);
        unlockTimes = new uint256[](len);
        statuses = new bool[](len);

        for (uint i = 0; i < len; i++) {
            Lock storage l = locks[_beneficiary][i];
            amounts[i] = l.amount;
            unlockTimes[i] = l.unlockTimestamp;
            statuses[i] = l.withdrawn;
        }

        return (amounts, unlockTimes, statuses);
    }

    function getTotalLocked(address _beneficiary) external view returns (uint256 total) {
        Lock[] storage userLocks = locks[_beneficiary];
        for (uint i = 0; i < userLocks.length; i++) {
            if (!userLocks[i].withdrawn && block.timestamp < userLocks[i].unlockTimestamp) {
                total += userLocks[i].amount;
            }
        }
    }
}
