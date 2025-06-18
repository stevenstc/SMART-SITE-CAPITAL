import React, { Component } from "react";

import Home from "./pages/Home";
import TronLinkGuide from "./components/TronLinkGuide";
import utils from "./utils";

let intervalId = null;

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      contract: false,
      wallet: "",
      tronWeb: false,
      tronlik: {
        installed: false,
        loggedIn: false
      }
    };

    this.conectar = this.conectar.bind(this);

  }

  async componentDidMount() {

    setTimeout(async() => {
      await this.conectar();
    }, 3 * 1000);

    intervalId = setInterval(async () => {
      await this.conectar();
    }, 300 * 1000);

  }

  componentWillUnmount() {
    clearInterval(intervalId);
  }

  async conectar() {

    let { tronlik, wallet } = this.state;

    if (window.tronWeb) {
      tronlik.installed = true

      if (window.tronWeb.ready) {
        tronlik.loggedIn = true

        wallet = window.tronWeb.defaultAddress.base58
        let tronWeb = utils.getTronweb(wallet)
        let contract = tronWeb.contract(utils.abi_base, utils.contractAddress)
        let token= tronWeb.contract(utils.abi_token, await contract.TOKEN().call())
        let tokenUSDT= tronWeb.contract(utils.abi_token, utils.contractTokenUSDT)
        let ready = true
        
        this.setState({
          wallet,
          contract,
          token,
          tokenUSDT,
          ready,
          tronWeb
        })

      } else {
        tronlik.loggedIn = false

      }


    } else {
      tronlik.installed = false
      tronlik.loggedIn = false

    }

    this.setState({
      tronlik,
    });

  }

  render() {
    let retorno;
    let getString = "/";
    let loc = document.location.href;
    let interrogant = "";

    if (loc.indexOf('?') > 0) {
      getString = loc.split('?')[1];
      getString = getString.split('#')[0];
      interrogant = "?";
    }

    if (!this.state.tronlik.installed) {
      retorno = (

        <div className="container mb-5">
          <TronLinkGuide />
        </div>

      );
    }

    if (!this.state.tronlik.loggedIn) {
      retorno = (

        <div className="container mb-5">
          <TronLinkGuide installed url={interrogant + getString} />
        </div>

      );
    } else {


      switch (getString) {

        default: retorno = <Home {...this.state} />;
      }

    }


    return (<>{retorno}</>)

  }
}
export default App;

