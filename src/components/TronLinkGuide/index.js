import React from 'react';

import TronLinkLogo from './TronLinkLogo.png';


const WEBSTORE_URL = 'https://chrome.google.com/webstore/detail/ibnejdfjmmkpcnlpebklmnkoeoihofec/';

const logo = (
    <div className='col-sm-4 text-center'>
        <img src={ TronLinkLogo } className="img-fluid" alt='TronLink logo' />
    </div>
);

const openTronLink = () => {
    window.open(WEBSTORE_URL, '_blank');
};

const TronLinkGuide = props => {
    var {
        installed = false,
        url = "/"
    } = props;

    var loc = document.location.href;
      loc = loc.split('?');
      var getString = "";
      if(loc.length > 2){
          getString = "?"+loc[2];
      };

    const estilo = {'marginTop': '12em','color': 'black','textDecoration': 'none','backgroundColor': '#ffffffbf'};

    if(!installed) {
        return (
            <div className='row mt-7' onClick={ openTronLink } style={estilo}>
                <div className='col-sm-8'>
                    <h1>Instalar TronLink</h1>
                    <p>
                        Para usar esta aplicación, debe instalar TronLink. <br></br>
                        TronLink es una wallet de TRON que puede descargar en <a href={ WEBSTORE_URL } target='_blank' rel='noopener noreferrer'>Chrome Webstore</a>.
                        Una vez instalado, vuelva y refresque la pagina.
                    </p>
                </div>
                { logo }
            </div>
        );
    }

    return (
    <> <a href={url+getString}>

        <div className='tronLink row' style={estilo} >

            <div className='info col-sm-8'>
                <h1>Requiere Iniciar Sesión</h1>
                <p>
                    TronLink está instalado pero inicia sesion primero. <br></br>
                    Abre TronLink en la barra del navegador y configura tu primer wallet o desbloquea una wallet ya creada.
                </p>
            </div>
            { logo }
        </div>
        </a>

    </>
    );
};

export default TronLinkGuide;
