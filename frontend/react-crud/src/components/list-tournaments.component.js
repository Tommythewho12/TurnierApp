import React, { Component } from "react";
import TournamentDataService from "../services/tournament.service.js";
import { Link } from "react-router-dom";

export default class ListTournaments extends Component {
    constructor(props) {
        super(props);
        this.retrieveTournaments = this.retrieveTournaments.bind(this);

        this.state = {
            tournaments: []
        };
    }

    componentDidMount() {
        this.retrieveTournaments();
    }

    retrieveTournaments() {
        TournamentDataService.getAll()
            .then(response => {
                this.setState({
                    tournaments: response.data
                });
                console.log(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }

    render() {
        const { tournaments } = this.state;

        return (
            <div className="row">
                <div className="col-3"></div>
                <div className="col-9">
                    <h4>Tournaments</h4>
                    {!tournaments || tournaments.length == 0 ? (
                        <div className="row align-items-center missing-content-div mb-2">
                            <div className="col">
                                Looks like there are no tournaments yet! Create a new tournament with the button below.
                            </div>
                        </div>
                    ) : (
                        <ul className="list-group mb-2">
                            {tournaments && tournaments.map((tournament, index) => (
                                <Link to={tournament._id} className="list-group-item" key={index}>
                                    {tournament.name}
                                </Link>
                            ))}
                        </ul>
                    )}
                    <Link to={"new"} className="">
                        <button className="btn btn-success">
                            + Tournament
                        </button>
                    </Link>
                </div>
            </div>
        );
    }
}