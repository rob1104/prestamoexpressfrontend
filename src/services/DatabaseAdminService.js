import { api } from 'src/boot/axios'

export const DatabaseAdminService = {
  /**
   * Get list of backups
   */
  async getBackups() {
    const response = await api.get('/api/database/backups')
    return response.data
  },

  /**
   * Create a new backup
   */
  async createBackup() {
    const response = await api.post('/api/database/backups')
    return response.data
  },

  /**
   * Delete a backup
   */
  async deleteBackup(filename) {
    const response = await api.delete(`/api/database/backups/${filename}`)
    return response.data
  },

  /**
   * Download a backup
   */
  async downloadBackup(filename) {
    // We use blob response type for downloading files
    const response = await api.get(`/api/database/backups/${filename}/download`, {
      responseType: 'blob'
    })
    
    // Create a temporary link to download the file
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    return true
  },

  /**
   * Restore a backup
   */
  async restoreBackup(filename) {
    const response = await api.post('/api/database/backups/restore', { filename })
    return response.data
  },

  /**
   * Reset the database
   */
  async resetDatabase(confirmationText) {
    const response = await api.post('/api/database/reset', {
      confirmation: confirmationText
    })
    return response.data
  }
}
