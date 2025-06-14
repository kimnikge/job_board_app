import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:3001', // или ваш адрес backend
  withCredentials: true
})
