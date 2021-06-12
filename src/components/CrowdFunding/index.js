import React, { Component } from "react";
import Utils from "../../utils";
import contractAddress from "../Contract";

import cons from "../../cons.js";

export default class CrowdFunding extends Component {
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
      maxButton:"Cargando..."

    };

    this.deposit = this.deposit.bind(this);
    this.estado = this.estado.bind(this);
    this.getMax = this.getMax.bind(this);
  }

  async componentDidMount() {
    await Utils.setContract(window.tronWeb, contractAddress);
    this.estado();
    setInterval(() => this.estado(),3*1000);
  };

  async estado(){

    var accountAddress =  await window.tronWeb.trx.getAccount();
    accountAddress = window.tronWeb.address.fromHex(accountAddress.address);

    var inicio = accountAddress.substr(0,4);
    var fin = accountAddress.substr(-4);

    var texto = inicio+"..."+fin;

    document.getElementById("contract").innerHTML = '<a href="https://tronscan.org/#/contract/'+contractAddress+'/code">Ver Contrato</a>';

    //document.getElementById("login").innerHTML = '<a href="https://tronscan.io/#/address/'+accountAddress+'" class="logibtn gradient-btn">'+texto+'</a>';
    document.getElementById("login").href = `https://tronscan.io/#/address/${accountAddress}`;
    document.getElementById("login-my-wallet").innerHTML = texto;


    var tronUSDT = await window.tronWeb;
    var contractUSDT = await tronUSDT.contract().at(cons.USDT);

    var aprovado = await contractUSDT.allowance(accountAddress,contractAddress).call();
    aprovado = parseInt(aprovado._hex);

    if (aprovado > 0) {
      aprovado = "Depositar";
    }else{
      document.getElementById("amount").value = "";
      aprovado = "Registrar";
    }

    var decimales = await contractUSDT.decimals().call();

    var balance = await contractUSDT.balanceOf(accountAddress).call();
    balance = parseInt(balance._hex)/10**decimales;

    var MIN_DEPOSIT = await Utils.contract.MIN_DEPOSIT().call();
    MIN_DEPOSIT = parseInt(MIN_DEPOSIT._hex)/10**decimales;

    var MAX_DEPOSIT = await Utils.contract.MAX_DEPOSIT().call();
    MAX_DEPOSIT = parseInt(MAX_DEPOSIT._hex)/10**decimales;

    var partner = cons.WS;

    var inversors = await Utils.contract.investors(accountAddress).call();

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

            inversors = await Utils.contract.investors(tmp[0]).call();

            if ( inversors.registered ) {
              partner = tmp[0];
            }else{
              partner = cons.WS;
            }
          }else{
            partner = cons.WS;
          }
      }

    }

    if(partner === "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb"){
      partner = "---------------------------------";
    }
    

    var dias = await Utils.contract.tiempo().call();

    var velocidad = await Utils.contract.velocidad().call();

    dias = (parseInt(dias)/86400)*velocidad;

    var porcentaje = await Utils.contract.porcent().call();

    porcentaje = parseInt(porcentaje);

    var balancesite = await contractUSDT.balanceOf(accountAddress).call();
    balancesite = parseInt(balancesite._hex);

    var balanceTRX = await window.tronWeb.trx.getBalance();
    balanceTRX = balanceTRX/10**6;

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

    console.log(amount);

    console.log(isNaN(amount));

    var accountAddress =  await window.tronWeb.trx.getAccount();
  
    accountAddress = window.tronWeb.address.fromHex(accountAddress.address);

    var tronUSDT = await window.tronWeb;
    var contractUSDT = await tronUSDT.contract().at(cons.USDT);

    if (deposito === "Registrar" && balanceTRX >= 50){
      document.getElementById("amount").value = "";
      await contractUSDT.approve(contractAddress, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send();
    }else{
      var aprovado = await contractUSDT.allowance(accountAddress,contractAddress).call();
      aprovado = parseInt(aprovado._hex);
    }

    if (balanceTRX < 50) {
      await window.alert("Por favor recarge su cuenta con almenos 150 TRX para ejecutar las transacciones correctamente");

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

              var inversors = await Utils.contract.investors(tmp[0]).call();

              console.log(inversors);

              if ( inversors.registered ) {
                document.getElementById('sponsor').value = tmp[0];
              }else{
                document.getElementById('sponsor').value = cons.WS;
              }
            }else{
               document.getElementById('sponsor').value = cons.WS;
            }

        }else{

            document.getElementById('sponsor').value = cons.WS;
        }

        var sponsor = document.getElementById("sponsor").value;

        var investors = await Utils.contract.investors(accountAddress).call();

        if (investors.registered) {

          sponsor = investors.sponsor;

        }


        if ( amount >= min ){

          document.getElementById("amount").value = "";

          await Utils.contract.deposit(amount,sponsor).send();

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
          <h5 className="card-title">Contrato V 1.0</h5>

          <table className="table borderless">
            <tbody>
            <tr>
              <td><i className="fa fa-check-circle-o text-success"></i>TASA E.A</td><td>60%</td>
            </tr>
            <tr>
              <td><i className="fa fa-check-circle-o text-success"></i>RETORNO TOTAL</td><td>115%</td>
            </tr>
            <tr>
              <td><i className="fa fa-check-circle-o text-success"></i>RECOMPENSA</td><td>15%</td>
            </tr>
            <tr>
              <td><i className="fa fa-check-circle-o text-success"></i>Tiempo en días</td><td>90</td>
            </tr>
            </tbody>
          </table>

          <h6 className="card-text d-none">
            Retorno: <strong>{this.state.porcentaje}%</strong><br />
            Tiempo: <strong>{this.state.dias} días</strong><br />
          </h6>

          <div className="form-group">Wallet
          <p className="card-text">
            <strong>{this.state.accountAddress}</strong><br />
          </p>
          <p className="card-text">
            SITE disponible: <strong>{this.state.balance}</strong><br />
            TRX: <strong>{this.state.balanceTRX}</strong><br />
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

            <div className="btn btn-lg btn-success" onClick={() => this.deposit()}>{this.state.deposito}</div>

          </div>

        </div>
      </div>


    );
  }
}
