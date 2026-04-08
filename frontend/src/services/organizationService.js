class OrganizationService {
  static baseURL = import.meta.env.VITE_API_URL ?? 'https://backendbizness.onrender.com/api';

  // Test server connection
  static async testConnection() {
    try {
      const response = await fetch(`${this.baseURL}/test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  // Register organization with candidates
  static async register(organizationData, candidates) {
    try {
      const formData = new FormData();
      
      // Add organization data
      formData.append('organizationData', JSON.stringify(organizationData));
      formData.append('candidates', JSON.stringify(candidates));
      
      // Add logo if present
      if (organizationData.logo) {
        formData.append('logo', organizationData.logo);
      }

      const response = await fetch(this.baseURL, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Parse Excel/CSV file for bulk student upload
  static async parseStudentFile(formData) {
    try {
      const response = await fetch(`${this.baseURL}/parse-student-file`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse file');
      }

      return data;
    } catch (error) {
      console.error('File parsing error:', error);
      throw error;
    }
  }

  // Download student template file
  static async downloadStudentTemplate() {
    try {
      const response = await fetch(`${this.baseURL}/student-template`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to download template');
      }

      return response.blob();
    } catch (error) {
      console.error('Template download error:', error);
      throw error;
    }
  }

  // Get all organizations
  static async getAllOrganizations(params = {}) {
    try {
      const searchParams = new URLSearchParams(params);
      const response = await fetch(`${this.baseURL}?${searchParams}`);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch organizations');
      }

      return data;
    } catch (error) {
      console.error('Fetch organizations error:', error);
      throw error;
    }
  }

  // Get organization by ID
  static async getOrganizationById(id) {
    try {
      const response = await fetch(`${this.baseURL}/${id}`);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Organization not found');
      }

      return data;
    } catch (error) {
      console.error('Fetch organization error:', error);
      throw error;
    }
  }

  // Update organization
  static async updateOrganization(id, organizationData) {
    try {
      const formData = new FormData();
      
      // Add organization data
      Object.keys(organizationData).forEach(key => {
        if (key === 'logo' && organizationData[key] instanceof File) {
          formData.append('logo', organizationData[key]);
        } else if (organizationData[key] !== null && organizationData[key] !== undefined) {
          formData.append(key, organizationData[key]);
        }
      });

      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'PUT',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Update failed');
      }

      return data;
    } catch (error) {
      console.error('Update organization error:', error);
      throw error;
    }
  }

  // Delete organization
  static async deleteOrganization(id) {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Delete failed');
      }

      return data;
    } catch (error) {
      console.error('Delete organization error:', error);
      throw error;
    }
  }

  // Get candidates by organization
  static async getCandidatesByOrganization(id, params = {}) {
    try {
      const searchParams = new URLSearchParams(params);
      const response = await fetch(`${this.baseURL}/${id}/candidates?${searchParams}`);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch candidates');
      }

      return data;
    } catch (error) {
      console.error('Fetch candidates error:', error);
      throw error;
    }
  }

  // Add candidate to organization
  static async addCandidate(organizationId, candidateData) {
    try {
      const response = await fetch(`${this.baseURL}/${organizationId}/candidates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidateData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add candidate');
      }

      return data;
    } catch (error) {
      console.error('Add candidate error:', error);
      throw error;
    }
  }

  // Update candidate
  static async updateCandidate(organizationId, candidateId, candidateData) {
    try {
      const response = await fetch(`${this.baseURL}/${organizationId}/candidates/${candidateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidateData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update candidate');
      }

      return data;
    } catch (error) {
      console.error('Update candidate error:', error);
      throw error;
    }
  }

  // Remove candidate
  static async removeCandidate(organizationId, candidateId) {
    try {
      const response = await fetch(`${this.baseURL}/${organizationId}/candidates/${candidateId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove candidate');
      }

      return data;
    } catch (error) {
      console.error('Remove candidate error:', error);
      throw error;
    }
  }

  // Bulk add candidates
  static async bulkAddCandidates(organizationId, candidates) {
    try {
      const response = await fetch(`${this.baseURL}/${organizationId}/candidates/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ candidates }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to bulk add candidates');
      }

      return data;
    } catch (error) {
      console.error('Bulk add candidates error:', error);
      throw error;
    }
  }

  // Export candidates
  static async exportCandidates(organizationId, format = 'csv') {
    try {
      const response = await fetch(`${this.baseURL}/${organizationId}/candidates/export?format=${format}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to export candidates');
      }

      return response.blob();
    } catch (error) {
      console.error('Export candidates error:', error);
      throw error;
    }
  }

  // Search candidates
  static async searchCandidates(query, filters = {}) {
    try {
      const params = new URLSearchParams({ query, ...filters });
      const response = await fetch(`${this.baseURL}/search/candidates?${params}`);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      return data;
    } catch (error) {
      console.error('Search candidates error:', error);
      throw error;
    }
  }

  // Get dashboard statistics
  static async getDashboardStats() {
    try {
      const response = await fetch(`${this.baseURL}/dashboard/stats`);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch statistics');
      }

      return data;
    } catch (error) {
      console.error('Dashboard stats error:', error);
      throw error;
    }
  }
}

export default OrganizationService;