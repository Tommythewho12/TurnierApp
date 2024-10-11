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

    findByTitle(title) {
        return http.get(`/tournaments?title=${title}`);
    }
}

export default new TournamentDataService();
