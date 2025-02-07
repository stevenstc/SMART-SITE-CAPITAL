import React, { Component } from "react";

import CopyToClipboard from "react-copy-to-clipboard";

const BigNumber = require('bignumber.js');

let intervalId = null;
let nextUpdate = 0;

const imageSITE = "./img/logo-site.png";
const imageUSDT = "./img/logo-usdt.png";
const imageCOPT = "./img/logo-copt.png";

const minTRX = 60;


class Calculadora extends Component {
  constructor(props) {
    super(props);

    this.state = {
      CoptUsdt: 0.000260630465095065,
      monedaIn: "SITE",
      monedaOut: "USDT",
      valueIn: "1",
      precioOut: 0,
      imageIn: imageSITE,
      imageOut: imageUSDT,
      listaIn: <>
        <option value="SITE">SITE</option>
        <option value="USDT">USDT</option>
        <option value="COPT">COPT</option>
      </>,
      listaOut: <>
        <option value="USDT">USDT</option>
        <option value="SITE">SITE</option>
        <option value="COPT">COPT</option>
      </>,

    };

    this.handleChangeIN = this.handleChangeIN.bind(this);
    this.handleChangeOUT = this.handleChangeOUT.bind(this);
    this.calculo = this.calculo.bind(this);
    this.change = this.change.bind(this);
  }


  handleChangeIN(event) {
    var image = imageSITE;
    var image2 = imageUSDT;
    var moneda2 = "USDT";
    switch (event.target.value) {

      case "COPT":
        image = imageCOPT;
        image2 = imageSITE;
        moneda2 = "SITE";
        break;

      case "USDT":
        image = imageUSDT;
        image2 = imageSITE;
        moneda2 = "SITE";
        break;

      default:
        image = imageSITE;
        image2 = imageUSDT;
        moneda2 = "USDT";
        break;
    }
    document.getElementById("selIN").value = event.target.value;
    document.getElementById("selOUT").value = moneda2;
    this.setState({
      monedaIn: event.target.value,
      imageIn: image,
      monedaOut: moneda2,
      imageOut: image2
    });
  }

  handleChangeOUT(event) {
    var image = imageUSDT;
    var image2 = imageSITE;
    var moneda2 = "SITE";
    switch (event.target.value) {

      case "COPT":
        image = imageCOPT;
        image2 = imageSITE;
        moneda2 = "SITE";
        break;

      case "SITE":
        image = imageSITE;
        image2 = imageUSDT;
        moneda2 = "USDT";
        break;

      default:
        image = imageUSDT;
        image2 = imageSITE;
        moneda2 = "SITE";
        break;
    }
    document.getElementById("selIN").value = moneda2;
    document.getElementById("selOUT").value = event.target.value;
    this.setState({
      monedaOut: event.target.value,
      imageOut: image,
      monedaIn: moneda2,
      imageIn: image2
    });
  }

  change() {
    var moneda = this.state.monedaIn;
    var imagen = this.state.imageIn;
    document.getElementById("selIN").value = this.state.monedaOut;
    document.getElementById("selOUT").value = moneda;
    this.setState({
      monedaIn: this.state.monedaOut,
      imageIn: this.state.imageOut,
      monedaOut: moneda,
      imageOut: imagen
    });
  }

  async calculo() {
    const { precioSITE, CoptUsdt } = this.props
    let { valueIn } = this.state

    valueIn = document.getElementById("amountSITE").value;
    valueIn = parseFloat(valueIn.replace(/,/g, "."))
    if (isNaN(valueIn) || valueIn < 0) valueIn = 1

    this.setState({ valueIn })

    let par = this.state.monedaIn + "_" + this.state.monedaOut;

    let precio = 0;
    switch (par) {

      case "SITE_USDT":
        precio = valueIn * precioSITE;
        break;

      case "USDT_SITE":
        precio = valueIn / precioSITE;
        break;

      case "SITE_COPT":
        precio = valueIn * precioSITE;
        precio = precio / CoptUsdt;
        break;

      case "COPT_SITE":
        precio = valueIn * CoptUsdt;
        precio = precio / precioSITE;
        break;

      case "COPT_USDT":
        precio = valueIn * CoptUsdt;
        break;

      case "USDT_COPT":
        precio = valueIn / CoptUsdt;
        break;

      default:
        break;
    }

    this.setState({
      precioOut: precio
    });
  }

  async componentDidMount() {

    this.calculo()

    setInterval(() => {
      this.calculo()

    }, 120 * 1000)

  };

  render() {

    return (

      <section id="calculator" className="section-bg pt-5 pb-5">

        <div className="container">

          <div className="row text-center">

            <div className="col-sm-6 col-md-10 offset-md-1 wow bounceInUp" data-wow-duration="1s">
              <div className="box">

                <div onClick={() => this.change()} style={{ "cursor": "pointer" }}><img src={this.state.imageIn} alt="usdt logo trx" width="50" /> <button className="btn btn-info"><i className="fa fa-exchange" aria-hidden="true"></i></button> <img src={this.state.imageOut} alt="usdt logo trx" width="50" /></div>
                <input id="amountSITE" type="number" className="form-control mb-20 mt-3 text-center" onInput={() => this.calculo()} placeholder="Ingresa una cantidad"></input>

              </div>
            </div>

          </div>

          <div className="row text-center mt-4">

            <div className="col-sm-6 col-md-5  offset-md-1 wow bounceInUp" data-wow-duration="1s">
              <div className="box">

                <img src={this.state.imageIn} alt="usdt logo trx" width="50" />

                <div className="input-group-append">
                  <select id="selIN" className="form-control mb-20 text-center" onInput={this.handleChangeIN} style={{ "cursor": "pointer" }}>
                    {this.state.listaIn}
                  </select>

                </div>


              </div>
            </div>

            <div className="col-sm-6 col-md-5  wow bounceInUp" data-wow-duration="1s">
              <div className="box">
                <div width="50" heigth="50"><img src={this.state.imageOut} alt="usdt logo trx" width="50" /></div>
                <select id="selOUT" className="form-control mb-20 text-center" onChange={this.handleChangeOUT} style={{ "cursor": "pointer" }}>
                  {this.state.listaOut}
                </select>

              </div>
            </div>

          </div>

          <div className="row text-center">
            <div className="col-sm-6 col-md-10  offset-md-1 wow bounceInUp" data-wow-duration="1s">
              <div className="box">

                <h4 className="title">
                  <br />{(this.state.valueIn * 1).toFixed(6)} <b>{this.state.monedaIn}</b> = {(this.state.precioOut).toFixed(6)} <b>{this.state.monedaOut}</b>
                </h4>
              </div>
            </div>

          </div>

        </div>
      </section>

    );
  }
}


export default class Home extends Component {

  constructor(props) {
    super(props);

    this.state = {

      totalInvestors: 0,
      totalInvested: 0,
      totalRefRewards: 0,

      min: 30,
      deposito: "Cargando...",
      balance: "Cargando...",
      wallet: "Cargando...",
      porcentaje: 100,
      dias: 30,
      partner: "Cargando...",
      balanceTRX: "Cargando...",
      balanceUSDT: new BigNumber(0),
      precioSITE: 0,
      opcion: 0,

      link: "Haz una inversión para obtener el LINK de referido",
      registered: false,
      balanceRef: 0,
      totalRef: 0,
      invested: 0,
      paidAt: 0,
      my: 0,
      withdrawn: 0,
      valueSITE: 0,
      valueUSDT: 0,


    };

    this.deposit = this.deposit.bind(this);
    this.estado = this.estado.bind(this);
    this.getMax = this.getMax.bind(this);

    this.rateSITE = this.rateSITE.bind(this);

    this.Investors = this.Investors.bind(this);
    this.Link = this.Link.bind(this);
    this.withdraw = this.withdraw.bind(this);

  }


  async componentDidMount() {

    intervalId = setInterval(() => {

      if (Date.now() >= nextUpdate) {

        if (!this.props.tronlik.loggedIn) {
          nextUpdate = Date.now() + 3 * 1000;
        } else {
          nextUpdate = Date.now() + 20 * 1000;
        }

        if (this.props.tronlik.loggedIn) {
          this.estado();

        }
      }

      this.Investors();


    }, 3 * 1000);
  };

  componentWillUnmount() {
    clearInterval(intervalId);
  }

  async estado() {

    const { contract, token, tokenUSDT, wallet, tronWeb } = this.props

    let precioSITE = await this.rateSITE()

    document.getElementById("p1").innerHTML = "$ " + precioSITE.dp(2).toString(10);

    this.setState({
      precioSITE
    })

    let texto = wallet;
    texto = texto.substr(0, 4) + "..." + texto.substr(-4);

    document.getElementById("login").href = `https://tronscan.io/#/address/${wallet}`;
    document.getElementById("login-my-wallet").innerHTML = texto;

    let aprovado = await token.allowance(wallet, contract.address).call();
    if (aprovado.remainig) {
      aprovado = parseInt(aprovado.remainig._hex);
    } else {
      aprovado = parseInt(aprovado._hex);
    }

    let inversors = await contract.investors(wallet).call();
    let registered = await contract.registered(wallet).call();
    let partner = tronWeb.address.fromHex(inversors.sponsor);

    if (aprovado > 0) {
      if (registered) {
        aprovado = "Depositar";

      } else {
        aprovado = "Primer Depósito";

      }

    } else {
      aprovado = "Aprobar Gasto de Token";
    }

    let decimales = parseInt(await token.decimals().call());

    let balance = await token.balanceOf(wallet).call();
    balance = new BigNumber(parseInt(balance._hex)).shiftedBy(-decimales);

    let MIN_DEPOSIT = await contract.MIN_DEPOSIT().call();
    MIN_DEPOSIT = new BigNumber(parseInt(MIN_DEPOSIT._hex)).shiftedBy(-decimales);

    if (!registered) {

      var loc = document.location.href;
      if (loc.indexOf('?') > 0) {
        var getString = loc.split('?')[1];
        var GET = getString.split('&');
        var get = {};
        for (var i = 0, l = GET.length; i < l; i++) {
          var tmp = GET[i].split('=');
          get[tmp[0]] = unescape(decodeURI(tmp[1]));
        }

        if (get['ref']) {
          tmp = get['ref'].split('#');

          let inversor = await contract.registered(tmp[0]).call();

          if (inversor) {
            partner = tmp[0];
          } else {
            partner = tronWeb.address.fromHex(await contract.owner().call());
          }
        }
      }

    }

    if (partner === "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb") {
      partner = "---------------------------------";
    }

    let opcion = document.getElementById("days").value;
    this.setState({opcion})
    
    let dias = await contract.dias(opcion).call();
    dias = parseInt(dias._hex)

    let porcentaje = await contract.calcPercent(opcion).call();
    porcentaje = new BigNumber(parseInt(porcentaje.result._hex)).shiftedBy(-10).dp(2).toNumber();

    let balancesite = await token.balanceOf(wallet).call();
    balancesite = new BigNumber(parseInt(balancesite._hex)).shiftedBy(-decimales);

    var balanceTRX = await tronWeb.trx.getBalance(wallet);
    balanceTRX = new BigNumber(balanceTRX).shiftedBy(-6);


    this.setState({
      registered,
      deposito: aprovado,
      balance: balance.toNumber(),
      decimales,
      wallet,
      porcentaje: porcentaje,
      dias: dias,
      min: MIN_DEPOSIT.toNumber(),
      partner: partner,
      balanceSite: balancesite.toNumber(),
      balanceTRX: balanceTRX,
    });


    let decimalsUSDT = await tokenUSDT.decimals().call()

    let balanceUSDT = await tokenUSDT.balanceOf(wallet).call()
    balanceUSDT = new BigNumber(balanceUSDT).shiftedBy(-decimalsUSDT);

    this.setState({ balanceUSDT })

    let esto = await contract.setstate().call();

    this.setState({
      totalInvestors: parseInt(esto.Investors._hex),
      totalInvested: parseInt(esto.Invested._hex) / 10 ** decimales,
      totalRefRewards: parseInt(esto.RefRewards._hex) / 10 ** decimales

    });


    this.Link();
    this.Investors();

    console.log(await contract.getDeposits(wallet).call())
  }

  async Link() {
    const { wallet } = this.props;
    const { registered } = this.state;
    if (registered) {

      let loc = document.location.origin;

      let mydireccion = wallet
      mydireccion = loc + '/?ref=' + mydireccion;
      this.setState({
        link: mydireccion,
      });
    } else {
      this.setState({
        link: "Haz una inversión para obtener el LINK de referido",
      });
    }
  }


  async Investors() {

    const { contract, wallet } = this.props;
    const { decimales } = this.state;

    let esto = await contract.investors(wallet).call();

    this.setState({
      registered: esto.registered,
      balanceRef: parseInt(esto.balanceRef._hex) / 10 ** decimales,
      totalRef: parseInt(esto.totalRef._hex) / 10 ** decimales,
      invested: parseInt(esto.invested._hex) / 10 ** decimales,
      paidAt: parseInt(esto.paidAt._hex) / 10 ** decimales,
      my: parseInt((await contract.withdrawable(wallet).call()).amount._hex) / 10 ** decimales,
      withdrawn: parseInt(esto.withdrawn._hex) / 10 ** decimales,
    });

  };

  async withdraw() {

    const { tronWeb, contract, wallet } = this.props
    const { balanceRef, my, min, } = this.state;

    var available = (balanceRef + my);
    available = available.toFixed(8);
    available = parseFloat(available);

    if (available < min) {
      window.alert("El minimo para retirar son: " + min + " SITE");
      return;
    }


    let inputs = [
      //{type: 'uint256', value: amount},
      { type: 'address', value: this.props.tronWeb.address.toHex(wallet) }
    ]

    let funcion = "withdraw(address)"
    let trigger = await tronWeb.transactionBuilder.triggerSmartContract(tronWeb.address.toHex(contract.address), funcion, {}, inputs, tronWeb.address.toHex(wallet))
    let transaction = await tronWeb.transactionBuilder.extendExpiration(trigger.transaction, 180);
    transaction = await window.tronLink.tronWeb.trx.sign(transaction)
      .catch((e) => {
        alert(e.toString())

      })
    transaction = await this.props.tronWeb.trx.sendRawTransaction(transaction)
      .then(() => {
        alert("Transacción exitosa: " + transaction.txID)
      })
      .catch((e) => {
        alert(e.toString())
      })



    this.estado();
  };

  async rateSITE() {

    const { token, tokenUSDT } = this.props;

    let price = new BigNumber(1);

    try {
      // calcular precio de SITE en USDT
      let reservaUSDT = await tokenUSDT.balanceOf("TRXgAN8VAZFmtUHbJfGXTchjGo2PtT3VVc").call()// USDT
      reservaUSDT = new BigNumber(reservaUSDT).shiftedBy(-6)
      let reserva = await token.balanceOf("TRXgAN8VAZFmtUHbJfGXTchjGo2PtT3VVc").call()// SITE
      reserva = new BigNumber(reserva).shiftedBy(-8)

      price = reservaUSDT.div(reserva)
    } catch (error) {
      console.log(error)
    }

    if (price.isNaN()) price = new BigNumber(1);
    return price;

  };


  async deposit() {

    const { contract, tronWeb, token, wallet } = this.props;
    const { decimales, balanceSite, balanceTRX, min, opcion, registered } = this.state;

    let amount = document.getElementById("amount").value;
    amount = new BigNumber(parseFloat(amount.replace(/,/g, ".")));
    if (isNaN(amount)) amount = 0;

    let aprovado = await token.allowance(wallet, contract.address).call();
    aprovado = parseInt(aprovado._hex);

    if (amount > aprovado || aprovado === 0) {

      let inputs = [
        { type: 'address', value: this.props.tronWeb.address.toHex(contract.address) },
        { type: 'uint256', value: "115792089237316195423570985008687907853269984665640564039457584007913129639935" },

      ]

      let funcion = "approve(address,uint256)"
      let trigger = await tronWeb.transactionBuilder.triggerSmartContract(tronWeb.address.toHex(token.address), funcion, {}, inputs, tronWeb.address.toHex(wallet))
      let transaction = await tronWeb.transactionBuilder.extendExpiration(trigger.transaction, 180);
      transaction = await window.tronLink.tronWeb.trx.sign(transaction)
        .catch((e) => {
          alert(e.toString())
        })
      console.log(transaction)
      transaction = await this.props.tronWeb.trx.sendRawTransaction(transaction)
        .then(() => {
          alert("Aprobación exitosa: " + transaction.txID)
        })
        .catch((e) => {
          alert(e.toString())
        })
      this.estado();
      return;


    }

    aprovado = await token.allowance(wallet, contract.address).call();
    aprovado = parseInt(aprovado._hex);

    if (balanceSite < amount) {
      document.getElementById("amount").value = "";
      window.alert("No tienes suficiente SITE");
      return;
    }

    if (balanceTRX < minTRX) {
      alert("Su cuenta debe tener almenos " + minTRX + " TRX para ejecutar las transacciones correctamente");
      return;
    }

    if (amount.toNumber() < min || isNaN(amount.toNumber())) {
      document.getElementById("amount").value = min;
      alert("Coloca una cantidad mayor que " + min + " SITE");
      return;
    }


    let investors = await contract.investors(wallet).call();
    let sponsor = tronWeb.address.fromHex(investors.sponsor);

    if (!registered) {

      let loc = document.location.href;

      if (loc.indexOf('?') > 0) {

        var getString = loc.split('?')[1];
        var GET = getString.split('&');
        var get = {};
        for (var i = 0, l = GET.length; i < l; i++) {
          var tmp = GET[i].split('=');
          get[tmp[0]] = unescape(decodeURI(tmp[1]));
        }

        if (get['ref']) {
          tmp = get['ref'].split('#');

          let inversors = await contract.registered(tmp[0]).call();

          if (inversors) {
            sponsor = tmp[0];
          }
        }

      }

    }


    let inputs = [
      { type: 'uint256', value: amount.shiftedBy(decimales).toString(10) },
      { type: 'uint256', value: opcion.toString(10) },
      { type: 'address', value: this.props.tronWeb.address.toHex(sponsor) }
    ]

    let funcion = "deposit(uint256,uint256,address)"
    let trigger = await tronWeb.transactionBuilder.triggerSmartContract(tronWeb.address.toHex(contract.address), funcion, {}, inputs, tronWeb.address.toHex(wallet))
    let transaction = await tronWeb.transactionBuilder.extendExpiration(trigger.transaction, 180);
    transaction = await window.tronLink.tronWeb.trx.sign(transaction)
      .catch((e) => {
        alert(e.toString())

      })
    console.log(transaction)
    transaction = await this.props.tronWeb.trx.sendRawTransaction(transaction)
      .then(() => {
        alert("Felicidades inversión exitosa: " + transaction.txID);
      })
      .catch((e) => {
        alert(e.toString())
      })

    document.getElementById("amount").value = "";
    document.getElementById("services").scrollIntoView({ block: "end", behavior: "smooth" });;

    this.estado();

  };

  getMax() {
    document.getElementById("amount").value = this.state.balance;
  }

  render() {
    let { ruta, contract } = this.props;
    let { min, balanceRef, totalRef, invested, withdrawn, my, wallet, link, totalInvestors, totalInvested, totalRefRewards, precioSITE, partner } = this.state;

    let available = (balanceRef + my);
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

    if (ruta === "") ruta = "V1"

    return (
      <>
        <section id="why-us" className="wow fadeIn mt-5">
          <div className="container">
            <header className="section-header">
              <h3>Haz tu inversión</h3>
            </header>
            <div className="row row-eq-height justify-content-center">
              <div className="card wow bounceInUp text-center">
                <div className="card-body">
                  <h5 className="card-title" > <a href={"https://tronscan.org/#/contract/" + contract.address + "/code"} rel="noopener noreferrer" target="_blank" >Contrato {ruta}</a></h5>

                  <table className="table borderless">
                    <tbody>

                      <tr>
                        <td><i className="fa fa-check-circle-o text-success"></i>TOTAL ROI</td><td>{this.state.porcentaje}%</td>
                      </tr>
                      <tr>
                        <td><i className="fa fa-check-circle-o text-success"></i>TIEMPO EN DIAS</td><td>{this.state.dias}</td>
                      </tr>
                      <tr>
                        <td><i className="fa fa-check-circle-o text-success"></i>TASA E.A</td><td>{((((this.state.porcentaje) - 100) * 360) / (this.state.dias)).toFixed(2)}%</td>
                      </tr>
                      <tr>
                        <td><i className="fa fa-check-circle-o text-success"></i>RECOMPENSA</td><td>{((this.state.porcentaje) - 100).toFixed(2)}%</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="mb-3">
                    <b>{">>> "}Select Term: {" "}
                    <select id="days" onInput={()=>this.estado()} name="days">
                      <option value="0">30</option>
                      <option value="1">60</option>
                      <option value="2">90</option>
                      <option value="3">120</option>
                      <option value="4">180</option>
                      <option value="5">360</option>

                    </select> Days{" <<<"}</b>
            


                  </div>

                  <div className="form-group">Wallet
                    <p className="card-text">
                      <strong>{this.state.wallet}</strong><br />
                    </p>
                    <p className="card-text ">

                      SITE: <strong>{this.state.balance}</strong> (${(this.state.balance * precioSITE).toFixed(2)})<br />
                      TRX: <strong>{(this.state.balanceTRX * 1).toFixed(6)}</strong><br />
                      USDT: <strong>{this.state.balanceUSDT.toString(10)}</strong><br /><br />
                      Partner:<br />
                      <strong>{partner}</strong>
                    </p>

                    <div className="input-group mb-3">
                      <input id="amount" type="number" className="form-control mb-20 text-center" placeholder={"Minimo. " + min + " SITE"} step={1} min={min}></input>
                      <div className="input-group-append">
                        <button className="btn btn-outline-secondary" type="button" onClick={() => this.getMax()}>MAX</button>
                      </div>
                    </div>

                    <p className="card-text">Recomendamos tener más de {minTRX} TRX para ejecutar las transacciones correctamente</p>

                    <button className="btn btn-lg btn-success" onClick={() => this.deposit()}>{this.state.deposito}</button>
                    <br></br>
                    <br></br>
                    <div style={{ display: 'inline-block', background: 'linear-gradient(135deg, #800080, #ff00ff)', borderRadius: '25px', padding: '10px 20px', color: 'white', fontFamily: 'Arial, sans-serif', fontSize: '16px', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                      <a href="https://dapp.brutus.finance/#/ebot?amount=200000" rel="noopener noreferrer" target="_blank" style={{ color: 'white', textDecoration: 'none' }}>
                        <span style={{ verticalAlign: 'middle' }}>RENT 200K ENERGY</span>
                        <img src='data:image/bmp;base64,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'
                          alt="Icon" style={{ maxHeight: "30px", verticalAlign: 'middle', marginRight: '10px' }}>

                        </img>
                      </a>
                    </div>

                  </div>

                </div>
              </div>
            </div>
            <div >
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
            </div>
          </div>
        </section>

        <section id="services" className="section-bg">
          <div className="container">

            <header style={{ 'textAlign': 'center' }} className="section-header">
              <h3 className="white"><i className="fa fa-user mr-2" aria-hidden="true"></i><span style={{ 'fontWeight': 'bold' }}>
                Mi Oficina:</span> <br></br>
                <span style={{ 'fontSize': '11px' }}>{wallet}</span></h3><br></br>
              <h3 className="white" style={{ 'fontWeight': 'bold' }}><i className="fa fa-users mr-2" aria-hidden="true"></i>Link de referido:</h3>
              <h6 className="white" style={{ 'padding': '1.5em', 'fontSize': '11px' }}><a href={link}>{link}</a> <br /><br />
                <CopyToClipboard text={link}>
                  <button type="button" className="btn btn-info">COPIAR</button>
                </CopyToClipboard>
              </h6>
              <hr></hr>

            </header>

            <div className="row text-center">

              <div className="col-md-6 col-lg-5 offset-lg-1 wow bounceInUp" data-wow-duration="1s">
                <div className="box">
                  <div className="icon"><i className="ion-ios-analytics-outline" style={{ color: '#ff689b' }}></i></div>
                  <h4 className="title"><a href="#services">{invested} SITE</a></h4> (${(this.state.invested * precioSITE).toFixed(2)})
                  <p className="description">Total invertido</p>
                </div>
              </div>
              <div className="col-md-6 col-lg-5 wow bounceInUp" data-wow-duration="1s">
                <div className="box">
                  <div className="icon"><i className="ion-ios-bookmarks-outline" style={{ color: '#e9bf06' }}></i></div>
                  <h4 className="title"><a href="#services">{totalRef} SITE</a></h4> (${(totalRef * precioSITE).toFixed(2)})
                  <p className="description">Total ganancias por referidos</p>
                </div>
              </div>

              <div className="col-md-6 col-lg-5 offset-lg-1 wow bounceInUp" data-wow-delay="0.1s" data-wow-duration="1s">
                <div className="box">
                  <div className="icon"><i className="ion-ios-paper-outline" style={{ color: '#3fcdc7' }}></i></div>
                  <p className="description">Mi balance</p>
                  <h4 className="title"><a href="#services">{my} SITE</a></h4> (${(my * precioSITE).toFixed(2)})

                </div>
              </div>
              <div className="col-md-6 col-lg-5 wow bounceInUp" data-wow-delay="0.1s" data-wow-duration="1s">
                <div className="box">
                  <div className="icon"><i className="ion-ios-paper-outline" style={{ color: '#3fcdc7' }}></i></div>
                  <p className="description">Balance por referidos</p>
                  <h4 className="title"><a href="#services"> {balanceRef} SITE</a></h4> (${(balanceRef * precioSITE).toFixed(2)})

                </div>
              </div>

              <div className="col-md-6 col-lg-5 offset-lg-1 wow bounceInUp" data-wow-delay="0.1s" data-wow-duration="1s">
                <div className="box">
                  <div className="icon"><i className="ion-ios-speedometer-outline" style={{ color: '#41cf2e' }}></i></div>
                  <h4 className="title"><a href="#services">Disponible</a></h4>
                  <p className="description">{available} SITE</p> (${(available * precioSITE).toFixed(2)})
                  <button type="button" className="btn btn-info d-block text-center mx-auto mt-1" onClick={() => this.withdraw()}>Retirar</button>
                </div>
              </div>
              <div className="col-md-6 col-lg-5 wow bounceInUp" data-wow-delay="0.2s" data-wow-duration="1s">
                <div className="box">
                  <div className="icon"><i className="ion-ios-clock-outline" style={{ color: '#4680ff' }}></i></div>
                  <h4 className="title"><a href="#services">Retirado</a></h4>
                  <p className="description">{withdrawn} SITE</p> (${(withdrawn * precioSITE).toFixed(2)})
                </div>
              </div>

            </div>

          </div>
        </section>

        {precioSITE > 0 ? <Calculadora precioSITE={precioSITE}></Calculadora> : <></>}


      </>
    );
  }
}