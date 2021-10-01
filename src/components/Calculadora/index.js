import React, { Component } from "react";

import cons from "../../cons.js";

var apiUrl = cons.PRE;
const imageSITE = "https://coin.top/production/upload/logo/TDDkSxfkN5DbqXK3tHSZFXRMcT9aS6m9qz.png";

var apiUrl2 = "https://precio-site.herokuapp.com/api/v1/servicio/precio/v1/COPT";
const imageUSDT = "https://coin.top/production/logo/usdtlogo.png";

const imageCOPT = "https://nile.tronscan.org/upload/logo/TEukpkVusQQWnKzyfyUy8Yz9B9Khei6MCm.png";

const imageBOB = "img/bob.png";

export default class Oficina extends Component {
  constructor(props) {
    super(props);

    this.state = {
      SiteUsdt: 0.0172,
      CoptUsdt: 0.000260630465095065,
      BobUsdt: 0.143472023,
      monedaIn: "SITE",
      monedaOut: "USDT",
      valueIn: 0,
      precioOut: 0,
      imageIn: imageSITE,
      imageOut: imageUSDT,
      listaIn: <>
      <option value="SITE">SITE</option>
      <option value="USDT">USDT</option>
      <option value="COPT">COPT</option>
      <option value="BOB">BOB</option></>,
      listaOut: <>
      <option value="USDT">USDT</option>
      <option value="SITE">SITE</option>
      <option value="COPT">COPT</option>
      <option value="BOB">BOB</option></>,

    };

    this.rateSITE = this.rateSITE.bind(this);
    this.handleChangeIN = this.handleChangeIN.bind(this);
    this.handleChangeOUT = this.handleChangeOUT.bind(this);
    this.calculo = this.calculo.bind(this);
    this.handleChangeValueIN = this.handleChangeValueIN.bind(this);
    this.change = this.change.bind(this);
  }

  handleChangeValueIN(event) {
    this.setState({
      valueIn: event.target.value
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
    var par = this.state.monedaIn+"_"+this.state.monedaOut;
    var precio = 0;
    switch (par) {
      
      case "SITE_USDT":
        precio = this.state.valueIn*this.state.SiteUsdt;
        break;

      case "USDT_SITE":
        precio = this.state.valueIn/this.state.SiteUsdt;
        break;

      case "SITE_COPT":
        precio = this.state.valueIn*this.state.SiteUsdt;
        precio = precio/this.state.CoptUsdt;
        break;

      case "COPT_SITE":
        precio = this.state.valueIn*this.state.CoptUsdt;
        precio = precio/this.state.SiteUsdt;
        break;

      case "SITE_BOB":
        precio = this.state.valueIn*this.state.SiteUsdt;
        precio = precio/this.state.BobUsdt;
        break;

      case "BOB_SITE":
        precio = this.state.valueIn*this.state.BobUsdt;
        precio = precio/this.state.SiteUsdt;
        break;

      case "COPT_USDT":
        precio = this.state.valueIn*this.state.CoptUsdt;
        break;

      case "USDT_COPT":
        precio = this.state.valueIn/this.state.CoptUsdt;
        break;
    
      default:
        break;
    }
    this.setState({
      valueIn: this.state.valueIn,
      precioOut: precio
    });
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

      case "BOB":
        image = imageBOB;
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

      case "BOB":
        image = imageBOB;
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

  async componentDidMount() {
    setInterval(async() => await this.calculo() ,1*1000);
    await this.rateSITE();
    setInterval(async() => await this.rateSITE() ,15*1000);
  };

  async rateSITE(){
    var proxyUrl = cons.proxy;
    var response;

    try {
      response = await fetch(proxyUrl+apiUrl);
    } catch (err) {
      console.log(err);
    }
    var json = await response.json();

    this.setState({
      SiteUsdt: json.Data.precio
    });

    try {
      response = await fetch(proxyUrl+apiUrl2);
    } catch (err) {
      console.log(err);
    }
    json = await response.json();
    
    this.setState({
      CoptUsdt: json.Data.precio,
    });

  };


  render() {

    return (

      <section id="calculator" className="section-bg pt-5 pb-5">

      <div className="container">

        <div className="row text-center">

          <div className="col-sm-6 col-md-10 offset-md-1 wow bounceInUp" data-wow-duration="1s">
            <div className="box">

            <div onClick={()=> this.change()} style={{"cursor": "pointer"}}><img src={this.state.imageIn} alt="usdt logo trx" width="50" /> <button className="btn btn-info"><i className="fa fa-exchange" aria-hidden="true"></i></button> <img src={this.state.imageOut} alt="usdt logo trx" width="50"/></div>
            <input id="amountSITE" type="number" className="form-control mb-20 mt-3 text-center" onChange={this.handleChangeValueIN}  placeholder="Ingresa una cantidad"></input>

            </div>
          </div>

        </div>
        
        <div className="row text-center mt-4">

          <div className="col-sm-6 col-md-5  offset-md-1 wow bounceInUp" data-wow-duration="1s">
          <div className="box">  
                        
            <img src={this.state.imageIn} alt="usdt logo trx" width="50" />
            
              <div className="input-group-append">
                <select id="selIN" className="form-control mb-20 text-center" onChange={this.handleChangeIN} style={{"cursor": "pointer"}}>
                  {this.state.listaIn}
                </select>
                
              </div>
              

            </div>
          </div>

          <div className="col-sm-6 col-md-5  wow bounceInUp" data-wow-duration="1s">
            <div className="box">
              <div width="50" heigth="50"><img src={this.state.imageOut} alt="usdt logo trx" width="50" /></div>
              <select id="selOUT" className="form-control mb-20 text-center" onChange={this.handleChangeOUT} style={{"cursor": "pointer"}}>
                {this.state.listaOut}
              </select>
              
            </div>
          </div>

        </div>

        <div className="row text-center">
          <div className="col-sm-6 col-md-10  offset-md-1 wow bounceInUp" data-wow-duration="1s">
            <div className="box">  
                          
              <h4 className="title"> 
                  <br />{(this.state.valueIn*1).toFixed(6)} <b>{this.state.monedaIn}</b> = {(this.state.precioOut).toFixed(6)} <b>{this.state.monedaOut}</b>
              </h4> 
            </div>
          </div>

        </div>
        
      </div>
      </section>

    );
  }
}
