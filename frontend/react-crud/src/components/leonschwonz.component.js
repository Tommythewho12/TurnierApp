import React, { Component } from "react";
import { withRouter } from '../common/with-router.js';
import { PDFViewer } from "@react-pdf/renderer";
import MyDocument from "../resources/PDF.js";

class Leonschwonz extends Component {
    constructor(props) {
        super(props);
    }

    render() {

        return (
            <div className="mx-auto p-2 container">
                <PDFViewer width={"100%"} height={"800px"}>
                    <MyDocument />
                </PDFViewer>
            </div>
        );
    }
}

export default withRouter(Leonschwonz);