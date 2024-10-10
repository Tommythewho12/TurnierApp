import React, { Component } from "react";
import MatchDataService from "../services/match.service.js";

export default class MatchsList extends Component {
    constructor(props) {
        super(props);
        this.retrieveMatchs = this.retrieveMatchs.bind(this);

        this.state = {
            matchs: []
        };
    }

    componentDidMount() {
        this.retrieveMatchs();
    }

    retrieveMatchs() {
        MatchDataService.getAll()
            .then(response => {
                this.setState({
                    matchs: response.data
                });
            })
            .catch(e => {
                console.log(e);
            });
    }

    render() {
        const { matchs } = this.state;

        return (
            <div className="list row">
                <div className="col-md-12">
                    <h4>Matchs List</h4>

                    {
                        matchs &&
                        matchs.map((match, index) => (
                            <table class="table">
                                <thead>
                                    <tr>
                                        <td colSpan="2"># {match.order}</td>
                                    </tr>
                                    <tr>
                                        <th scope="col">{match.homeTeam ? (<>{match.homeTeam.name}</>) : (<>tba</>)}</th>
                                        <th scope="col">{match.guestTeam ? (<>{match.guestTeam.name}</>) : (<>tba</>)}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        match.sets &&
                                        match.sets.map((set, index) => (
                                            <tr>
                                                <td>{set.scoreHome}</td>
                                                <td>{set.scoreGuest}</td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        ))
                    }
                </div>
            </div>
        );
    }
}