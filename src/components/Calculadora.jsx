import React, { useState, useCallback, useEffect } from "react";


const imageSITE = "./img/logo-site.png";
const imageUSDT = "./img/logo-usdt.png";
const imageCOPT = "./img/logo-copt.png";



const Calculadora = (precioSITE, CoptUsdt = 0.000260630465095065) => {
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

    const [monedaIn, setMonedaIn] = useState('SITE')
    const [monedaOut, setMonedaOut] = useState('USDT')
    const [imageIn, setImageIn] = useState(imageSITE)
    const [imageOut, setImageOut] = useState(imageUSDT)

    const [valueIn, setValueIn] = useState(0)
    const [precioOut, setValueOut] = useState(0)

    const handleChangeIN = (event) => {
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
        setMonedaIn(event.target.value)
        setMonedaOut(moneda2)

        setImageIn(image)
        setImageOut(image2)

    }

    const handleChangeOUT = (event) => {
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

        setMonedaIn(moneda2)
        setMonedaOut(event.target.value)

        setImageIn(image2)
        setImageOut(image)

    }

    const change = () => {
   
        setMonedaIn(monedaOut)
        setMonedaOut(monedaIn)

        setImageIn(imageOut)
        setImageOut(imageIn)


    }

    const calculo = useCallback(() => {

        console.log(precioSITE)


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
                precio = precio / CoptUsdt;
                break;

            case "COPT_SITE":
                precio = amount * CoptUsdt;
                precio = precio / precioSITE;
                break;

            case "COPT_USDT":
                precio = amount * CoptUsdt;
                break;

            case "USDT_COPT":
                precio = amount / CoptUsdt;
                break;

            default:
                break;
        }

        setValueOut(precio)
    }, [monedaIn, monedaOut, precioSITE, CoptUsdt])

    useEffect(() => {
        calculo();

        let interval = setInterval(() => {
            calculo();
        }, 120 * 1000)

        return () => {
            clearInterval(interval)
        }

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