import http from "../http-common";

class PhaseDataService {
    getAll() {
        return http.get("/phases");
    }

    get(id) {
        return http.get(`/phases/${id}`);
    }

    create(data) {
        return http.post("/phases", data);
    }

    update(id, data) {
        return http.put(`/phases/${id}`, data);
    }

    delete(id) {
        return http.delete(`/phases/${id}`);
    }

    deleteAll() {
        return http.delete(`/phases`);
    }

    findByTitle(title) {
        return http.get(`/phases?title=${title}`);
    }
}

export default new PhaseDataService();
