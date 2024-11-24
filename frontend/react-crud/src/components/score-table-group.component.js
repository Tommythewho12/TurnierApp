import { Component } from "react";
import { Link } from "react-router-dom";


export default class ScoreTableGroup extends Component {
    constructor(props) {
        super(props);
        this.group = props.group;
        this.teams = props.teams;

        this.state = {
            selected: false
        }
    }

    getTeamName(teamId) {
        return teamId != undefined ? this.teams.find(t => t._id === teamId).name : "n/a";
    }

    render() {
        const { selected } = this.state;
        const group = this.group;

        return (
            <>
                <div className="row score-table">
                    <div className="col name">
                        <div className="table-header">Gruppe {this.group.order + 1}</div>
                        {this.group.teams.map(team => <div>{team.name}</div>)}
                    </div>
                    <div className="col-auto matchs">
                        <div className="table-header">Spiele</div>
                        {this.group.teams.map(team => <div>{team.matchs}</div>)}
                    </div>
                    <div className="col-auto wins">
                        <div className="table-header">Siege</div>
                        {this.group.teams.map(team => <div>{team.wins}</div>)}
                    </div>
                    <div className="col-auto losses">
                        <div className="table-header">Niederlagen</div>
                        {this.group.teams.map(team => <div>{team.losss}</div>)}
                    </div>
                    <div className="col-auto points">
                        <div className="table-header">Punkte</div>
                        {this.group.teams.map(team => <div>{team.score}</div>)}
                    </div>
                    <div className="col-auto point-difference">
                        <div className="table-header">Punktdifferenz</div>
                        {this.group.teams.map(team => <div>{team.pointsScored} : {team.pointsSuffered}</div>)}
                    </div>
                </div>
                <div className="row justify-content-center score-table-collapse-button">
                        <button className="col-11 btn btn-outline-secondary btn-sm dropdown-toggle" onClick={() => this.setState({selected: !this.state.selected})}>Details</button>
                </div>
                {selected && group.matchs.map((match, matchIndex) => (
                    <div className="row">
                        <div className={"col-3 p-0 text-end " + (match.homeSets > match.guestSets && "fw-bold")}>{this.getTeamName(match.homeTeam)}</div>
                        <div className="col-1 text-center">{match.homeSets ? match.homeSets : 0} : {match.guestSets ? match.guestSets : 0}</div>
                        <div className={"col-3 p-0 " + (match.homeSets < match.guestSets && "fw-bold")}>{this.getTeamName(match.guestTeam)}</div>
                        <div className="col-auto fs-sets"><Link to={"/matchs/" + match._id}>Sets</Link></div>
                                                            
                        {match.sets && match.sets.map((set, setIndex) => (
                            <div key={"match-" + matchIndex + "-set-" + setIndex} className="col-auto fs-sets">
                                ({set.scoreHome ? set.scoreHome : 0} : {set.scoreGuest ? set.scoreGuest : 0})
                            </div>
                        ))}
                    </div>
                ))}
            </>            
        );
    }
}