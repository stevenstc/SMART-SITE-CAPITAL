pragma solidity >=0.8.20;
// SPDX-License-Identifier: Apache-2.0

library SafeMath {
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b);

        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b > 0);
        uint256 c = a / b;

        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a);
        uint256 c = a - b;

        return c;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a);

        return c;
    }
}

interface ITRC20 {
    function allowance(
        address _owner,
        address _spender
    ) external view returns (uint256 remaining);
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) external returns (bool);
    function transfer(
        address direccion,
        uint256 cantidad
    ) external returns (bool);
    function balanceOf(address who) external view returns (uint256);
    function decimals() external view returns (uint);
}

contract SITECapital {
    using SafeMath for uint256;

    struct Deposit {
        uint256 porciento;
        uint256 tiempo;
        uint256 amount;
        uint256 at;
    }

    struct Investor {
        bool registered;
        address sponsor;
        uint256 balanceRef;
        uint256 totalRef;
        uint256 invested;
        uint256 paidAt;
        uint256 withdrawn;
    }

    address public TOKEN;
    uint256 public MIN_DEPOSIT = 30 * 10 ** 8;
    uint256 public MIN_RETIRO = 20 * 10 ** 8;

    address public owner;

    uint256[] public primervez = [10];
    uint256[] public porcientos = [3];

    uint256 public basePorcientos = 100;
    bool public sisReferidos = false;

    uint256 public dias = 180;
    uint256 public porcent = 130;

    uint256 public totalInvestors;
    uint256 public totalInvested;
    uint256 public totalRefRewards;

    mapping(address => Investor) public investors;
    mapping(address => Deposit[]) public deposits;

    constructor(address _tokenTRC20) {
        TOKEN = _tokenTRC20;
        owner = msg.sender;
        investors[msg.sender].registered = true;
        investors[msg.sender].sponsor = address(0);

        totalInvestors++;
    }

    function ChangeTokenUSDT(address _tokenTRC20) public returns (bool) {
        require(msg.sender == owner);
        TOKEN = _tokenTRC20;

        return true;
    }

    function setstate()
        public
        view
        returns (uint256 Investors, uint256 Invested, uint256 RefRewards)
    {
        return (totalInvestors, totalInvested, totalRefRewards);
    }

    function InContractSITE() public view returns (uint) {
        return ITRC20(TOKEN).balanceOf(address(this));
    }

    function InContractOTRO(address _token) public view returns (uint) {
        return ITRC20(_token).balanceOf(address(this));
    }

    function InContractTRX() public view returns (uint) {
        return address(this).balance;
    }

    function tiempo() public view returns (uint) {
        return dias.mul(86400);
    }

    function setPorcientos(uint256[] calldata _values) public {
        require(msg.sender == owner);
        porcientos = _values;
    }

    function setPrimeravezPorcientos(uint256[] calldata _values) public {
        require(msg.sender == owner);
        primervez = _values;
    }

    function setMinimoMaximos(
        uint256 _MIN_DEPOSIT,
        uint256 _MIN_RETIRO
    ) public {
        require(msg.sender == owner);

        if (_MIN_DEPOSIT != 0) {
            MIN_DEPOSIT = _MIN_DEPOSIT;
        }
        if (_MIN_RETIRO != 0) {
            MIN_RETIRO = _MIN_RETIRO;
        }
    }

    function setTiempo(uint256 _dias) public returns (uint) {
        require(msg.sender == owner);
        dias = _dias;

        return (_dias);
    }

    function setBase(uint256 _100) public returns (uint) {
        require(msg.sender == owner);
        basePorcientos = _100;

        return (_100);
    }

    function controlReferidos(bool _true_false) public returns (bool) {
        require(msg.sender == owner);
        sisReferidos = _true_false;

        return (_true_false);
    }

    function setRetorno(uint256 _porcentaje) public returns (uint) {
        require(msg.sender == owner);
        porcent = _porcentaje;

        return (porcent);
    }

    function column(
        address _from,
        uint256 _lengt
    ) public view returns (address[] memory res) {
        res = new address[](_lengt);
        for (uint256 index = 0; index < _lengt; index++) {
            if (investors[_from].sponsor == address(0)) break;
            res[index] = investors[_from].sponsor;
            _from = investors[_from].sponsor;
        }

        return res;
    }

    function rewardReferers(
        address from,
        uint256 amount,
        uint256[] memory array
    ) internal {
        address[] memory referi = column(from, array.length);
        uint256 a;

        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] == 0 || referi[i] == address(0)) break;
            a = amount.mul(array[i]).div(basePorcientos);

            investors[referi[i]].balanceRef += a;
            investors[referi[i]].totalRef += a;
            totalRefRewards += a;
        }
    }

    function deposit(uint256 _value, address _sponsor) public {
        Investor storage usuario = investors[msg.sender];
        require(_value >= MIN_DEPOSIT, "Minimo de deposito alcanzado");

        ITRC20(TOKEN).transferFrom(msg.sender, address(this), _value);

        if (!usuario.registered) {
            usuario.registered = true;
            if (_sponsor != address(0) && sisReferidos) {
                usuario.sponsor = _sponsor;
                rewardReferers(msg.sender, _value, primervez);
            }

            totalInvestors++;
        } else {
            if (usuario.sponsor != address(0) && sisReferidos) {
                rewardReferers(msg.sender, _value, porcientos);
            }
        }

        deposits[msg.sender].push(
            Deposit(porcent, tiempo(), _value, block.timestamp)
        );

        usuario.invested += _value;
        totalInvested += _value;
    }

    function withdrawable(address _user) public view returns (uint256 amount) {
        Investor memory investor = investors[_user];
        Deposit memory dep;
        uint256 since;
        uint256 till;

        for (uint256 i = 0; i < deposits[_user].length; i++) {
            dep = deposits[_user][i];

            since = investor.paidAt > dep.at ? investor.paidAt : dep.at;
            till = block.timestamp > dep.at + dep.tiempo
                ? dep.at + dep.tiempo
                : block.timestamp;

            if (since < till) {
                amount +=
                    (dep.amount * (till - since) * dep.porciento) /
                    dep.tiempo /
                    100;
            }
        }
    }

    function withdraw(address _user) external {
        uint256 amount = withdrawable(_user) + investors[_user].balanceRef;
        require(amount >= MIN_RETIRO, "The minimum withdrawal limit reached");

        ITRC20(TOKEN).transfer(_user, amount);

        delete investors[_user].balanceRef;
        investors[_user].paidAt = block.timestamp;
        investors[_user].withdrawn += amount;
    }

    function redimSITE01() public {
        require(msg.sender == owner);

        ITRC20(TOKEN).transfer(owner, ITRC20(TOKEN).balanceOf(address(this)));
    }

    function redimSITE02(uint256 _value) public returns (uint256) {
        require(msg.sender == owner, "only owner");

        ITRC20(TOKEN).transfer(owner, _value);

        return _value;
    }

    function redimOTRO01(address _token) public {
        require(msg.sender == owner);

        ITRC20(_token).transfer(owner, ITRC20(_token).balanceOf(address(this)));
    }

    function redimOTRO02(
        uint256 _value,
        address _token
    ) public returns (uint256) {
        require(msg.sender == owner, "only owner");

        ITRC20(_token).transfer(owner, _value);

        return _value;
    }

    fallback() external payable {}
    receive() external payable {}
}
