import React, { Component } from "react";
import PhaseDataService from "../services/phase.service.js";
import { Link } from "react-router-dom";

export default class PhasesList extends Component {
    constructor(props) {
        super(props);
        this.retrievePhases = this.retrievePhases.bind(this);

        this.state = {
            phases: []
        };
    }

    componentDidMount() {
        this.retrievePhases();
    }

    retrievePhases() {
        PhaseDataService.getAll()
            .then(response => {
                this.setState({
                    phases: response.data
                });
                console.log(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }

    render() {
        const { phases } = this.state;

        return (
            <div className="list row">
                <div className="col-md-6">
                    <h4>Tutorials List</h4>

                    <ul className="list-group">
                        {phases &&
                            phases.map((phase, index) => (
                                <Link to={"/phases/" + phase._id}><li className={"list-group-item"} key={index}>
                                    {phase.order}
                                </li></Link>
                            ))}
                    </ul>
                </div>
            </div>
        );
    }
}