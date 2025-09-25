import apiClient from './apiClient'
import { API_ENDPOINTS } from '@/constants'

/**
 * Skills Management Service
 * Handles skill-related API operations
 */

export const skillsService = {
  /**
   * Get skill suggestions based on query
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of skill suggestions
   */
  async getSuggestions(query) {
    try {
      if (!query || query.length < 2) {
        return []
      }

      const response = await apiClient.get(
        `${API_ENDPOINTS.USER.SKILLS_SUGGESTIONS}?q=${encodeURIComponent(query)}`
      )

      if (response.data?.success) {
        return response.data.data.suggestions || []
      }

      return []
    } catch (error) {
      console.error('Failed to fetch skill suggestions:', error)
      return []
    }
  },

  /**
   * Get popular skills by category
   * @param {string} category - Skill category
   * @returns {Promise<Array>} Array of popular skills
   */
  async getPopularSkills(category = 'all') {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.USER.SKILLS_SUGGESTIONS}?category=${category}&popular=true`
      )

      if (response.data?.success) {
        return response.data.data.suggestions || []
      }

      return []
    } catch (error) {
      console.error('Failed to fetch popular skills:', error)
      return []
    }
  },

  /**
   * Get skill categories
   * @returns {Promise<Array>} Array of skill categories
   */
  async getCategories() {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.USER.SKILLS_SUGGESTIONS}?categories=true`)

      if (response.data?.success) {
        return response.data.data.categories || []
      }

      return []
    } catch (error) {
      console.error('Failed to fetch skill categories:', error)
      return []
    }
  }
}

export default skillsService
