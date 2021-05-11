import React, { Component } from "react";
import Utils from "../../utils";
import contractAddress from "../Contract";

import cons from "../../cons.js";

export default class EarnTron extends Component {
  constructor(props) {
    super(props);

    this.state = {

      min: 10

    };

    this.deposit = this.deposit.bind(this);
    this.estado = this.estado.bind(this);
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

    document.getElementById("login").innerHTML = '<a href="https://tronscan.io/#/address/'+accountAddress+'" class="logibtn gradient-btn">'+texto+'</a>';

  }


  async deposit() {


    const { min } = this.state;

    var amount = document.getElementById("amount").value;
    amount = parseFloat(amount);
    amount = parseInt(amount*1000000);

    var accountAddress =  await window.tronWeb.trx.getAccount();
    accountAddress = window.tronWeb.address.fromHex(accountAddress.address);

    var tronUSDT = await window.tronWeb;
    var contractUSDT = await tronUSDT.contract().at(cons.USDT);

    await contractUSDT.approve(contractAddress, amount).send();

    var aprovado = await contractUSDT.allowance(accountAddress,contractAddress).call();
    aprovado = parseInt(aprovado.remaining._hex);

    console.log( aprovado);

    if ( aprovado >= amount ){

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


        if ( amount >= min){

          document.getElementById("amount").value = "";

          await Utils.contract.deposit(amount,sponsor).send();

        }else{
          window.alert("Please enter an amount greater than 10 USDT");
          document.getElementById("amount").value = 10;
        }



    }else{

      if (amount > 10 && aprovado > 10) {

        if ( amount > aprovado) {
          if (aprovado <= 0) {
            document.getElementById("amount").value = 10;
            window.alert("You do not have enough funds in your account you place at least 10 USDT");
          }else{
            document.getElementById("amount").value = 10;
            window.alert("You must leave 50 TRX free in your account to make the transaction");
          }



        }else{

          document.getElementById("amount").value = amount;
          window.alert("You must leave 50 TRX free in your account to make the transaction");

        }
      }else{
        window.alert("You do not have enough funds in your account you place at least 250 TRX");
      }
    }


  };


  render() {

    var min = this.state.min;

    min = "Minimo. "+min+" SITE";

    return (


        <div>
          <h6 className="text-center">
            Retorno: <strong>115%</strong><br />
            Tiempo: <strong>90 dias</strong><br />
          </h6>

          <div className="form-group text-center">
            <input type="number" className="form-control mb-20 text-center" id="amount" placeholder={min}></input>
            <p className="card-text">Debes de tener ~ 50 TRX para hacer la transacción</p>

            <a href="#amount" className="gradient-btn v2" onClick={() => this.deposit()}>Depositar</a>




          </div>

        </div>


    );
  }
}
