import { authService } from '../services/authService'

export default {
  namespaced: true,
  
  state: {
    user: null,
    loading: false,
    error: null
  },

  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },

  actions: {
    async login({ commit }, { email, password }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      const { data, error } = await authService.login(email, password)
      
      if (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        return false
      }
      
      commit('SET_USER', data.user)
      commit('SET_LOADING', false)
      return true
    },

    async register({ commit }, { email, password }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      const { data, error } = await authService.register(email, password)
      
      if (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        return false
      }
      
      commit('SET_USER', data.user)
      commit('SET_LOADING', false)
      return true
    },

    async logout({ commit }) {
      commit('SET_LOADING', true)
      
      const { error } = await authService.logout()
      
      if (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        return false
      }
      
      commit('SET_USER', null)
      commit('SET_LOADING', false)
      return true
    },

    async checkAuth({ commit }) {
      const { user, error } = await authService.getCurrentUser()
      
      if (error) {
        commit('SET_ERROR', error.message)
        return false
      }
      
      commit('SET_USER', user)
      return true
    }
  },

  getters: {
    isAuthenticated: state => !!state.user,
    currentUser: state => state.user,
    isLoading: state => state.loading,
    error: state => state.error
  }
} 