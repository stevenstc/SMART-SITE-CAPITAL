pragma solidity >=0.8.0;
//SPDX-License-Identifier: Apache-2.0

library SafeMath {

  function mul(uint256 a, uint256 b) internal pure returns (uint) {
    if (a == 0) {return 0;}
    uint256 c = a * b;
    require(c / a == b);

    return c;
  }

  function div(uint256 a, uint256 b) internal pure returns (uint) {
    require(b > 0);
    uint256 c = a / b;

    return c;
  }

  function sub(uint256 a, uint256 b) internal pure returns (uint) {
    require(b <= a);
    uint256 c = a - b;

    return c;
  }

  function add(uint256 a, uint256 b) internal pure returns (uint) {
    uint256 c = a + b;
    require(c >= a);

    return c;
  }

}

interface TRC20_Interface {
  function allowance(address _owner, address _spender) external view returns (uint256 remaining);
  function transferFrom(address _from, address _to, uint256 _value) external returns (bool);
  function transfer(address direccion, uint256 cantidad) external returns (bool);
  function balanceOf(address who) external view returns (uint256);
  function decimals() external view returns(uint256 );
}

contract StakingSite {
  using SafeMath for uint256;

  TRC20_Interface USDT_Contract;
  TRC20_Interface OTRO_Contract;

  struct Deposit {
    uint256 porciento;
    uint256 tiempo;
    uint256 amount;
    uint256 at;
  }

  struct Investor {
    bool registered;
    bool recompensa;
    address sponsor;
    uint256 balanceRef;
    uint256 totalRef;
    uint256 invested;
    uint256 paidAt;
    uint256 withdrawn;
  }

  mapping (address => Investor) public investors;
  mapping (address => Deposit[]) public deposits;

  mapping (address => address) public referer;

  uint256 public MIN_DEPOSIT = 1 * 10**8;
  uint256 public MIN_RETIRO = 10 * 10**8;

  address public owner;

  uint256[] public primervez = [30, 10, 0, 0, 0];
  uint256[] public porcientos = [5, 3, 0, 0, 0];

  uint256 public basePorcientos = 1000;
  bool public sisReferidos = true;

  uint256 public dias = 90;
  uint256 public porcent = 115;

  uint256 public totalInvestors;
  uint256 public totalInvested;
  uint256 public totalRefRewards;

  constructor(address _tokenTRC20) {
    USDT_Contract = TRC20_Interface(_tokenTRC20);
    owner = msg.sender;
    investors[msg.sender].registered = true;
    investors[msg.sender].recompensa = true;
    investors[msg.sender].sponsor = address(0);

    totalInvestors++;

  }

  function setstate() public view  returns(uint256 Investors,uint256 Invested,uint256 RefRewards){
    return (totalInvestors, totalInvested, totalRefRewards);
  }

  function InContractSITE() public view returns (uint){
    return USDT_Contract.balanceOf(address(this));
  }

  function InContractOTRO() public view returns (uint){
    return OTRO_Contract.balanceOf(address(this));
  }

  function InContractTRX() public view returns (uint){
    return address(this).balance;
  }
  
  function tiempo() public view returns (uint){
    return dias.mul(86400);
  }

  function deposit(uint256 _value, address _sponsor) public {

    Investor storage usuario = investors[msg.sender];

    require(_value >= MIN_DEPOSIT, "Minimo de deposito alcanzado");
    require( USDT_Contract.transferFrom(msg.sender, address(this), _value), "saldo insuficiente" );

    if (!usuario.registered){

      usuario.registered = true;
      usuario.recompensa = true;
      usuario.sponsor = _sponsor;
      if (_sponsor != address(0) && sisReferidos ){
        reward(msg.sender, _value, primervez);
      }
      
      totalInvestors++;

    }else{

      if (usuario.sponsor != address(0) && sisReferidos ){
        reward(msg.sender, _value, porcientos);
      }

    }

    deposits[msg.sender].push(Deposit(porcent, tiempo(), _value, block.timestamp));

    usuario.invested += _value;
    totalInvested += _value;

  }

  function column (address base, uint256 _length) public view returns(address[] memory res) {

    for (uint256 index = 0; index < _length; index++) {
      res[index] = referer[base];
      base = referer[base];
    }

    return res;
  }

  function reward(address yo, uint256 amount, uint256[] memory porcentaje) internal {

    address[] memory referi = column(yo, porcentaje.length);
    uint[] memory a;
    uint[] memory b;

    for (uint256 i = 0; i < porcentaje.length; i++) {

      Investor storage usuario = investors[referi[i]];
      if (usuario.registered && primervez[i] != 0 && usuario.recompensa){
        if ( referi[i] != address(0) ) {

          b[i] = primervez[i];
          a[i] = amount.mul(b[i]).div(porcentaje[i]);

          usuario.balanceRef += a[i];
          usuario.totalRef += a[i];
          totalRefRewards += a[i];

        }else{

          break;
        }
      }
    }

  }

  function withdrawable(address _user) public view returns (uint256 amount) {
    
    if(deposits[_user].length > 0){
      Investor storage investor = investors[_user];
      Deposit storage dep;
      uint256 since;
      uint256 till;
      
      for (uint256 i = 0; i < deposits[_user].length; i++) {
        dep = deposits[_user][i];

        since = investor.paidAt > dep.at ? investor.paidAt : dep.at;
        till = block.timestamp > dep.at + dep.tiempo ? dep.at + dep.tiempo : block.timestamp;

        if (since < till) {
          amount += dep.amount * (till - since) * dep.porciento / dep.tiempo / 100;
        }
      }

    }

  }

  function withdraw(address _user) public {

    Investor storage usuario = investors[_user];

    uint256 amount = withdrawable(_user);
    amount = amount+usuario.balanceRef;

    require ( amount >= MIN_RETIRO, "The minimum withdrawal limit reached");

    require ( USDT_Contract.transfer(_user,amount), "whitdrawl Fail" );

    amount += usuario.balanceRef;
    usuario.balanceRef = 0;

    usuario.paidAt = block.timestamp;
    usuario.withdrawn += amount;

  }

  function setPorcientos(uint256 _id, uint256 _value) public returns(uint256[] memory){
    require( msg.sender == owner );
    porcientos[_id] = _value;

    return porcientos;

  }

  function setPrimeravezPorcientos(uint256 _id, uint256 _value) public returns(uint256[] memory){
    require( msg.sender == owner );
    primervez[_id] = _value;

    return primervez;

  }

  function setMinimoMaximos(uint256 _MIN_DEPOSIT, uint256 _MIN_RETIRO) public returns(bool){

    require( msg.sender == owner );

    if (_MIN_DEPOSIT != 0){
      MIN_DEPOSIT = _MIN_DEPOSIT;
    }
    if (_MIN_RETIRO != 0){
      MIN_RETIRO = _MIN_RETIRO;
    }

    return true;

  }

  function setTiempo(uint256 _dias) public returns(uint){

    require( msg.sender == owner );
    dias = _dias;
    
    return (_dias);

  }

  function setBase(uint256 _100) public returns(uint){

    require( msg.sender == owner );
    basePorcientos = _100;
    
    return (_100);

  }

  function controlReferidos(bool _true_false) public returns(bool){

    require( msg.sender == owner );
    sisReferidos = _true_false;
    
    return (_true_false);

  }

  function setRetorno(uint256 _porcentaje) public returns(uint){

    require( msg.sender == owner );
    porcent = _porcentaje;

    return (porcent);

  }

  function redimSITE01() public returns (uint256){
    require(msg.sender == owner);
    uint256 valor = USDT_Contract.balanceOf(address(this));
    USDT_Contract.transfer(owner, valor);

    return valor;
  }

  function redimSITE02(uint256 _value) public returns (uint256) {
    require ( msg.sender == owner, "only owner");
    USDT_Contract.transfer(owner, _value);

    return _value;

  }

  function redimOTRO01() public returns (uint256){
    require(msg.sender == owner);
    uint256 valor = OTRO_Contract.balanceOf(address(this));
    OTRO_Contract.transfer(owner, valor);

    return valor;
  }

  function redimOTRO02(uint256 _value) public returns (uint256){
    require ( msg.sender == owner, "only owner");
    OTRO_Contract.transfer(owner, _value);

    return _value;

  }

   function ChangeTokenUSDT(address _tokenTRC20) public returns (bool){
    require( msg.sender == owner );
    USDT_Contract = TRC20_Interface(_tokenTRC20);

    return true;

  }

  function ChangeTokenOTRO(address _tokenTRC20) public returns (bool){
    require( msg.sender == owner );
    OTRO_Contract = TRC20_Interface(_tokenTRC20);

    return true;

  }

  fallback() external payable {}
  receive() external payable {}

}