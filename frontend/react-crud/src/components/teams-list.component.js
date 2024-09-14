import React, { Component } from "react";
import TeamDataService from "../services/team.service.js";
import { Link } from "react-router-dom";

export default class TeamsList extends Component {
    constructor(props) {
        super(props);
        this.retrieveTeams = this.retrieveTeams.bind(this);
        this.refreshList = this.refreshList.bind(this);
        this.setActiveTeam = this.setActiveTeam.bind(this);
        this.removeAllTeams = this.removeAllTeams.bind(this);

        this.state = {
            teams: [],
            currentTeam: null,
            currentIndex: -1
        };
    }

    componentDidMount() {
        this.retrieveTeams();
    }

    retrieveTeams() {
        TeamDataService.getAll()
            .then(response => {
                this.setState({
                    teams: response.data
                });
                console.log(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }

    refreshList() {
        this.retrieveTeams();
        this.setState({
            currentTeam: null,
            currentIndex: -1
        });
    }

    setActiveTeam(team, index) {
        this.setState({
            currentTeam: team,
            currentIndex: index
        });
    }

    removeAllTeams() {
        TeamDataService.deleteAll()
            .then(response => {
                console.log(response.data);
                this.refreshList();
            })
            .catch(e => {
                console.log(e);
            });
    }

    render() {
        const { teams, currentTeam, currentIndex } = this.state;

        return (
            <div className="list row">
                <div className="col-md-6">
                    <h4>Teams List</h4>

                    <ul className="list-group">
                        {teams &&
                            teams.map((team, index) => (
                                <li
                                    className={
                                        "list-group-item " +
                                        (index === currentIndex ? "active" : "")
                                    }
                                    onClick={() => this.setActiveTeam(team, index)}
                                    key={index}
                                >
                                    {team.name}
                                </li>
                            ))}
                    </ul>

                    <button
                        className="m-3 btn btn-sm btn-danger"
                        onClick={this.removeAllTeams}
                    >
                        Remove All
                    </button>
                </div>
                <div className="col-md-6">
                    {currentTeam ? (
                        <div>
                            <h4>Team</h4>
                            <div>
                                <label>
                                    <strong>Name:</strong>
                                </label>{" "}
                                {currentTeam.name}
                            </div>

                            <Link
                                to={"/teams/" + currentTeam.id}
                                className="badge badge-warning"
                            >
                                Edit
                            </Link>
                        </div>
                    ) : (
                        <div>
                            <br />
                            <p>Please click on a Team...</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}