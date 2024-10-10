import http from "../http-common";

class MatchDataService {
    getAll() {
        return http.get("/matchs");
    }

    get(id) {
        return http.get(`/matchs/${id}`);
    }

    getByGroupId(groupId) {
        return http.get(`/matchs/group/${groupId}`);
    }

    create(data) {
        return http.post("/matchs", data);
    }

    update(id, data) {
        return http.put(`/matchs/${id}`, data);
    }

    delete(id) {
        return http.delete(`/matchs/${id}`);
    }

    deleteAll() {
        return http.delete(`/matchs`);
    }
}

export default new MatchDataService();
