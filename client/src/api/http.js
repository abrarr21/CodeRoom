import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL ;

export const http = axios.create({
  baseURL,
  timeout: 8000,
});

export async function createRoom(payload) {
  const { data } = await http.post("/rooms", payload);
  return data;
}

export async function joinRoom(payload) {
  const { data } = await http.post("/rooms/join", payload);
  return data;
}

export async function closeRoom(code, payload) {
  const { data } = await http.patch(`/rooms/${code}/close`, payload);
  return data;
}
