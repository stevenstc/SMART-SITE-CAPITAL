import React, { Component } from "react";

import Home from "./pages/Home";
import TronLinkGuide from "./components/TronLinkGuide";
import utils from "./utils";

let intervalId = null;
let nextUpdate = 0;

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

    intervalId = setInterval(async () => {

      if (Date.now() >= nextUpdate) {

        await this.conectar();

        if (!this.state.tronWeb.loggedIn) {
          nextUpdate = Date.now() + 3 * 1000;
        } else {
          nextUpdate = Date.now() + 60 * 1000;
        }
      }

    }, 3 * 1000);

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
        let contract = utils.getContract(wallet)
        let token = tronWeb.contract(utils.abi_token, await contract.TOKEN().call())
        let tokenUSDT = tronWeb.contract(utils.abi_token, utils.contractTokenUSDT)
        
        this.setState({
          wallet,
          contract,
          token,
          tokenUSDT,
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
    //console.log(loc);
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

