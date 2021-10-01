import React, { Component } from "react";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import Utils from "../../utils";

import cons from "../../cons.js";
const contractAddress = cons.SC2;

export default class Oficina extends Component {
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
      almacen: 0,
      withdrawn: 0,
      precioSITE: 0,
      valueSITE: 0,
      valueUSDT: 0,
      personasIzquierda: 0,
      puntosIzquierda: 0,
      personasDerecha: 0,
      puntosDerecha: 0,
      bonusBinario: 0,
      puntosEfectivosIzquierda: 0,
      puntosEfectivosDerecha: 0,
      puntosReclamadosIzquierda: 0,
      puntosReclamadosDerecha: 0,
      puntosLostIzquierda: 0,
      puntosLostDerecha: 0,
      directos: 0,
      withdrawn2: 0,
      available: 0,
      available2: 0,

    };

    this.Investors = this.Investors.bind(this);
    this.Investors2 = this.Investors2.bind(this);
    this.Investors3 = this.Investors3.bind(this);
    this.Link = this.Link.bind(this);
    this.withdraw = this.withdraw.bind(this);

    this.rateSITE = this.rateSITE.bind(this);
    this.handleChangeSITE = this.handleChangeSITE.bind(this);
    this.handleChangeUSDT = this.handleChangeUSDT.bind(this);
  }

  handleChangeSITE(event) {
    this.setState({valueSITE: event.target.value});
  }

  handleChangeUSDT(event) {
    this.setState({valueUSDT: event.target.value});
  }

  async componentDidMount() {
    await Utils.setContract(window.tronWeb, contractAddress);
    setInterval(() => this.Investors2(),3*1000);
    setInterval(() => this.Investors3(),3*1000);
    setInterval(() => this.Investors(),3*1000);
    setInterval(() => this.Link(),3*1000);
  };

  async rateSITE(){
    var proxyUrl = cons.proxy;
    var apiUrl = cons.PRE2;
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
    if(registered && false){

      let loc = document.location.href;
      if(loc.indexOf('?')>0){
        loc = loc.split('?')[0];
      }

      if(loc.indexOf('#')>0){
        loc = loc.split('#')[0];
      }
      let mydireccion = window.tronWeb.defaultAddress.base58;
      mydireccion = await Utils.contract.addressToId(mydireccion).call();
      mydireccion = loc+this.props.url+'?ref='+mydireccion;
      var link = mydireccion+"&hand=izq";
      var link2 = mydireccion+"&hand=der";
      this.setState({
        link: link,
        link2: link2,
      });
    }else{
      this.setState({
        link: "Haz una inversión para obtener el LINK de referido",
        link2: "Haz una inversión para obtener el LINK de referido",
      });
    }
  }


  async Investors() {

    let direccion = window.tronWeb.defaultAddress.base58;
    let usuario = await Utils.contract.investors(direccion).call();
    usuario.withdrawable = await Utils.contract.withdrawable(direccion).call();
    
    var tronUSDT = await window.tronWeb;
    var direccioncontract = await Utils.contract.tokenPricipal().call();
    var contractUSDT = await tronUSDT.contract().at(direccioncontract); 
    var decimales = await contractUSDT.decimals().call();

    //console.log(usuario);

    usuario.inicio = parseInt(usuario.inicio._hex)*1000;
    usuario.amount = parseInt(usuario.amount._hex);
    usuario.invested = parseInt(usuario.invested);
    usuario.withdrawn = parseInt(usuario.withdrawn._hex);
    usuario.directos = parseInt(usuario.directos);
    usuario.balanceRef = parseInt(usuario.balanceRef);
    usuario.almacen = parseInt(usuario.almacen);
    usuario.totalRef = parseInt(usuario.totalRef._hex);
    usuario.paidAt = parseInt(usuario.paidAt._hex);
    usuario.plan = parseInt(usuario.plan._hex);
    usuario.withdrawable = parseInt(usuario.withdrawable.amount._hex);

    //console.log(usuario);

    var tiempo = await Utils.contract.tiempo().call();
    tiempo = parseInt(tiempo._hex)*1000;

    var porcentiempo = ((Date.now()-usuario.inicio)*100)/tiempo;

    let porcent = await Utils.contract.porcent().call();
    porcent = parseInt(porcent._hex)/100;
    var valorPlan = usuario.invested*porcent;

    var progresoUsdt = ((valorPlan-(usuario.invested*porcent-(usuario.withdrawn+usuario.withdrawable+usuario.balanceRef+usuario.almacen)))*100)/valorPlan;

    var progresoRetiro = ((valorPlan-(usuario.invested*porcent-usuario.withdrawn))*100)/valorPlan;

    var fecha = new Date(usuario.inicio+tiempo);
    fecha = ""+fecha;

    var contractMigracion = await window.tronWeb.contract().at(cons.SC2_1);

    var investor =  await contractMigracion.investors(window.tronWeb.defaultAddress.base58).call();
    investor.invested = parseInt(investor.invested._hex)/10**8;
    investor.withdrawn = parseInt(investor.withdrawn._hex)/10**8;
    investor.almacen = parseInt(investor.almacen._hex)/10**8;

    var contractUSDT = await window.tronWeb.contract().at(direccioncontract);
    var decimales = await contractUSDT.decimals().call();

    var available2 = await contractMigracion.withdrawable(direccion).call();

    if(available2.amount){
      available2 = parseInt(available2.amount._hex)/10**decimales;
    }else{
      available2 = parseInt(available2._hex)/10**decimales;
    }

    available2 += investor.almacen;

    var available = (usuario.balanceRef/10**decimales+usuario.withdrawable/10**decimales+usuario.almacen/10**decimales);

    this.setState({
      direccion: direccion,
      registered: usuario.registered,
      balanceRef: usuario.balanceRef/10**decimales,
      totalRef: usuario.totalRef/10**decimales,
      invested: usuario.invested/10**decimales,
      paidAt: usuario.paidAt/10**decimales,
      my: usuario.withdrawable/10**decimales,
      withdrawn: usuario.withdrawn/10**decimales,
      almacen: usuario.almacen/10**decimales,
      porcentiempo: porcentiempo,
      progresoUsdt: progresoUsdt,
      progresoRetiro: progresoRetiro,
      valorPlan: valorPlan/10**decimales,
      fecha: fecha,
      directos: usuario.directos,
      available: available,
      available2: available2,
      investdSITE: investor.invested,
      withdrawn2: investor.withdrawn,
    });

  };

  async Investors2() {

    var precioSITE = await this.rateSITE();

    this.setState({
      precioSITE: precioSITE
    });

  };

  async Investors3() {

    var {balanceRef, my, almacen, directos, valorPlan } = this.state;

    let direccion = window.tronWeb.defaultAddress.base58;

    //Personas y puntos totales
    let puntos = await Utils.contract.personasBinary(direccion).call();

    // monto de bonus y puntos efectivos
    let bonusBinario = await Utils.contract.withdrawableBinary(direccion).call();
  
    var available = (balanceRef+my+almacen);

    if(directos >= 2 && available < valorPlan ){
      bonusBinario.amount = parseInt(bonusBinario.amount._hex)/10**8;
    }else{
      bonusBinario.amount = 0;
    }

    let brazoIzquierdo = await Utils.contract.handLeft(direccion).call();

    let brazoDerecho = await Utils.contract.handRigth(direccion).call();

    //console.log(brazoDerecho);

    this.setState({
      personasIzquierda: parseInt(puntos.pLeft._hex),
      personasDerecha: parseInt(puntos.pRigth._hex),

      puntosIzquierda: parseInt(puntos.left._hex)/10**8,
      puntosDerecha: parseInt(puntos.rigth._hex)/10**8,

      bonusBinario: bonusBinario.amount,

      puntosEfectivosIzquierda: parseInt(bonusBinario.left._hex)/10**8,
      puntosEfectivosDerecha: parseInt(bonusBinario.rigth._hex)/10**8,

      puntosReclamadosIzquierda: parseInt(brazoIzquierdo.reclamados._hex)/10**8,
      puntosReclamadosDerecha: parseInt(brazoDerecho.reclamados._hex)/10**8,

      puntosLostIzquierda: parseInt(brazoIzquierdo.lost._hex)/10**8,
      puntosLostDerecha: parseInt(brazoDerecho.lost._hex)/10**8,
    });

  };

  async withdraw(){
    const { balanceRef, my, almacen, directos, valorPlan, bonusBinario } = this.state;

      var contractMigracion = await window.tronWeb.contract().at(cons.SC2_1);

      var investor =  await contractMigracion.investors(window.tronWeb.defaultAddress.base58).call();
      investor.almacen = parseInt(investor.almacen._hex)/10**8;

    if (investor.registered){

      var direccioncontract = await contractMigracion.tokenPricipal().call();
      console.log(direccioncontract);
      var contractUSDT = await window.tronWeb.contract().at(direccioncontract);
      var decimales = await contractUSDT.decimals().call();

      var available = await contractMigracion.withdrawable(window.tronWeb.defaultAddress.base58).call();

      if(available.amount){
        available = parseInt(available.amount._hex)/10**decimales;
      }else{
        available = parseInt(available._hex)/10**decimales;
      }

      available += investor.almacen;

      var MIN_RETIRO = await contractMigracion.MIN_RETIRO().call();
      MIN_RETIRO = parseInt(MIN_RETIRO._hex)/10**decimales;

      var balanceTRX = await window.tronWeb.trx.getBalance();
      balanceTRX = balanceTRX/10**6;

      if ( available > MIN_RETIRO && balanceTRX >= 150){
        await contractMigracion.withdraw().send();
      }else{
        if (available <= MIN_RETIRO) {
          window.alert("El minimo para retirar son: "+(MIN_RETIRO)+" SITE");
        }

        if (balanceTRX < 150) {
          window.alert("Debes tener almenos 150 TRX disponible para realizar satisfactoriamente esta transacción");
        }
      }
    }else{
      await window.alert("Acepte la siguiente transacción para continuar recibiendo sus pagos en token SITE");
      await contractMigracion.migrar().send();
    }
  };


  render() {
    var { balanceRef, invested, my, direccion, link, link2, almacen, valorPlan, directos, bonusBinario, available} = this.state;

    var available = balanceRef+my+almacen;
    if(directos >= 2 && available < valorPlan ){
      available += bonusBinario;
    }
    
    available = available.toFixed(2);
    available = parseFloat(available);

    balanceRef = balanceRef.toFixed(2);
    balanceRef = parseFloat(balanceRef);

    invested = invested.toFixed(2);
    invested = parseFloat(invested);

    my = my.toFixed(2);
    my = parseFloat(my);

    if(this.state.available2 <= 0){
      var estado = <h4 className="title"><a href="#services">Disponible {(this.state.available).toFixed(2)} USDT</a></h4>;
    }else{
      estado = <h4 className="title"><a href="#services">Disponible {(this.state.available2).toFixed(2)} SITE</a></h4>;
    }

    return (

      <div className="container">

        <header style={{'textAlign': 'center'}} className="section-header">
          <h3 className="white">
            <i className="fa fa-user mr-2" aria-hidden="true"></i>
            <span style={{'fontWeight': 'bold'}}>
              Mi Oficina:
            </span>
          </h3>
          <div className="row text-center">
            <div className="col-md-12 col-lg-10 offset-lg-1 wow bounceInUp" data-wow-duration="1s">
              <div className="box">
                <h4 className="title"><a href={"https://tronscan.io/#/address/"+direccion} style={{"wordWrap": "break-word"}}>{direccion}</a></h4>
                Tiempo estimado de fin <b>{this.state.fecha}</b>
                <div className="progress" style={{"height": "20px"}}>
                  <div className="progress-bar-striped progress-bar-animated bg-success" role="progressbar" style={{"width": this.state.porcentiempo+"%"}} aria-valuenow={this.state.porcentiempo} aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                <br></br>
                <b>{(this.state.withdrawn+available).toFixed(2)} USDT</b> ganancias de <b>{this.state.valorPlan} USDT</b>
                <div className="progress" style={{"height": "20px"}}>
                  <div className="progress-bar bg-info " role="progressbar" style={{"width": this.state.progresoUsdt+"%"}} aria-valuenow={this.state.progresoUsdt} aria-valuemin="0" aria-valuemax="100"></div>
                </div>
    
                <div className="progress" style={{"height": "20px"}}>
                  <div className="progress-bar bg-warning " role="progressbar" style={{"width": this.state.progresoRetiro+"%"}} aria-valuenow={this.state.progresoRetiro} aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                Reclamados <b>{(this.state.withdrawn).toFixed(2)} USDT</b>

                <br></br>
                <button type="button" className="btn btn-success d-block text-center mx-auto mt-1" onClick={() => document.getElementById("why-us").scrollIntoView({block: "end", behavior: "smooth"}) }>Upgrade Plan</button>


              </div>
            </div>

            <div className="col-md-5 offset-lg-1" >
              <h3 className="white" style={{'fontWeight': 'bold'}}><i className="fa fa-arrow-left mr-2" aria-hidden="true"></i>Mano izquierda</h3>
              <h6 className="white" style={{'padding': '1.5em', 'fontSize': '11px'}}><a href={link}>{link}</a> <br /><br />
              <CopyToClipboard text={link}>
                <button type="button" className="btn btn-info">COPIAR</button>
              </CopyToClipboard>
              </h6>
              <hr></hr>
            </div>

            <div className="col-md-5 " >
              <h3 className="white" style={{'fontWeight': 'bold'}}>Mano derecha <i className="fa fa-arrow-right mr-2" aria-hidden="true"></i></h3>
              <h6 className="white" style={{'padding': '1.5em', 'fontSize': '11px'}}><a href={link2}>{link2}</a> <br /><br />
              <CopyToClipboard text={link2}>
                <button type="button" className="btn btn-info">COPIAR</button>
              </CopyToClipboard>
              </h6>
              <hr></hr>
            </div>
          </div>

        </header>

        <div className="row text-center">
          <div className="col-md-6 col-lg-5 offset-lg-1 wow bounceInUp" data-wow-delay="0.1s" data-wow-duration="1s">
            <div className="box">
              <div className="icon"><i className="ion-ios-paper-outline" style={{color: '#3fcdc7'}}></i></div>
              <p className="description">Equipo Izquierdo ({this.state.personasIzquierda})</p>
              <h4 className="title"><a href="#services">Disponible {this.state.puntosEfectivosIzquierda} pts</a></h4>
              <p className="description">Reclamado {this.state.puntosReclamadosIzquierda} pts</p>
              <p className="description">Perdidos {this.state.puntosLostIzquierda} pts</p>
              <hr />
              <p className="description">Total {this.state.puntosIzquierda} pts</p>


            </div>
          </div>
          <div className="col-md-6 col-lg-5 wow bounceInUp" data-wow-delay="0.1s" data-wow-duration="1s">
            <div className="box">
              <div className="icon"><i className="ion-ios-paper-outline" style={{color: '#3fcdc7'}}></i></div>
              <p className="description">Equipo Derecho ({this.state.personasDerecha})</p>
              <h4 className="title"><a href="#services">Disponible {this.state.puntosEfectivosDerecha} pts</a></h4>
              <p className="description">Reclamado {this.state.puntosReclamadosDerecha} pts</p>
              <p className="description">Perdidos {this.state.puntosLostDerecha} pts</p>
              <hr />
              <p className="description">Total {this.state.puntosDerecha} pts</p>

            </div>
          </div>

          <div className="col-md-6 col-lg-5 offset-lg-1 wow bounceInUp" data-wow-duration="1s">
            <div className="box">
              <div className="icon"><i className="ion-ios-speedometer-outline" style={{color: '#ff689b'}}></i></div>
              
              {estado}
                
              <button type="button" className="btn btn-info d-block text-center mx-auto mt-1" onClick={() => this.withdraw()}>Retirar ~ {this.state.available2} SITE</button>
              
              <hr></hr>

              <p className="description">Retirado <b>{(this.state.withdrawn).toFixed(2)} USDT // {(this.state.withdrawn2).toFixed(2)} SITE</b> </p>
              <p className="description">Total invertido <b>{invested} USDT {'->'} {this.state.investdSITE} SITE</b> </p>

            </div>
          </div>
          <div className="col-md-6 col-lg-5 wow bounceInUp" data-wow-duration="1s">
            <div className="box">
              <div className="icon"><i className="ion-ios-analytics-outline" style={{color: '#ff689b'}}></i></div>
              <p className="description">Bonus </p>
              <h4 className="title"><a href="#services">{(this.state.balanceRef+this.state.bonusBinario).toFixed(2)} USDT</a></h4>
              <p>(~ {(this.state.balanceRef+this.state.bonusBinario/this.state.precioSITE).toFixed(2)} SITE)</p>
              <hr></hr>
              <p className="description">({this.state.directos}) Referidos directos <b>{(this.state.balanceRef).toFixed(2)} USDT</b> </p>
              <p className="description">({this.state.personasDerecha+this.state.personasIzquierda}) Red binaria <b>{(this.state.bonusBinario).toFixed(2)} USDT</b> </p>
              
            </div>
          </div>

        </div>

      </div>

    );
  }
}
