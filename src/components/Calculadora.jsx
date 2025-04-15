import React, { useState, useCallback, useEffect } from "react";


const imageSITE = "./img/logo-site.png";
const imageUSDT = "./img/logo-usdt.png";
const imageCOPT = "./img/logo-copt.png";


const prices = { // un dolar
    BRL: 1/5.8669,
    COP: 1/4322.52105,
    EUR: 1/0.880437,
    MXN: 1/20.306825,
    PEN: 1/3.724748,
    PYG: 1/7983.940654
}

const Calculadora = ({precioSITE, CoptUsdt = 0.000260630465095065}) => {
    const [monedaIn, setMonedaIn] = useState('SITE')
    const [monedaOut, setMonedaOut] = useState('USDT')
    const [imageIn, setImageIn] = useState(imageSITE)
    const [imageOut, setImageOut] = useState(imageUSDT)

    const [valueIn, setValueIn] = useState(0)
    const [precioOut, setValueOut] = useState(0)
    
    const listaIn = (<>
        <option value="SITE">SITE</option>
        <option value="USDT">USDT</option>
        <option value="COPT">COPT</option>
    </>)
    const listaOut = (<>
        <option value="USDT">USDT</option>
        <option value="SITE">SITE</option>
        <option value="COPT">COPT</option>
    </>)

   
    const handleChangeIN = (event) => {
        const value = event.target.value;
    let imgIn = imageSITE, imgOut = imageUSDT, monedaOut = 'USDT';
        switch (value) {

            case "COPT":
                imgIn = imageCOPT;
                imgOut = imageSITE;
                monedaOut = "SITE";
                break;

            case "USDT":
                imgIn = imageUSDT;
                imgOut = imageSITE;
                monedaOut = "SITE";
                break;

            default:
                imgIn = imageSITE;
                imgOut = imageUSDT;
                monedaOut = "USDT";
                break;
        }
        document.getElementById("selIN").value = value;
        document.getElementById("selOUT").value = monedaOut;
        setMonedaIn(value)
        setMonedaOut(monedaOut)

        setImageIn(imgIn)
        setImageOut(imgOut)

    }

    const handleChangeOUT = (event) => {

        const value = event.target.value;
        let imgOut = imageUSDT, imgIn = imageSITE, monedaIn = 'SITE';

        switch (value) {

            case "COPT":
                imgOut = imageCOPT;
                imgIn = imageSITE;
                monedaIn = "SITE";
                break;

            case "SITE":
                imgOut = imageSITE;
                imgIn = imageUSDT;
                monedaIn = "USDT";
                break;

            default:
                imgOut = imageUSDT;
                imgIn = imageSITE;
                monedaIn = "SITE";
                break;
        }
        document.getElementById("selIN").value = monedaIn;
        document.getElementById("selOUT").value = value;

        setMonedaIn(monedaIn)
        setMonedaOut(value)

        setImageIn(imgIn)
        setImageOut(imgOut)

    }

    const change = () => {
   
        setMonedaIn(monedaOut)
        setMonedaOut(monedaIn)

        setImageIn(imageOut)
        setImageOut(imageIn)

        document.getElementById('selIN').value = monedaOut;
        document.getElementById('selOUT').value = monedaIn;

    }

    const calculo = useCallback(() => {

        let amount = document.getElementById("amountSITE").value;
        amount = parseFloat(amount.replace(/,/g, "."))
        if (isNaN(amount) || amount < 0) amount = 1

        setValueIn(amount)

        let par = monedaIn + "_" + monedaOut;

        let precio = 0;
        switch (par) {

            case "SITE_USDT":
                precio = amount * precioSITE;
                break;

            case "USDT_SITE":
                precio = amount / precioSITE;
                break;

            case "SITE_COPT":
                precio = amount * precioSITE;
                precio = precio / prices.COP;
                break;

            case "COPT_SITE":
                precio = amount * prices.COP;
                precio = precio / precioSITE;
                break;

            case "COPT_USDT":
                precio = amount * prices.COP;
                break;

            case "USDT_COPT":
                precio = amount / prices.COP;
                break;

            default:
                break;
        }

        setValueOut(precio)
    }, [monedaIn, monedaOut, precioSITE, CoptUsdt])

    useEffect(() => {
        calculo();

        let interval = setInterval(calculo, 120 * 1000)

        return () => clearInterval(interval);

    }, [calculo])




    return (

        <section id="calculator" className="section-bg pt-5 pb-5">

            <div className="container">

                <div className="row text-center">

                    <div className="col-sm-6 col-md-10 offset-md-1 wow bounceInUp" data-wow-duration="1s">
                        <div className="box">

                            <div onClick={() => change()} style={{ "cursor": "pointer" }}><img src={imageIn} alt="usdt logo trx" width="50" /> <button type="button" className="btn btn-info"><i className="fa fa-exchange" aria-hidden="true"></i></button> <img src={imageOut} alt="usdt logo trx" width="50" /></div>
                            <input id="amountSITE" type="number" className="form-control mb-20 mt-3 text-center" onInput={() => calculo()} placeholder="Ingresa una cantidad"></input>

                        </div>
                    </div>

                </div>

                <div className="row text-center mt-4">

                    <div className="col-sm-6 col-md-5  offset-md-1 wow bounceInUp" data-wow-duration="1s">
                        <div className="box">

                            <img src={imageIn} alt="usdt logo trx" width="50" />

                            <div className="input-group-append">
                                <select id="selIN" className="form-control mb-20 text-center" onInput={handleChangeIN} style={{ "cursor": "pointer" }}>
                                    {listaIn}
                                </select>

                            </div>


                        </div>
                    </div>

                    <div className="col-sm-6 col-md-5  wow bounceInUp" data-wow-duration="1s">
                        <div className="box">
                            <div width="50" heigth="50"><img src={imageOut} alt="usdt logo trx" width="50" /></div>
                            <select id="selOUT" className="form-control mb-20 text-center" onChange={handleChangeOUT} style={{ "cursor": "pointer" }}>
                                {listaOut}
                            </select>

                        </div>
                    </div>

                </div>

                <div className="row text-center">
                    <div className="col-sm-6 col-md-10  offset-md-1 wow bounceInUp" data-wow-duration="1s">
                        <div className="box">

                            <h4 className="title">
                                <br />{(valueIn * 1).toFixed(6)} <b>{monedaIn}</b> = {(precioOut).toFixed(6)} <b>{monedaOut}</b>
                            </h4>
                        </div>
                    </div>

                </div>

            </div>
        </section>

    );

}

export default Calculadora