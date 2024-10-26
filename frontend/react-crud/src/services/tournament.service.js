import http from "../http-common";

class TournamentDataService {
    getAll() {
        return http.get("/tournaments");
    }

    get(id) {
        return http.get(`/tournaments/${id}`);
    }

    create(data) {
        return http.post("/tournaments", data);
    }

    update(id, data) {
        return http.put(`/tournaments/${id}`, data);
    }

    delete(id) {
        return http.delete(`/tournaments/${id}`);
    }

    deleteAll() {
        return http.delete(`/tournaments`);
    }

    // Matchs
    // TODO use different variable name than 'data'
    getMatch(data) {
        return http.get(`/tournaments/${data.tournamentId}/phases/${data.phase}/groups/${data.group}/matchs/${data.match}`);
    }
    // TODO use different variable name than 'data'
    getMatch2(data) {
        return http.get(`/tournaments/test/${data.tournamentId}/phases/${data.phaseId}/groups/${data.groupId}/matchs/${data.matchId}`);
    }

    // TODO use different variable name than 'data'
    updateSet(data) {
        return http.patch(`/tournaments/${data.tournamentId}/phases/${data.phaseId}/groups/${data.groupId}/matchs/${data.matchId}/sets/${data.set._id}`, data.set);
    }
}

export default new TournamentDataService();
