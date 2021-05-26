import React, { Component } from "react";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import Utils from "../../utils";
import contractAddress from "../Contract";

import cons from "../../cons.js";

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
      withdrawn: 0

    };

    this.Investors = this.Investors.bind(this);
    this.Link = this.Link.bind(this);
    this.withdraw = this.withdraw.bind(this);
  }

  async componentDidMount() {
    await Utils.setContract(window.tronWeb, contractAddress);
    setInterval(() => this.Investors(),500);
    setInterval(() => this.Link(),1000);
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
    let esto = await Utils.contract.investors(direccion.address).call();
    let My = await Utils.contract.MYwithdrawable().call();
    
    var tronUSDT = await window.tronWeb;
    var contractUSDT = await tronUSDT.contract().at(cons.USDT);
    var decimales = await contractUSDT.decimals().call();

    this.setState({
      direccion: window.tronWeb.address.fromHex(direccion.address),
      registered: esto.registered,
      balanceRef: parseInt(esto.balanceRef._hex)/10**decimales,
      totalRef: parseInt(esto.totalRef._hex)/10**decimales,
      invested: parseInt(esto.invested._hex)/10**decimales,
      paidAt: parseInt(esto.paidAt._hex)/10**decimales,
      my: parseInt(My.amount._hex)/10**decimales,
      withdrawn: parseInt(esto.withdrawn._hex)/10**decimales
    });

  };

  async withdraw(){
    var cosa = await Utils.contract.withdraw().send();
    console.log(cosa);
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
        <h3 className="white"><span style={{'fontWeight': 'bold'}}>
        Mi Oficina:</span> <br></br>
        <span style={{'fontSize': '11px'}}>{direccion}</span></h3><br></br>
        <h3 className="white" style={{'fontWeight': 'bold'}}>Link de referido:</h3>
        <h6 className="white" style={{'padding': '1.5em', 'fontSize': '11px'}}><a href={link}>{link}</a> <br /><br />
        <CopyToClipboard text={link}>
          <button type="button" className="btn btn-info">COPIAR</button>
        </CopyToClipboard>
        </h6>
        <hr></hr>

      </header>

      <div className="row">

        <div className="col-md-6 col-lg-5 offset-lg-1 wow bounceInUp" data-wow-duration="1.4s">
          <div className="box">
            <div className="icon"><i className="ion-ios-analytics-outline" style={{color: '#ff689b'}}></i></div>
            <h4 className="title"><a href="#services">{invested} SITE</a></h4>
            <p className="description">Total invertido</p>
          </div>
        </div>
        <div className="col-md-6 col-lg-5 wow bounceInUp" data-wow-duration="1.4s">
          <div className="box">
            <div className="icon"><i className="ion-ios-bookmarks-outline" style={{color: '#e9bf06'}}></i></div>
            <h4 className="title"><a href="#services">{totalRef} SITE</a></h4>
            <p className="description">Total ganancias por referidos</p>
          </div>
        </div>

        <div className="col-md-6 col-lg-5 offset-lg-1 wow bounceInUp" data-wow-delay="0.1s" data-wow-duration="1.4s">
          <div className="box">
            <div className="icon"><i className="ion-ios-paper-outline" style={{color: '#3fcdc7'}}></i></div>
            <p className="description">Mi balance</p>
            <h4 className="title"><a href="#services">{my} SITE</a></h4>

          </div>
        </div>
        <div className="col-md-6 col-lg-5 wow bounceInUp" data-wow-delay="0.1s" data-wow-duration="1.4s">
          <div className="box">
            <div className="icon"><i className="ion-ios-paper-outline" style={{color: '#3fcdc7'}}></i></div>
            <p className="description">Balance por referidos</p>
            <h4 className="title"><a href="#services"> {balanceRef} SITE</a></h4>

          </div>
        </div>

        <div className="col-md-6 col-lg-5 offset-lg-1 wow bounceInUp" data-wow-delay="0.1s" data-wow-duration="1.4s">
          <div className="box">
            <div className="icon"><i className="ion-ios-speedometer-outline" style={{color:'#41cf2e'}}></i></div>
            <h4 className="title"><a href="#services">Disponible</a></h4>
            <p className="description">{available} SITE <button type="button" className="btn btn-info" onClick={() => this.withdraw()}>Retirar</button></p>
          </div>
        </div>
        <div className="col-md-6 col-lg-5 wow bounceInUp" data-wow-delay="0.2s" data-wow-duration="1.4s">
          <div className="box">
            <div className="icon"><i className="ion-ios-clock-outline" style={{color: '#4680ff'}}></i></div>
            <h4 className="title"><a href="#services">Retirado</a></h4>
            <p className="description">{withdrawn} SITE</p>
          </div>
        </div>

      </div>

    </div>

    );
  }
}
