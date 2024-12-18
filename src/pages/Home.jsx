import React, { Component } from "react";

import utils from "../utils";
import cons from "../cons";
import CopyToClipboard from "react-copy-to-clipboard";

const contractAddress = cons.SC

class Datos extends Component {
    constructor(props) {
      super(props);
  
      this.state = {
        totalInvestors: 0,
        totalInvested: 0,
        totalRefRewards: 0
      };
  
      this.totalInvestors = this.totalInvestors.bind(this);
    }
  
    async componentDidMount() {
      await utils.setContract(window.tronWeb, contractAddress);
      setInterval(() => this.totalInvestors(),1*1000);
    };
  
    async totalInvestors() {
  
      let esto = await utils.contract.setstate().call();
  
      var tronUSDT = await window.tronWeb;
      var contractUSDT = await tronUSDT.contract().at(cons.USDT);
      var decimales = await contractUSDT.decimals().call();
      //console.log(esto);
      this.setState({
        totalInvestors: parseInt(esto.Investors._hex)+31,
        totalInvested: parseInt(esto.Invested._hex)/10**decimales,
        totalRefRewards: parseInt(esto.RefRewards._hex)/10**decimales
  
      });
  
    };
  
    render() {
      const { totalInvestors, totalInvested, totalRefRewards } = this.state;
  
  
      return (
        <div className="row counters">
  
          <div className="col-lg-4 col-12 text-center">
            <span data-toggle="counter-up">{totalInvestors}</span>
            <p>Inversores Globales</p>
          </div>
  
          <div className="col-lg-4 col-12 text-center">
            <span data-toggle="counter-up">{totalInvested.toFixed(2)} SITE</span>
            <p>Invertido en Plataforma</p>
          </div>
  
          <div className="col-lg-4 col-12 text-center">
            <span data-toggle="counter-up">{totalRefRewards.toFixed(2)} SITE</span>
            <p>Total Recompensas por Referidos</p>
          </div>
  
        </div>
      );
    }
  }
  

class Oficina extends Component {
    constructor(props) {
      super(props);
  
      this.state = {
        direccion: "",
        link: "Haz una inversión para obtener el LINK de referido",
        registered: false,
        balanceRef: 0,
        totalRef: 0,
        invested: 0,
        paidAt: 0,
        my: 0,
        withdrawn: 0,
        precioSITE: 0,
        valueSITE: 0,
        valueUSDT: 0
  
      };
  
      this.Investors = this.Investors.bind(this);
      this.Link = this.Link.bind(this);
      this.withdraw = this.withdraw.bind(this);
  
      this.rateSITE = this.rateSITE.bind(this);
    }
  
  
    async componentDidMount() {
      await utils.setContract(window.tronWeb, contractAddress);
      setInterval(() => this.Investors(),1*1000);
      setInterval(() => this.Link(),1*1000);
    };
  
    async rateSITE(){
      var proxyUrl = cons.proxy;
      var apiUrl = cons.PRE;
      var response;
  
      try {
        response = await fetch(proxyUrl+apiUrl);
      } catch (err) {
        console.log(err);
        return this.state.precioSITE;
      }
  
      var json = await response.json();
  
      this.setState({
        precioSITE: json.Data.precio
      });
  
      return json.Data.precio;
  
    };
  
    async Link() {
      const {registered} = this.state;
      if(registered){
  
        let loc = document.location.href;
        if(loc.indexOf('?')>0){
          loc = loc.split('?')[0]
        }
        let mydireccion = await window.tronWeb.trx.getAccount();
        mydireccion = window.tronWeb.address.fromHex(mydireccion.address)
        mydireccion = loc+'?ref='+mydireccion;
        this.setState({
          link: mydireccion,
        });
      }else{
        this.setState({
          link: "Haz una inversión para obtener el LINK de referido",
        });
      }
    }
  
  
    async Investors() {
  
      let direccion = await window.tronWeb.trx.getAccount();
      let esto = await utils.contract.investors(direccion.address).call();
      let My = await utils.contract.MYwithdrawable().call();
      
      var tronUSDT = await window.tronWeb;
      var contractUSDT = await tronUSDT.contract().at(cons.USDT);
      var decimales = await contractUSDT.decimals().call();
  
      var precioSITE = await this.rateSITE();
  
      this.setState({
        direccion: window.tronWeb.address.fromHex(direccion.address),
        registered: esto.registered,
        balanceRef: parseInt(esto.balanceRef._hex)/10**decimales,
        totalRef: parseInt(esto.totalRef._hex)/10**decimales,
        invested: parseInt(esto.invested._hex)/10**decimales,
        paidAt: parseInt(esto.paidAt._hex)/10**decimales,
        my: parseInt(My.amount._hex)/10**decimales,
        withdrawn: parseInt(esto.withdrawn._hex)/10**decimales,
        precioSITE: precioSITE
      });
  
    };
  
    async withdraw(){
      const { balanceRef, my } = this.state;
  
      var available = (balanceRef+my);
      available = available.toFixed(8);
      available = parseFloat(available);
  
      var tronUSDT = await window.tronWeb;
      var contractUSDT = await tronUSDT.contract().at(cons.USDT);
  
      var decimales = await contractUSDT.decimals().call();
  
      var MIN_RETIRO = await utils.contract.MIN_RETIRO().call();
      MIN_RETIRO = parseInt(MIN_RETIRO._hex)/10**decimales;
  
      var MAX_RETIRO = await utils.contract.MAX_RETIRO().call();
      MAX_RETIRO = parseInt(MAX_RETIRO._hex)/10**decimales;
  
  
      if ( available < MAX_RETIRO && available > MIN_RETIRO ){
        await utils.contract.withdraw().send();
      }else{
        if (available > MAX_RETIRO) {
          window.alert("Por favor contacta con el soporte técnico de SITE");
        }
        if (available < MIN_RETIRO) {
          window.alert("El minimo para retirar son: "+(MIN_RETIRO)+" SITE");
        }
      }
    };
  
  
    render() {
      var { balanceRef, totalRef, invested,  withdrawn , my, direccion, link} = this.state;
  
      var available = (balanceRef+my);
      available = available.toFixed(8);
      available = parseFloat(available);
  
      balanceRef = balanceRef.toFixed(8);
      balanceRef = parseFloat(balanceRef);
  
      totalRef = totalRef.toFixed(8);
      totalRef = parseFloat(totalRef);
  
      invested = invested.toFixed(8);
      invested = parseFloat(invested);
  
      withdrawn = withdrawn.toFixed(8);
      withdrawn = parseFloat(withdrawn);
  
      my = my.toFixed(8);
      my = parseFloat(my);
  
      return (
  
        <div className="container">
  
          <header style={{'textAlign': 'center'}} className="section-header">
            <h3 className="white"><i className="fa fa-user mr-2" aria-hidden="true"></i><span style={{'fontWeight': 'bold'}}>
            Mi Oficina:</span> <br></br>
            <span style={{'fontSize': '11px'}}>{direccion}</span></h3><br></br>
            <h3 className="white" style={{'fontWeight': 'bold'}}><i className="fa fa-users mr-2" aria-hidden="true"></i>Link de referido:</h3>
            <h6 className="white" style={{'padding': '1.5em', 'fontSize': '11px'}}><a href={link}>{link}</a> <br /><br />
            <CopyToClipboard text={link}>
              <button type="button" className="btn btn-info">COPIAR</button>
            </CopyToClipboard>
            </h6>
            <hr></hr>
  
          </header>
  
          <div className="row text-center">
  
            <div className="col-md-6 col-lg-5 offset-lg-1 wow bounceInUp" data-wow-duration="1s">
              <div className="box">
                <div className="icon"><i className="ion-ios-analytics-outline" style={{color: '#ff689b'}}></i></div>
                <h4 className="title"><a href="#services">{invested} SITE</a></h4> (${(this.state.invested*this.state.precioSITE).toFixed(2)})
                <p className="description">Total invertido</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-5 wow bounceInUp" data-wow-duration="1s">
              <div className="box">
                <div className="icon"><i className="ion-ios-bookmarks-outline" style={{color: '#e9bf06'}}></i></div>
                <h4 className="title"><a href="#services">{totalRef} SITE</a></h4> (${(this.state.totalRef*this.state.precioSITE).toFixed(2)})
                <p className="description">Total ganancias por referidos</p>
              </div>
            </div>
  
            <div className="col-md-6 col-lg-5 offset-lg-1 wow bounceInUp" data-wow-delay="0.1s" data-wow-duration="1s">
              <div className="box">
                <div className="icon"><i className="ion-ios-paper-outline" style={{color: '#3fcdc7'}}></i></div>
                <p className="description">Mi balance</p>
                <h4 className="title"><a href="#services">{my} SITE</a></h4> (${(this.state.my*this.state.precioSITE).toFixed(2)})
  
              </div>
            </div>
            <div className="col-md-6 col-lg-5 wow bounceInUp" data-wow-delay="0.1s" data-wow-duration="1s">
              <div className="box">
                <div className="icon"><i className="ion-ios-paper-outline" style={{color: '#3fcdc7'}}></i></div>
                <p className="description">Balance por referidos</p>
                <h4 className="title"><a href="#services"> {balanceRef} SITE</a></h4> (${(this.state.balanceRef*this.state.precioSITE).toFixed(2)})
  
              </div>
            </div>
  
            <div className="col-md-6 col-lg-5 offset-lg-1 wow bounceInUp" data-wow-delay="0.1s" data-wow-duration="1s">
              <div className="box">
                <div className="icon"><i className="ion-ios-speedometer-outline" style={{color:'#41cf2e'}}></i></div>
                <h4 className="title"><a href="#services">Disponible</a></h4>
                <p className="description">{available} SITE</p> (${(available*this.state.precioSITE).toFixed(2)})
                <button type="button" className="btn btn-info d-block text-center mx-auto mt-1" onClick={() => this.withdraw()}>Retirar</button>
              </div>
            </div>
            <div className="col-md-6 col-lg-5 wow bounceInUp" data-wow-delay="0.2s" data-wow-duration="1s">
              <div className="box">
                <div className="icon"><i className="ion-ios-clock-outline" style={{color: '#4680ff'}}></i></div>
                <h4 className="title"><a href="#services">Retirado</a></h4>
                <p className="description">{withdrawn} SITE</p> (${(this.state.withdrawn*this.state.precioSITE).toFixed(2)})
              </div>
            </div>
  
          </div>
  
        </div>
  
      );
    }
  }
  

class CrowdFunding extends Component {
    constructor(props) {
      super(props);
  
      this.state = {
  
        min: 100,
        deposito: "Cargando...",
        balance: "Cargando...",
        accountAddress: "Cargando...",
        porcentaje: "Cargando...",
        dias: "Cargando...",
        partner: "Cargando...",
        balanceTRX: "Cargando...",
        balanceUSDT: "Cargando...",
        maxButton:"Cargando...",
        precioSITE: 0
  
      };
  
      this.deposit = this.deposit.bind(this);
      this.estado = this.estado.bind(this);
      this.getMax = this.getMax.bind(this);
  
      this.rateSITE = this.rateSITE.bind(this);
    }
  
    async componentDidMount() {
      await utils.setContract(window.tronWeb, contractAddress);
      await this.estado();
      setInterval(() => this.estado(),3*1000);
      setInterval(() => this.rateSITE(),30*1000);
    };
  
    async rateSITE(){
      var proxyUrl = cons.proxy;
      var apiUrl = cons.PRE;
      var response;
      try {
        response = await fetch(proxyUrl+apiUrl);
      } catch (err) {
        console.log(err);
        return this.state.precioSITE;
      }
      
      const json = await response.json();
  
      this.setState({
        precioSITE:json.Data.precio
      })
  
      return json.Data.precio;
  
    };
  
    async estado(){
  
      var accountAddress =  window.tronWeb.defaultAddress.base58;
  
      var inicio = accountAddress.substr(0,4);
      var fin = accountAddress.substr(-4);
  
      var texto = inicio+"..."+fin;
  
      document.getElementById("contract").innerHTML = '<a href="https://tronscan.org/#/contract/'+contractAddress+'/code">Contrato V 1.0</a>';
  
      //document.getElementById("login").innerHTML = '<a href="https://tronscan.io/#/address/'+accountAddress+'" class="logibtn gradient-btn">'+texto+'</a>';
      document.getElementById("login").href = `https://tronscan.io/#/address/${accountAddress}`;
      document.getElementById("login-my-wallet").innerHTML = texto;
  
      var contractSITE = await window.tronWeb.contract().at(cons.USDT);
  
      var aprovado = await contractSITE.allowance(accountAddress,contractAddress).call();
  
      if (aprovado.remainig) {
        aprovado = parseInt(aprovado.remainig._hex);
      }else{
        aprovado = parseInt(aprovado._hex);
      }
      
  
      if (aprovado > 0) {
        aprovado = "Depositar";
      }else{
        document.getElementById("amount").value = "";
        aprovado = "Registrar";
      }
  
      var decimales = await contractSITE.decimals().call();
  
      var balance = await contractSITE.balanceOf(accountAddress).call();
      balance = parseInt(balance._hex)/10**decimales;
  
      var MIN_DEPOSIT = await utils.contract.MIN_DEPOSIT().call();
      MIN_DEPOSIT = parseInt(MIN_DEPOSIT._hex)/10**decimales;
  
      var MAX_DEPOSIT = await utils.contract.MAX_DEPOSIT().call();
      MAX_DEPOSIT = parseInt(MAX_DEPOSIT._hex)/10**decimales;
  
      var partner = cons.WS;
  
      var inversors = await utils.contract.investors(accountAddress).call();
  
      if ( inversors.registered ) {
        partner = window.tronWeb.address.fromHex(inversors.sponsor);
      }else{
  
        var loc = document.location.href;
        if(loc.indexOf('?')>0){
            var getString = loc.split('?')[1];
            var GET = getString.split('&');
            var get = {};
            for(var i = 0, l = GET.length; i < l; i++){
                var tmp = GET[i].split('=');
                get[tmp[0]] = unescape(decodeURI(tmp[1]));
            }
  
            if (get['ref']) {
              tmp = get['ref'].split('#');
  
              inversors = await utils.contract.investors(tmp[0]).call();
  
              if ( inversors.registered ) {
                partner = tmp[0];
              }
            }
        }
  
      }
  
      if(partner === "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb"){
        partner = "---------------------------------";
      }
      
  
      var dias = 185;//await utils.contract.tiempo().call();
  
      //var velocidad = await utils.contract.velocidad().call();
  
      //dias = (parseInt(dias)/86400)*velocidad;
  
      var porcentaje = 155;//await utils.contract.porcent().call();
  
      porcentaje = parseInt(porcentaje);
  
      var balancesite = await contractSITE.balanceOf(accountAddress).call();
      balancesite = parseInt(balancesite._hex);
  
      var balanceTRX = await window.tronWeb.trx.getBalance();
      balanceTRX = balanceTRX/10**6;
  
      var contractUSDT = await window.tronWeb.contract().at("TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t");
  
      var balanceUSDT = await contractUSDT.balanceOf(accountAddress).call();
  
      balanceUSDT = parseInt(balanceUSDT)/10**6;
  
  
      this.setState({
        deposito: aprovado,
        balance: balance,
        decimales: decimales,
        accountAddress: accountAddress,
        porcentaje: porcentaje,
        dias: dias,
        min: MIN_DEPOSIT,
        max: MAX_DEPOSIT,
        partner: partner,
        balanceSite: balancesite,
        balanceTRX: balanceTRX,
        balanceUSDT: balanceUSDT,
        maxAlcanzado: parseInt(inversors.invested)/10**decimales <= MAX_DEPOSIT,
        maxButton:"Max"
      });
    }
  
  
    async deposit() {
  
      const {  deposito, decimales, balanceSite, balanceTRX, maxAlcanzado } = this.state;
  
      var { min, max } = this.state
  
      min = min*10**decimales;
      max = max*10**decimales;
  
      var amount = document.getElementById("amount").value;
  
      amount = parseFloat(amount);
      amount = parseInt(amount*10**decimales);
  
      //console.log(amount);
  
      //console.log(isNaN(amount));
  
      var accountAddress =  await window.tronWeb.trx.getAccount();
    
      accountAddress = window.tronWeb.address.fromHex(accountAddress.address);
  
      var tronUSDT = await window.tronWeb;
      var contractUSDT = await tronUSDT.contract().at(cons.USDT);
  
      if (deposito === "Registrar" && balanceTRX >= 50){
        document.getElementById("amount").value = "";
        await contractUSDT.approve(contractAddress, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send();
      }else{
        var aprovado = await contractUSDT.allowance(accountAddress, contractAddress).call();
        aprovado = parseInt(aprovado._hex);
      }
  
      if ( aprovado >= amount && 
        aprovado > 0 && 
        balanceSite >= amount && 
        amount >= min && 
        amount <= max && 
        balanceTRX >= 50 && 
        deposito !== "Registrar" &&
        maxAlcanzado
        ){
  
  
          
          var loc = document.location.href;
          var sponsor = cons.WS;
  
          var investors = await utils.contract.investors(accountAddress).call();
  
          if (investors.registered) {
  
            sponsor = investors.sponsor;
  
          }else{
  
            if(loc.indexOf('?')>0){
              
              var getString = loc.split('?')[1];
              var GET = getString.split('&');
              var get = {};
              for(var i = 0, l = GET.length; i < l; i++){
                  var tmp = GET[i].split('=');
                  get[tmp[0]] = unescape(decodeURI(tmp[1]));
              }
  
              if (get['ref']) {
                tmp = get['ref'].split('#');
  
                var inversors = await utils.contract.investors(tmp[0]).call();
  
                console.log(inversors);
  
                if ( inversors.registered ) {
                  sponsor = tmp[0];
                }
              }
  
            }
            
          }
  
      
          if ( amount >= min ){
  
            await utils.contract.deposit(amount, sponsor).send();
  
            document.getElementById("amount").value = "";
  
            window.alert("Felicidades inversión exitosa");
  
            document.getElementById("services").scrollIntoView({block: "end", behavior: "smooth"});;
  
          }
  
  
      }else{
  
        
        if ( amount < min ) {
          document.getElementById("amount").value = min/10**decimales;
          window.alert("coloca una cantidad mayor que "+(min/10**decimales)+" SITE");
        }
  
        if ( amount > max ) {
          document.getElementById("amount").value = "";
          window.alert("coloca una cantidad menor que "+(max/10**decimales)+" SITE");
        }
  
        if ( balanceSite < amount ) {
          document.getElementById("amount").value = "";
          window.alert("No tienes suficiente SITE");
        }
  
        if (!maxAlcanzado) {
          document.getElementById("amount").value = "";
          window.alert("Limite de deposito máximo alcanzado");
        }
  
        if (balanceTRX < 50) {
          await window.alert("Su cuenta debe tener almenos 150 TRX para ejecutar las transacciones correctamente");
    
        }
  
        
      }
  
  
    };
  
    getMax() {
      document.getElementById("amount").value = this.state.balance;
    }
  
    render() {
  
      var min = this.state.min;
  
      min = "Minimo. "+min+" SITE";
  
  
  
      return (
        <div className="card wow bounceInUp text-center">
          <div className="card-body">
            <h5 className="card-title" id="contract" >Contrato V 1.0</h5>
  
            <table className="table borderless">
              <tbody>
              <tr>
                <td><i className="fa fa-check-circle-o text-success"></i>TASA E.A</td><td>{((((this.state.porcentaje)-100)*365)/(this.state.dias)).toFixed(2)}%</td>
              </tr>
              <tr>
                <td><i className="fa fa-check-circle-o text-success"></i>RETORNO TOTAL</td><td>{this.state.porcentaje}%</td>
              </tr>
              <tr>
                <td><i className="fa fa-check-circle-o text-success"></i>RECOMPENSA</td><td>{(this.state.porcentaje)-100}%</td>
              </tr>
              <tr>
                <td><i className="fa fa-check-circle-o text-success"></i>Tiempo en días</td><td>{this.state.dias}</td>
              </tr>
              </tbody>
            </table>
  
            <div className="form-group">Wallet
            <p className="card-text">
              <strong>{this.state.accountAddress}</strong><br />
            </p>
            <p className="card-text ">
          
              SITE: <strong>{this.state.balance}</strong> (${(this.state.balance*this.state.precioSITE).toFixed(2)})<br />
              TRX: <strong>{(this.state.balanceTRX*1).toFixed(6)}</strong><br />
              USDT: <strong>{(this.state.balanceUSDT*1).toFixed(6)}</strong><br />
            </p>
  
            <div className="input-group mb-3">
              <input id="amount" type="number" className="form-control mb-20 text-center" placeholder={min}></input>
              <div className="input-group-append">
                <button className="btn btn-outline-secondary" type="button" onClick={this.getMax}>{this.state.maxButton}</button>
              </div>
            </div>
  
              <p className="card-text">Recomendamos tener más de 150 TRX para ejecutar las transacciones correctamente</p>
              <p className="card-text">Partner:<br />
              <strong>{this.state.partner}</strong></p>
  
              <button className="btn btn-lg btn-success" onClick={() => this.deposit()}>{this.state.deposito}</button>
  
            </div>
  
          </div>
        </div>
  
  
      );
    }
  }
  

export default class Home extends Component {
  
  render() {

      return (
        <>    
          <section id="why-us" className="wow fadeIn mt-5">
            <div className="container">
              <header className="section-header">
                  <h3>Haz tu inversión</h3>
              </header>
              <div  className="row row-eq-height justify-content-center">
                <CrowdFunding />
              </div>
              <div >
                <Datos />
              </div>
            </div>
          </section>

          <section id="services" className="section-bg">
            <Oficina />
          </section>
          
        </>
      );
  }
}