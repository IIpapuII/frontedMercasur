import axios from 'axios'

const api = axios.create({
  baseURL: 'https://notificaciones.mercasur.com.co:9180/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

export default api
