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
    updateMatch(data) {
        return http.put(`/tournaments/${data.tournamentId}/phases/${data.phase}/groups/${data.group}/matchs/${data.match}`, data.data);
    }
}

export default new TournamentDataService();
