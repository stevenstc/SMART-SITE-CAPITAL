import TronWeb from "tronweb";
import siteV2 from "./SITECapitalVMulti.json"
import token from "./TOKEN.json"
import reserve from "./reserve.json"


const CryptoJS = require("crypto-js");

const env = process.env

const testnet = true;

const contractAddress = testnet ? "TDXywbm4AKFVwN2yTMRPaZuSzX9Xc4YpWR" : "TCviVMZxZn6wGUvr3PhSWX7zELK94AGeEm" 
const contractTokenUSDT = testnet ? "TAbFWFW1imCuB4J8vSNGWUye6y8FRtfkdX" : "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t" 
const wallet0x = "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb"

const utils = {
  tronWeb: false,
  contract: false,
  numberRed: 0,
  contractAddress: contractAddress,
  contractTokenUSDT: contractTokenUSDT,
  abi_base: siteV2.abi,
  abi_token: token.abi,
  abi_reserve: reserve.entrys,

  getRed(test = false) {
    let url = "https://api.nileex.io"
    if (test) return url

    let tokenList = env.REACT_APP_LIST_TRONQL || "";
    tokenList = tokenList.split(",")

    if (this.numberRed >= tokenList.length) this.numberRed = 0;

    url = "https://" + tokenList[this.numberRed] + ".mainnet.tron.tronql.com/"
    this.numberRed++;


    return url;
  },

  getTronweb(wallet = wallet0x) {

    const tronWeb = new TronWeb({
      fullHost: this.getRed(testnet),
      //headers: { "TRON-PRO-API-KEY": await keyQuery() }
    })

    tronWeb.setAddress(wallet)
    this.tronWeb = tronWeb

    return tronWeb

  },

  async rentResource(wallet_orden, recurso, cantidad, periodo, temporalidad, precio, signedTransaction) {

    if (recurso === "bandwidth" || recurso === "band") {
      recurso = "band"
    } else {
      recurso = "energy"
    }

    let time = periodo

    if (temporalidad === "h" || temporalidad === "hour" || temporalidad === "hora") {
      time = periodo + temporalidad
    }

    if (temporalidad === "m" || temporalidad === "min" || temporalidad === "minutes" || temporalidad === "minutos") {
      time = periodo + "min"
    }

    let data = {
      "wallet": wallet_orden,
      "resource": recurso,
      "amount": cantidad,
      "duration": time,

      "transaction": signedTransaction,
      "to_address": env.REACT_APP_WALLET_API,
      "precio": TronWeb.toSun(precio),

      "expire": Date.now() + (500 * 1000),

      "id_api": env.REACT_APP_USER_ID,
      "token": env.REACT_APP_TOKEN,
    }

    // Encrypt
    data = CryptoJS.AES.encrypt(JSON.stringify(data), env.REACT_APP_SECRET).toString();

    let consulta = await fetch(env.BRUTUS_API + "rent/energy", {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user: "9650f24d09200d8d0e1b31fd9eab8b55", data })
    }).then((r) => r.json())
      .catch((e) => {
        console.log(e.toString());
        return { result: false, hash: signedTransaction.txID, msg: "API-Error" }
      })

    return consulta

  }
};



export default utils;
