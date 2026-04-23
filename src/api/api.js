import axios from "axios";

const BASE_URL = import.meta.env.VITE_GAS_URL;

const KEY = "SDImupa123*";

export const getSiswa = () => axios.get(`${BASE_URL}?action=getSiswa`);

export const login = (id, nisn) =>
  axios.get(`${BASE_URL}?action=login&id=${id}&nisn=${nisn}`);

export const saveLocation = (data) =>
  axios.get(
    `${BASE_URL}?action=saveLocation&id=${data.id}&nama=${data.nama}&nisn=${data.nisn}&lat=${data.lat}&lng=${data.lng}`,
  );

export const getLocation = (id) =>
  axios.get(`${BASE_URL}?action=getLocation&id=${id}`);
