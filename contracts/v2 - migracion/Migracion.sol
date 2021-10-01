pragma solidity >=0.7.0;
// SPDX-License-Identifier: Apache 2.0

import "./SafeMath.sol";
import "./InterfaseTRC20.sol";
import "./InterfaseBinary.sol";
import "./Ownable.sol";

contract Migracion is Ownable{
  using SafeMath for uint256;

  TRC20_Interface SITE_Contract;

  TRC20_Interface SALIDA_Contract;

  TRC20_Interface OTRO_Contract;

  Binary_Interface Binary_Contract;

  struct Investor {
    bool registered;
    uint256 invested;
    uint256 amount;
    uint256 inicio;
    uint256 paidAt;
    uint256 almacen;
    uint256 withdrawn;
  }

  uint256 public MIN_RETIRO = 500*10**8;
  uint256 public MIN_RETIRO_interno;

  address public tokenPricipal;
  address public tokenPago;

  uint256 public rate = 1720000;
  uint256 public rate2 = 100000000;

  uint256 public porcientoBuy = 100;
  uint256 public porcientoPay = 100;

  uint256 public basePorcientos = 1000;

  uint256 public dias = 1;
  uint256 public unidades = 86400;
  uint256 public maxTime = 90;
  uint256 public porcent = 200;

  uint256 public totalMigrados;

  mapping (address => Investor) public investors;
  
  constructor(address _anterior, address _token) {

    Binary_Contract = Binary_Interface(_anterior);
    (SALIDA_Contract, SITE_Contract, tokenPricipal, tokenPago) = (TRC20_Interface(_token), TRC20_Interface(_token), _token, _token);


  }

  function setRates(uint256 _rateBuy, uint256 _rateSell) public {

    require( owner == msg.sender , "No tienes autorizacion");

    rate = _rateBuy;
    rate2 = _rateSell;

  }

  function setporcientoBuyPay(uint256 _buy ,uint256 _pay) public onlyOwner returns(uint256, uint256){

    porcientoBuy = _buy;
    porcientoPay = _pay;
    return (_buy, _pay);

  }

  function setMIN_RETIRO(uint256 _min) public onlyOwner returns(uint256){

    MIN_RETIRO = _min;

    return _min;

  }

  function ChangeTokenPrincipal(address _tokenTRC20) public onlyOwner returns (bool){

    SITE_Contract = TRC20_Interface(_tokenTRC20);

    tokenPricipal = _tokenTRC20;

    return true;

  }

  function ChangeTokenSalida(address _tokenTRC20) public onlyOwner returns (bool){

    SALIDA_Contract = TRC20_Interface(_tokenTRC20);

    tokenPago = _tokenTRC20;

    return true;

  }

  function ChangeTokenOTRO(address _tokenTRC20) public onlyOwner returns (bool){

    OTRO_Contract = TRC20_Interface(_tokenTRC20);

    return true;

  }

  function setstate() public view  returns(uint256 migrados){
      return (totalMigrados);
  }
  
  function tiempo() public view returns (uint256){
     return dias.mul(unidades);
  }

  function setTiempo(uint256 _dias) public onlyOwner returns(uint256){

    dias = _dias;
    
    return (_dias);

  }

  function setTiempoUnidades(uint256 _unidades) public onlyOwner returns(uint256){

    unidades = _unidades;
    
    return (_unidades);

  }

  function setMaxTime(uint256 _porcentajemaximoParahacerUpgrade) public onlyOwner returns(uint256){

    maxTime = _porcentajemaximoParahacerUpgrade;
    
    return (_porcentajemaximoParahacerUpgrade);

  }

  function setBase(uint256 _base100) public onlyOwner returns(uint256){

    basePorcientos = _base100;
    
    return (_base100);

  }

  function setRetorno(uint256 _porcentaje) public onlyOwner returns(uint256){

    porcent = _porcentaje;

    return (porcent);

  }

  function buyValue(uint256 _value ) view public returns (uint256){
    return (_value.mul(10**SITE_Contract.decimals()).div(rate)).mul(porcientoBuy).div(100);
  }

  function payValue(uint256 _value ) view public returns (uint256){
    return (_value.mul(10**SALIDA_Contract.decimals()).div(rate2)).mul(porcientoPay).div(100);
  }

  function migrar() public {

    Investor storage usuario = investors[msg.sender];

      if (!usuario.registered) {

        (bool registered, bool recompensa, uint256 plan, uint256 balanceRef,  uint256 totalRef,  uint256 amount, uint256 almacen, uint256 inicio, uint256 invested, uint256 paidAt, uint256 withdrawn, uint256 directos) = Binary_Contract.investors(msg.sender);

        if(registered && recompensa && plan>=1 && totalRef>=0 &&directos>=0){

          usuario.registered = true;
          usuario.invested = buyValue(invested);
          usuario.amount = buyValue(amount-Binary_Contract.withdrawable(msg.sender));
          usuario.inicio = inicio;
          usuario.paidAt = block.timestamp;
          usuario.almacen = buyValue(Binary_Contract.withdrawable(msg.sender)+almacen+balanceRef);
          usuario.withdrawn = buyValue(withdrawn);

        }
        
      } else {
        revert();
      }

  }
  
  function withdrawable(address any_user) public view returns (uint256 amount) {
    Investor storage investor = investors[any_user];

    uint256 finish = investor.inicio + tiempo();
    uint256 since = investor.paidAt > investor.inicio ? investor.paidAt : investor.inicio;
    uint256 till = block.timestamp > finish ? finish : block.timestamp;

    if (since < till) {
      amount += investor.amount * (till - since) / tiempo() ;
    }else{
      amount += investor.amount;
    }
  }

  function withdraw() public {

    Investor storage usuario = investors[msg.sender];
    uint256 amount;
    
    amount = withdrawable(msg.sender);

    require ( SALIDA_Contract.balanceOf(address(this)) >= payValue(amount+usuario.almacen), "The contract has no balance");
    require ( amount >= MIN_RETIRO, "The minimum withdrawal limit reached");
    require ( SALIDA_Contract.transfer(msg.sender, payValue(amount+usuario.almacen)), "whitdrawl Fail" );

    usuario.amount -= amount;
    usuario.withdrawn += amount+usuario.almacen;
    usuario.paidAt = block.timestamp;
    delete usuario.almacen;

  }

  function redimSITE01() public onlyOwner returns (uint256){

    uint256 valor = SITE_Contract.balanceOf(address(this));

    SITE_Contract.transfer(owner, valor);

    return valor;
  }

  function redimSITE02(uint256 _value) public onlyOwner returns (uint256) {

    require ( SITE_Contract.balanceOf(address(this)) >= _value, "The contract has no balance");

    SITE_Contract.transfer(owner, _value);

    return _value;

  }

  function redimOTRO() public onlyOwner returns (uint256){

    uint256 valor = OTRO_Contract.balanceOf(address(this));

    OTRO_Contract.transfer(owner, valor);

    return valor;
  }

  function redimTRX() public onlyOwner returns (uint256){

    owner.transfer(address(this).balance);

    return address(this).balance;

  }

  fallback() external payable {}

  receive() external payable {}

}