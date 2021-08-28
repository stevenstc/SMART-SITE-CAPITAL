import React, { Component } from "react";

import CrowdFunding from "../v2CrowdFunding";
import Oficina from "../v2Oficina";
import Datos from "../v2Datos";

export default class V2Home extends Component {

  constructor(props) {
    super(props);
  }
  
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
            <Oficina url={this.props.url}/>
          </section>
          
        </>
      );
  }
}
