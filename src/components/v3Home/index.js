import React, { Component } from "react";

import CrowdFunding from "../v3CrowdFunding";
import Oficina from "../v3Oficina";
import Datos from "../v3Datos";

export default class V3Home extends Component {
  
  render() {

      return (
        <>    
          <section id="why-us" className="wow fadeIn mt-5">
            <div className="container">
              <header className="section-header">
                  <h3>Haz tu inversión</h3>
              </header>
              <div  className="row row-eq-height justify-content-center">
                <CrowdFunding />
              </div>
              <div >
                <Datos />
              </div>
            </div>
          </section>

          <section id="services" className="section-bg">
            <Oficina />
          </section>
          
        </>
      );
  }
}
