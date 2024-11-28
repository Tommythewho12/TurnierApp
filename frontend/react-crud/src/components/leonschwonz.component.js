import React, { Component } from "react";
import { withRouter } from '../common/with-router.js';


import leon from '../images/Leon.jpg'
import MatchOrderEditor from "./match-order-editor.component.js";

class Leonschwonz extends Component {
    constructor(props) {
        super(props);
    }

    render() {

        return (
            <div className="mx-auto p-2 container">
                <row><img src={leon} /></row>
                <row><p>Man sagt: "du bist was du isst."</p></row>
                <row><h1>Hallo, mein Name ist Leon und ich bin ein Arsch ;)</h1></row>
                <MatchOrderEditor data={[1,2,3]}/>
            </div>
        );
    }
}

export default withRouter(Leonschwonz);