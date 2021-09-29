import React, { Component } from "react";
import TronWeb from "tronweb";

import Utils from "../../utils";
import Home from "../v1Home";
import V2Home from "../v2Home";
import V3Home from "../v3Home";
import Calculadora from "../Calculadora";
import TronLinkGuide from "../TronLinkGuide";


const FOUNDATION_ADDRESS = "TWiWt5SEDzaEqS6kE5gandWMNfxR2B5xzg";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tronWeb: {
        installed: false,
        loggedIn: false
      }
    };
  }

  async componentDidMount() {
    await new Promise(resolve => {
      const tronWebState = {
        installed: !!window.tronWeb,
        loggedIn: window.tronWeb && window.tronWeb.ready
      };

      if (tronWebState.installed) {
        this.setState({
          tronWeb: tronWebState
        });

        return resolve();
      }

      let tries = 0;

      const timer = setInterval(() => {
        if (tries >= 10) {

          const TRONGRID_API = "https://api.trongrid.io";

          window.tronWeb = new TronWeb(
            TRONGRID_API,
            TRONGRID_API,
            TRONGRID_API
          );

          this.setState({
            tronWeb: {
              installed: false,
              loggedIn: false
            }
          });
          clearInterval(timer);
          return resolve();
        }

        tronWebState.installed = !!window.tronWeb;
        tronWebState.loggedIn = window.tronWeb && window.tronWeb.ready;

        if (!tronWebState.installed) {
          return tries++;
        }

        this.setState({
          tronWeb: tronWebState
        });

        resolve();
      }, 1*1000);
    });

    if (!this.state.tronWeb.loggedIn) {
      // Set default address (foundation address) used for contract calls
      // Directly overwrites the address object if TronLink disabled the
      // function call
      window.tronWeb.defaultAddress = {
        hex: window.tronWeb.address.toHex(FOUNDATION_ADDRESS),
        base58: FOUNDATION_ADDRESS
      };

      window.tronWeb.on("addressChange", () => {
        if (this.state.tronWeb.loggedIn) {
          return;
        }

        this.setState({
          tronWeb: {
            installed: true,
            loggedIn: true
          }
        });
      });
    }

    Utils.setTronWeb(window.tronWeb);
  }

  render() {
    var getString = "/";
    var loc = document.location.href;
    var interrogant = "";
    //console.log(loc);
    if(loc.indexOf('?')>0){
              
      getString = loc.split('?')[1];
      getString = getString.split('#')[0];
      interrogant = "?";
    }

    if (!this.state.tronWeb.installed) return (
      <>
        <div className="container mb-5">
          <TronLinkGuide />
        </div>
        <Calculadora />
      </>
      );

    if (!this.state.tronWeb.loggedIn) return (
      <>
        <div className="container mb-5">
          <TronLinkGuide installed url={interrogant+getString}/>
        </div>
        <Calculadora />
      </>
      );

    switch (getString) {
      case "v2.1": 
      case "V2.1": 
      case "staking2.1": 
      case "stakingv2.1":
      case "stakingV2.1":
      case "v2": 
      case "V2": 
      case "staking": 
      case "stakingv2":
      case "stakingV2": return(<><V2Home url={interrogant+getString}/><Calculadora /></>);

      case "v3": 
      case "V3": 
      case "sub": 
      case "stakingSITE": 
      case "stakingv3": 
      case "stakingV3": return(<><V3Home url={interrogant+getString}/><Calculadora /></>);
    
      default:  return(<><Home /><Calculadora /></>);
    }


  }
}
export default App;

// {tWeb()}
