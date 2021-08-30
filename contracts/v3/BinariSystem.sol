pragma solidity >=0.7.0;
// SPDX-License-Identifier: Apache 2.0

import "./SafeMath.sol";
import "./InterfaseTRC20.sol";
import "./Ownable.sol";

contract BinarySystem is Ownable{
  using SafeMath for uint256;

  address token = 0x23A8737B395f5822617a606088fa605b33802782;

  TRC20_Interface USDT_Contract = TRC20_Interface(token);

  TRC20_Interface SALIDA_Contract = TRC20_Interface(token);

  TRC20_Interface OTRO_Contract = TRC20_Interface(token);

  struct Hand {
    uint256 lReclamados;
    uint256 lLost;
    uint256 lExtra;
    address lReferer;
    uint256 rReclamados;
    uint256 rLost;
    uint256 rExtra;
    address rReferer;
  }

  struct Investor {
    bool registered;
    bool recompensa;
    bool pasivo;
    uint256 plan;
    uint256 balanceRef;
    uint256 totalRef;
    uint256 amount;
    uint256 almacen;
    uint256 inicio;
    uint256 invested;
    uint256 paidAt;
    uint256 withdrawn;
    uint256 directos;
    Hand hands;
  }

  uint256 public MIN_RETIRO = 500*10**8;
  uint256 public MIN_RETIRO_interno;

  address public tokenPricipal = token;
  address public tokenPago = token;

  uint256 public rate = 1*10**8;
  uint256 public rate2 = 1*10**8;

  uint256 public porcientoBuy = 100;
  uint256 public porcientoPay = 100;

  uint256[] public primervez = [100, 0, 0, 0, 0];
  uint256[] public porcientos = [0, 0, 0, 0, 0];
  uint256[] public plans = [0, 50*10**8, 100*10**8, 200*10**8, 500*10**8, 1000*10**8, 2000*10**8, 5000*10**8, 10000*10**8, 20000*10**8, 50000*10**8, 100000*10**8, 200000*10**8, 500000*10**8, 1000000*10**8, 2000000*10**8];
  bool[] public active = [false, false, false, false, false, true, true, true, true, true, true, true, true, true, false, false];

  uint256 public basePorcientos = 1000;

  bool public sisReferidos = true;
  bool public sisBinario = true;

  uint256 public dias = 365;
  uint256 public unidades = 86400;

  uint256 public maxTime = 100;
  uint256 public porcent = 200;

  uint256 public porcentPuntosBinario = 10;

  uint256 public descuento = 100;
  uint256 public personas = 2;

  uint256 public precioRegistro = 50 * 10**8;

  uint256 public totalInvestors = 1;
  uint256 public totalInvested;
  uint256 public totalRefRewards;

  mapping (address => Investor) public investors;
  mapping (address => address) public padre;
  mapping (uint256 => address) public idToAddress;
  mapping (address => uint256) public addressToId;
  
  uint256 public lastUserId = 2;
  address public api;

  address public wallet1;
  address public wallet2;
  address public wallet3;

  bool public transfer1;
  bool public transfer2;
  bool public transfer3;

  constructor() {

    Investor storage usuario = investors[owner];
    (api, wallet1, wallet2, wallet3) = (owner, owner, owner, owner);

    ( usuario.registered, usuario.recompensa ) = (true,true);

    idToAddress[1] = msg.sender;
    addressToId[msg.sender] = 1;

  }

  function setRates(uint256 _rateBuy, uint256 _rateSell) public {

    require( owner == msg.sender || api == msg.sender, "No tienes autorizacion");

    rate = _rateBuy;
    rate2 = _rateSell;

  }

  function rateSell() public view returns(uint256){

    if ( rate != rate2 ) {
      return rate2;
    } else {
      return rate;
    }

  }

  function setWalletApi(address _wallet) public onlyOwner returns(address){

    api = _wallet;

    return _wallet;

  }

  function setDescuentoPorNoTrabajo(uint256 _porcentajePago, uint256 _personasBinario) public onlyOwner returns(uint256, uint256){

    descuento = _porcentajePago;
    personas = _personasBinario;

    return (porcent.mul(_porcentajePago).div(100), _personasBinario);

  }

  function setWalletstransfers(address _wallet1, address _wallet2, address _wallet3) public onlyOwner returns(address, address, address){

    if (_wallet1 == address(0)) {
      delete wallet1;
      delete transfer1;
    } else {
      wallet1 = _wallet1;
      transfer1 = true;
    }
    if (_wallet2 == address(0)) {
      delete wallet2;
      delete transfer2;
    } else {
      wallet2 = _wallet2;
      transfer2 = true;
    }
    if (_wallet3 == address(0)) {
      delete wallet3;
      delete transfer3;
    } else {
      wallet3 = _wallet3;
      transfer3 = true;
    }
    return (_wallet1, _wallet2, _wallet3);

  }

  function setporcientoBuyPay(uint256 _buy ,uint256 _pay) public onlyOwner returns(uint256, uint256){

    porcientoBuy = _buy;
    porcientoPay = _pay;
    return (_buy, _pay);

  }

  function setPuntosPorcentajeBinario(uint256 _porcentaje) public onlyOwner returns(uint256){

    porcentPuntosBinario = _porcentaje;

    return _porcentaje;
  }

  function setMIN_RETIRO(uint256 _min) public onlyOwner returns(uint256){

    MIN_RETIRO = _min;

    return _min;

  }

  function ChangeTokenPrincipal(address _tokenTRC20) public onlyOwner returns (bool){

    USDT_Contract = TRC20_Interface(_tokenTRC20);

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

  function setstate() public view  returns(uint256 Investors,uint256 Invested,uint256 RefRewards){
      return (totalInvestors, totalInvested, totalRefRewards);
  }
  
  function tiempo() public view returns (uint256){
     return dias.mul(unidades);
  }

  function setPorcientos(uint256 _nivel, uint256 _value) public onlyOwner returns(uint256[] memory){

    porcientos[_nivel] = _value;

    return porcientos;

  }

  function setPrimeravezPorcientos(uint256 _nivel, uint256 _value) public onlyOwner returns(uint256[] memory){

    primervez[_nivel] = _value;

    return primervez;

  }

  function plansLength() public view returns(uint8){
    
    return uint8(plans.length);
  }

  function setPlans(uint256 _level,uint256 _value) public onlyOwner returns(uint256, uint256){
    plans[_level] = _value * 10**8;
    return (_level, _value);
  }

  function addPlan(uint256 _value) public onlyOwner returns(uint256[] memory){
    plans.push(_value);
    active.push(true);
    return plans;
  }

  function setPlansAll(uint256[] memory _values) public onlyOwner returns(uint256[] memory){
    plans = _values ;
    return plans;
  }

  function setActive(uint256 _level, bool _value) public onlyOwner returns(uint256, bool){
    active[_level] = _value;
    return (_level, _value);
  }

  function setActiveAll(bool[] memory _values) public onlyOwner returns(bool[] memory){
    active = _values ;
    return active;
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

  function controlReferidos(bool _true_false) public onlyOwner returns(bool){

    sisReferidos = _true_false;
    
    return (_true_false);

  }

  function controlBinario(bool _true_false) public onlyOwner returns(bool){

    sisBinario = _true_false;
    
    return (_true_false);

  }

  function setRetorno(uint256 _porcentaje) public onlyOwner returns(uint256){

    porcent = _porcentaje;

    return (porcent);

  }

  function column(address yo, uint256 _largo) public view returns(address[] memory) {

    address[] memory res;
    for (uint256 i = 0; i < _largo; i++) {
      res = actualizarNetwork(res);
      res[i] = padre[yo];
      yo = padre[yo];
    }
    
    return res;
  }

  function handLeft(address _user) public view returns(uint256 extra, uint256 lost, uint256 reclamados, address referer) {

    Investor storage usuario = investors[_user];
    Hand storage hands = usuario.hands;

    return (hands.lExtra, hands.lLost, hands.lReclamados, hands.lReferer);
  }

  function handRigth(address _user) public view returns(uint256 extra, uint256 lost, uint256 reclamados, address referer) {

    Investor storage usuario = investors[_user];
    Hand storage hands = usuario.hands;

    return (hands.rExtra, hands.rLost, hands.rReclamados, hands.rReferer);
  }

  function rewardReferers(address yo, uint256 amount, uint256[] memory array) internal {

    address[] memory referi;
    referi = column(yo, array.length);
    uint256 a;

    for (uint256 i = 0; i < array.length; i++) {

      Investor storage usuario = investors[referi[i]];
      if (usuario.registered && array[i] != 0 && usuario.recompensa){
        if ( referi[i] != address(0) ) {

          a = amount.mul(array[i]).div(basePorcientos);

          if (usuario.amount >= a) {

            usuario.amount -= a;
            usuario.balanceRef += a;
            usuario.totalRef += a;
            totalRefRewards += a;
            
          }else{

            delete usuario.amount;
            usuario.balanceRef += usuario.amount;
            usuario.totalRef += usuario.amount;
            totalRefRewards += usuario.amount;
            
          }

        }else{
          break;
        }
      }
    }
  }

  function buyValue(uint256 _value ) view public returns (uint256){
    return (_value.mul(10**USDT_Contract.decimals()).div(rate)).mul(porcientoBuy).div(100);
  }

  function payValue(uint256 _value ) view public returns (uint256){
    return (_value.mul(10**SALIDA_Contract.decimals()).div(rateSell())).mul(porcientoPay).div(100);
  }

  function asignarPuntosBinarios(address _user ,uint256 _puntosLeft, uint256 _puntosRigth) public onlyOwner returns (bool){

    Investor storage usuario = investors[_user];

    usuario.hands.lExtra += _puntosLeft;
    usuario.hands.rExtra += _puntosRigth;

    return true;
    

  }

  function asignarPlan(address _user ,uint256 _plan, address _sponsor, uint256 _hand) public onlyOwner returns (bool){
    require( _hand <= 1, "mano incorrecta");
    require(_plan <= plans.length && _plan > 0, "plan incorrecto");
    require(active[_plan], "plan desactivado");

    Investor storage usuario = investors[_user];

    uint256 _value = plans[_plan];

    usuario.inicio = block.timestamp;
    usuario.invested += _value;
    usuario.amount += _value.mul(porcent.div(100));
    usuario.plan = _value;
    usuario.pasivo = true;
    
    if (!usuario.registered){

      (usuario.registered, usuario.recompensa) = (true, true);
      padre[_user] = _sponsor;

      if (_sponsor != address(0) && sisBinario ){
        Investor storage sponsor = investors[_sponsor];
        sponsor.directos++;
        if ( _hand == 0 ) {
            
          if (sponsor.hands.lReferer == address(0) ) {

            sponsor.hands.lReferer = _user;
            
          } else {

            address[] memory network;

            network = actualizarNetwork(network);

            network[0] = sponsor.hands.lReferer;

            sponsor = investors[insertionLeft(network)];
            sponsor.hands.lReferer = _user;
            
            
          }
        }else{

          if ( sponsor.hands.rReferer == address(0) ) {

            sponsor.hands.rReferer = _user;
            
          } else {

            address[] memory network;

            network = actualizarNetwork(network);

            network[0] = sponsor.hands.rReferer;

            sponsor = investors[insertionRigth(network)];
            sponsor.hands.rReferer = _user;
            
          
        }
        
      }

      if (padre[_user] != address(0) && sisReferidos ){
        rewardReferers(_user, _value, primervez);
      }
      
      totalInvestors++;

      idToAddress[lastUserId] = _user;
      addressToId[_user] = lastUserId;
      
      lastUserId++;

    }else{

      if (padre[_user] != address(0) && sisReferidos ){
        rewardReferers(_user, _value, porcientos);
      }
    }

    totalInvested += _value;

    }

    return true;
  }

  function registro(address _sponsor, uint8 _hand) public{

    require( _hand <= 1, "mano incorrecta");
    
    Investor storage usuario = investors[msg.sender];

    require(!usuario.registered, "ya estas registrado");

    require( USDT_Contract.allowance(msg.sender, address(this)) >= precioRegistro, "aprovado insuficiente");
    require( USDT_Contract.transferFrom(msg.sender, address(this), precioRegistro), "saldo insuficiente" );
    if (transfer3){
      USDT_Contract.transfer(wallet3, precioRegistro);
    }
        (usuario.registered, usuario.recompensa) = (true, true);
        padre[msg.sender] = _sponsor;

        if (_sponsor != address(0) && sisBinario ){
          Investor storage sponsor = investors[_sponsor];
          sponsor.directos++;
          if ( _hand == 0 ) {
              
            if (sponsor.hands.lReferer == address(0) ) {

              sponsor.hands.lReferer = msg.sender;
              
            } else {

              address[] memory network;

              network = actualizarNetwork(network);
              network[0] = sponsor.hands.lReferer;
              sponsor = investors[insertionLeft(network)];
              sponsor.hands.lReferer = msg.sender;
              
            }
          }else{

            if ( sponsor.hands.rReferer == address(0) ) {

              sponsor.hands.rReferer = msg.sender;
              
            } else {

              address[] memory network;
              network = actualizarNetwork(network);
              network[0] = sponsor.hands.rReferer;

              sponsor = investors[insertionRigth(network)];
              sponsor.hands.rReferer = msg.sender;
              
            
            }
          }
          
        }
        
        totalInvestors++;

        idToAddress[lastUserId] = msg.sender;
        addressToId[msg.sender] = lastUserId;
        
        lastUserId++;


  }

  function buyPlan(uint256 _plan) public {

    require(_plan <= plans.length && _plan > 0, "plan incorrecto");
    require(active[_plan], "plan desactivado");

    Investor storage usuario = investors[msg.sender];

    if ( usuario.registered) {

      uint256 _value = plans[_plan];

      require( USDT_Contract.allowance(msg.sender, address(this)) >= buyValue(_value), "aprovado insuficiente");
      require( USDT_Contract.transferFrom(msg.sender, address(this), buyValue(_value)), "saldo insuficiente" );
      
      if (padre[msg.sender] != address(0) && sisReferidos ){
        if (usuario.plan == 0 ){
          
          rewardReferers(msg.sender, _value, primervez);
          
        }else{
          rewardReferers(msg.sender, _value, porcientos);
          
        }
      }

      usuario.inicio = block.timestamp;
      usuario.invested += _value;
      usuario.amount += _value.mul(porcent.div(100));
      if ( block.timestamp >= usuario.inicio.add(tiempo().mul(maxTime).div(100)) ) {
        usuario.plan = _value;
      } else {
        usuario.plan += _value;
      }
      
      usuario.pasivo = true;

      totalInvested += _value;

      if (transfer1) {
        USDT_Contract.transfer(wallet1, buyValue(_value).mul(10).div(100));
      } 
      if (transfer2) {
        USDT_Contract.transfer(wallet2, buyValue(_value).mul(7).div(100));
      } 
      if (transfer3) {
        USDT_Contract.transfer(wallet3, buyValue(_value).mul(10).div(100));
      } 
      
    } else {
      revert();
    }
    
  }
  
  function upGradePlan(uint256 _plan) public {

    Investor storage usuario = investors[msg.sender];

    if( usuario.inicio != 0 && usuario.inicio.add(tiempo().mul(maxTime).div(100)) >= block.timestamp){
      
      require (plans[_plan] > usuario.plan, "tiene que ser un plan mayor para hacer upgrade");
      require(active[_plan], "plan desactivado");

      uint256 _value = plans[_plan].sub(usuario.plan);

      require( USDT_Contract.allowance(msg.sender, address(this)) >= buyValue(_value), "aprovado insuficiente");
      require( USDT_Contract.transferFrom(msg.sender, address(this), buyValue(_value)), "saldo insuficiente" );
      
      usuario.inicio = block.timestamp;

      usuario.plan = plans[_plan];
      usuario.amount += _value.mul(porcent.div(100));
      usuario.invested += _value;

      if (padre[msg.sender] != address(0) && sisReferidos ){
        rewardReferers(msg.sender, _value, porcientos);
      }

      totalInvested += _value;

      if (transfer1) {
        USDT_Contract.transfer(wallet1, buyValue(_value).mul(10).div(100));
      } 
      if (transfer2) {
        USDT_Contract.transfer(wallet2, buyValue(_value).mul(7).div(100));
      } 
      if (transfer3) {
        USDT_Contract.transfer(wallet3, buyValue(_value).mul(10).div(100));
      } 
      
    }else{
      revert();
    }
    
  }
  
  function withdrawableBinary(address any_user) public view returns (uint256 left, uint256 rigth, uint256 amount) {
    Investor storage user = investors[any_user];
      
    if ( user.hands.lReferer != address(0)) {
        
      address[] memory network;

      network = actualizarNetwork(network);

      network[0] = user.hands.lReferer;

      network = allnetwork(network);
      
      for (uint i = 0; i < network.length; i++) {
      
        user = investors[network[i]];
        left += user.invested;
      }
        
    }
    user = investors[any_user];

    left += user.hands.lExtra;
    left -= user.hands.lReclamados.add(user.hands.lLost);
      
    if ( user.hands.rReferer != address(0)) {
        
        address[] memory network;

        network = actualizarNetwork(network);

        network[0] = user.hands.rReferer;

        network = allnetwork(network);
        
        for (uint i = 0; i < network.length; i++) {
        
          user = investors[network[i]];
          rigth += user.invested;
        }
        
    }

    user = investors[any_user];

    rigth += user.hands.rExtra;
    rigth -= user.hands.rReclamados.add(user.hands.rLost);

    if (left < rigth) {
      if (left.mul(porcentPuntosBinario).div(100) <= user.amount ) {
        amount = left.mul(porcentPuntosBinario).div(100) ;
          
      }else{
        amount = user.amount;
          
      }
      
    }else{
      if (rigth.mul(porcentPuntosBinario).div(100) <= user.amount ) {
        amount = rigth.mul(porcentPuntosBinario).div(100) ;
          
      }else{
        amount = user.amount;
          
      }
    }
  
  }


  function personasBinary(address any_user) public view returns (uint256 left, uint256 pLeft, uint256 rigth, uint256 pRigth) {
    Investor storage referer = investors[any_user];

    if ( referer.hands.lReferer != address(0)) {

      address[] memory network;

      network = actualizarNetwork(network);

      network[0] = referer.hands.lReferer;

      network = allnetwork(network);

      for (uint i = 0; i < network.length; i++) {
        
        referer = investors[network[i]];
        left += referer.invested;
        pLeft++;
      }
        
    }

    referer = investors[any_user];
    
    if ( referer.hands.rReferer != address(0)) {
        
      address[] memory network;

      network = actualizarNetwork(network);

      network[0] = referer.hands.rReferer;

      network = allnetwork(network);
      
      for (uint b = 0; b < network.length; b++) {
        
        referer = investors[network[b]];
        rigth += referer.invested;
        pRigth++;
      }
    }

  }

  function actualizarNetwork(address[] memory oldNetwork)public pure returns ( address[] memory) {
    address[] memory newNetwork =   new address[](oldNetwork.length+1);

    for(uint i = 0; i < oldNetwork.length; i++){
        newNetwork[i] = oldNetwork[i];
    }
    
    return newNetwork;
  }

  function allnetwork( address[] memory network ) public view returns ( address[] memory) {

    for (uint i = 0; i < network.length; i++) {

      Investor storage user = investors[network[i]];
      
      address userLeft = user.hands.lReferer;
      address userRigth = user.hands.rReferer;

      for (uint u = 0; u < network.length; u++) {
        if (userLeft == network[u]){
          userLeft = address(0);
        }
        if (userRigth == network[u]){
          userRigth = address(0);
        }
      }

      if( userLeft != address(0) ){
        network = actualizarNetwork(network);
        network[network.length-1] = userLeft;
      }

      if( userRigth != address(0) ){
        network = actualizarNetwork(network);
        network[network.length-1] = userRigth;
      }

    }

    return network;
  }

  function insertionLeft(address[] memory network) public view returns ( address wallet) {

    for (uint i = 0; i < network.length; i++) {

      Investor storage user = investors[network[i]];
      
      address userLeft = user.hands.lReferer;

      if( userLeft == address(0) ){
        return  network[i];
      }

      network = actualizarNetwork(network);
      network[network.length-1] = userLeft;

    }
    insertionLeft(network);
  }

  function insertionRigth(address[] memory network) public view returns (address wallet) {

    for (uint i = 0; i < network.length; i++) {
      Investor storage user = investors[network[i]];

      address userRigth = user.hands.rReferer;

      if( userRigth == address(0) ){
        return network[i];
      }

      network = actualizarNetwork(network);
      network[network.length-1] = userRigth;

    }
    insertionRigth(network);
  }

  function withdrawable(address any_user) public view returns (uint256 amount) {
    Investor storage investor2 = investors[any_user];

    if (investor2.pasivo) {
  
      uint256 finish = investor2.inicio + tiempo();
      uint256 since = investor2.paidAt > investor2.inicio ? investor2.paidAt : investor2.inicio;
      uint256 till = block.timestamp > finish ? finish : block.timestamp;

      if (since < till) {
        amount += investor2.amount * (till - since) / tiempo() ;
      }else{
        amount += investor2.amount;
      }
    }
  }

  function profit(address any_user) public view returns (uint256, uint256, uint256, uint) {
    Investor storage investor2 = investors[any_user];

    uint256 amount;
    uint256 binary;
    uint256 saldo = investor2.amount;
    uint256 balanceRef = investor2.balanceRef;
    
    uint256 left;
    uint256 rigth;

    uint gana;
    
    (left, rigth, binary) = withdrawableBinary(any_user);

    if (left != 0 && rigth != 0 && binary != 0 && investor2.directos >= 2){

      if (saldo >= binary) {
        saldo -= binary;
        amount += binary;
      }else{
        delete saldo;
        amount += saldo;
      }
    
      if (investor2.inicio.add(tiempo()) >= block.timestamp){
      
        gana = 1;
        
      }else{
        gana = 2;
      }
    }

    if (saldo >= withdrawable(any_user)) {
      saldo -= withdrawable(any_user);
      amount += withdrawable(any_user);
    }else{
      delete saldo;
      amount += saldo;
    }

    amount += balanceRef;
    amount += investor2.almacen; 

    return (amount, left, rigth, gana);

  }

  function withdrawToDeposit() public {

    Investor storage usuario = investors[msg.sender];
    uint256 amount;
    uint256 left;
    uint256 rigth;
    uint gana;
    
    (amount, left, rigth, gana) = profit(msg.sender);

    if (gana == 1) {

      if(left < rigth){
        usuario.hands.lReclamados += left;
        usuario.hands.rReclamados += left;
          
      }else{
        usuario.hands.lReclamados += rigth;
        usuario.hands.rReclamados += rigth;
          
      }
      
    } 

    if (gana == 2) {

      if(left < rigth){
        usuario.hands.lLost += left;
        usuario.hands.rLost += left;
          
      }else{
        usuario.hands.lLost += rigth;
        usuario.hands.rLost += rigth;
          
      }
      
    }

    usuario.amount -= amount.sub(usuario.balanceRef+usuario.almacen);
    usuario.almacen = amount;
    usuario.paidAt = block.timestamp;
    delete usuario.balanceRef;

  }

  function withdraw() public {

    Investor storage usuario = investors[msg.sender];
    uint256 amount;
    uint256 left;
    uint256 rigth;
    uint gana;
    
    (amount, left, rigth, gana) = profit(msg.sender);

    require ( SALIDA_Contract.balanceOf(address(this)) >= payValue(amount), "The contract has no balance");
    require ( amount >= MIN_RETIRO, "The minimum withdrawal limit reached");
    if( usuario.directos >= personas ){
      SALIDA_Contract.transfer(msg.sender, payValue(amount));
    }else{
      SALIDA_Contract.transfer(msg.sender, payValue(amount).mul(descuento).div(100));
    }
    

    if (gana == 1) {

      if(left < rigth){
        usuario.hands.lReclamados += left;
        usuario.hands.rReclamados += left;
          
      }else{
        usuario.hands.lReclamados += rigth;
        usuario.hands.rReclamados += rigth;
          
      }
      
    } 

    if (gana == 2) {

      if(left < rigth){
        usuario.hands.lLost += left;
        usuario.hands.rLost += left;
          
      }else{
        usuario.hands.lLost += rigth;
        usuario.hands.rLost += rigth;
          
      }
      
    }

    usuario.amount -= amount.sub(usuario.balanceRef+usuario.almacen);
    usuario.withdrawn += amount;
    usuario.paidAt = block.timestamp;
    delete usuario.balanceRef;
    delete usuario.almacen;

  }

  function redimSITE01() public onlyOwner returns (uint256){

    uint256 valor = USDT_Contract.balanceOf(address(this));

    USDT_Contract.transfer(owner, valor);

    return valor;
  }

  function redimSITE02(uint256 _value) public onlyOwner returns (uint256) {

    require ( USDT_Contract.balanceOf(address(this)) >= _value, "The contract has no balance");

    USDT_Contract.transfer(owner, _value);

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