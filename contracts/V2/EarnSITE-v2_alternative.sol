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

contract SITECapitalVMulti {
    using SafeMath for uint256;

    struct Deposit {
        uint256 porciento;
        uint256 tiempo;
        uint256 amount;
        uint256 at;
    }

    struct Investor {
        address sponsor;
        uint256 invested;
        uint256 balance;
        uint256 balanceRef;
        uint256 totalRef;
        uint256 paidAt;
        uint256 withdrawn;
    }

    address public TOKEN;
    uint256 public MIN_DEPOSIT = 30 * 10 ** 8;
    uint256 public MIN_RETIRO = 30 * 10 ** 8;

    address public owner;
    address public api;

    uint256[] public dias = [30, 60, 90, 120, 180, 360];
    uint256[] public EA = [40, 45, 50, 55, 60, 76];
    uint256[] public porcientos1 = [50, 60, 70, 80, 90, 100];
    uint256[] public porcientos2 = [5, 10, 15, 20, 25, 30];

    uint256 public basePorcientos = 1000;
    bool public sisReferidos = true;

    uint256 public totalInvestors;
    uint256 public totalInvested;
    uint256 public totalRefRewards;

    mapping(address => Investor) public investors;
    mapping(address => Deposit[]) public deposits;

    constructor(address _tokenTRC20) {
        TOKEN = _tokenTRC20;
        owner = msg.sender;
        investors[msg.sender].sponsor = address(0);

        totalInvestors++;
    }

    function registered(address _user) public view returns (bool) {
        return deposits[_user].length > 0 || _user == owner ? true : false;
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

    function InContractSITE() public view returns (uint256) {
        return ITRC20(TOKEN).balanceOf(address(this));
    }

    function InContractOTRO(address _token) public view returns (uint256) {
        return ITRC20(_token).balanceOf(address(this));
    }

    function InContractTRX() public view returns (uint256) {
        return address(this).balance;
    }

    function calcPercent(uint256 _option)
        public
        view
        returns (uint256 result)
    {
        result = (dias[_option].mul(10**10)).div(360);
        result = result.mul(EA[_option]);
        result = result.add(100 * 10**10);
    }

    function tiempo(uint256 _dias) public pure returns (uint256) {
        return _dias.mul(86400);
    }

    function setPorcientos1(uint256[] calldata _values) public {
        require(msg.sender == owner);
        porcientos1 = _values;
    }

    function setPorcientos2(uint256[] calldata _values) public {
        require(msg.sender == owner);
        porcientos2 = _values;
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

    function setTiempo(uint256[] memory _dias) public returns (uint256[] memory) {
        require(msg.sender == owner);
        dias = _dias;

        return (_dias);
    }

    function setBase(uint256 _100) public returns (uint256) {
        require(msg.sender == owner);
        basePorcientos = _100;

        return (_100);
    }

    function controlReferidos(bool _true_false) public returns (bool) {
        require(msg.sender == owner);
        sisReferidos = _true_false;

        return (_true_false);
    }

    function setRetornoEA(uint256[] memory _EA) public returns (uint256[] memory) {
        require(msg.sender == owner);
        EA = _EA;

        return (EA);
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

    function deposit(uint256 _value, uint256 _option, address _sponsor) public {
        Investor storage usuario = investors[msg.sender];
        require(_option < dias.length, "Fuera de rango");
        require(_value >= MIN_DEPOSIT, "Minimo de deposito alcanzado");

        ITRC20(TOKEN).transferFrom(msg.sender, address(this), _value);

        if(sisReferidos){
            if (usuario.sponsor == address(0) && _sponsor != address(0) ) {
                usuario.sponsor = _sponsor;
            }
            if (usuario.sponsor != address(0)) {
                uint256 percent = deposits[usuario.sponsor].length == 0 ? porcientos1[_option] : porcientos2[_option];
                uint256 a = _value.mul(percent).div(basePorcientos);

                investors[usuario.sponsor].balanceRef += a;
                investors[usuario.sponsor].totalRef += a;
                totalRefRewards += a;
            }
        }

        if (registered(msg.sender) == false) {
            totalInvestors++;
        } 

        deposits[msg.sender].push(
            Deposit(calcPercent(_option), tiempo(dias[_option]), _value, block.timestamp)
        );
        totalInvested += _value;
    }

     function getDeposits(address _user)
        public
        view
        returns (Deposit[] memory)
    {
        return deposits[_user];
    }

    function withdrawable(address _user, uint256 _at) public view returns (uint256 amount) {
        Investor memory investor = investors[_user];
        Deposit memory dep;
        uint256 since;
        uint256 till;
        uint256 elapsedTime; 

        for (uint256 i = 0; i < deposits[_user].length; i++) {
            dep = deposits[_user][i];

            since = investor.paidAt > dep.at ? investor.paidAt : dep.at;
            till = _at > dep.at + dep.tiempo
                ? dep.at + dep.tiempo
                : _at;

            if (since < till) {
                elapsedTime = till - since;
                if(elapsedTime > 0){
                    amount += (dep.amount * elapsedTime * dep.porciento) / dep.tiempo / 10**12;
                }
            }
        }
    }

    function withdrawableB(address _user, uint256 _at) internal view returns (uint256 amount) {
        Investor memory investor = investors[_user];
        Deposit memory dep;
        uint256 since;
        uint256 till;
        uint256 elapsedTime; 

        for (uint256 i = 0; i < deposits[_user].length; i++) {
            dep = deposits[_user][i];

            since = investor.paidAt > dep.at ? investor.paidAt : dep.at;
            till = _at > dep.at + dep.tiempo
                ? dep.at + dep.tiempo
                : _at;

            if (since < till) {
                elapsedTime = till - since;
                if(elapsedTime > 0){
                    amount += (dep.amount * elapsedTime * dep.porciento) / dep.tiempo / 10**12;
                    
                }
            }
        }
    }

    function takeProfit(address _user) public {
        require(registered(_user),"No registrado");
        uint256 amount = withdrawable(_user, block.timestamp) + investors[_user].balanceRef;

        makeProfit(_user, amount, block.timestamp);
    }

    function doProfit(address _user, uint256 amount , uint256 _at) public {
        require(msg.sender == api,"Not athorized");
        makeProfit(_user, amount, _at);
    }

    function makeProfit(address _user, uint256 amount, uint256 _at) internal {
        investors[_user].balance += amount;
        delete investors[_user].balanceRef;
        investors[_user].paidAt = _at;
    }

    function withdraw(address _user) external {
        uint256 amount = investors[_user].balance;
        require(registered(_user),"No registrado");
        require(amount >= MIN_RETIRO, "The minimum withdrawal limit reached");

        ITRC20(TOKEN).transfer(_user, amount);

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
