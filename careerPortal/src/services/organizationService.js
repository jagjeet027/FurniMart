  const API_BASE_URL = 'http://localhost:5000/api';

  class OrganizationService {
    async register(organizationData, candidates) {
      try {
        console.log('Submitting registration data:', {
          organization: organizationData,
          candidatesCount: candidates.length
        });

        const formData = new FormData();
        
        // Remove logo from organizationData before stringifying
        const { logo, ...orgDataWithoutLogo } = organizationData;
        
        formData.append('organizationData', JSON.stringify(orgDataWithoutLogo));
        formData.append('candidates', JSON.stringify(candidates));
        
        if (logo && logo instanceof File) {
          formData.append('logo', logo);
          console.log('Logo file attached:', logo.name, logo.size);
        }

        console.log('Making request to:', `${API_BASE_URL}/organizations`);
        
        const response = await fetch(`${API_BASE_URL}/organizations`, {
          method: 'POST',
          body: formData
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        let data;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          // If response is not JSON, get it as text for debugging
          const textResponse = await response.text();
          console.error('Non-JSON response:', textResponse);
          throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
        }
        
        console.log('Response data:', data);
        
        if (!response.ok) {
          const errorMessage = data.error || data.message || `HTTP ${response.status}: ${response.statusText}`;
          throw new Error(errorMessage);
        }
        
        return data;
      } catch (error) {
        console.error('Registration error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        
        // If it's a network error
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new Error('Network error: Unable to connect to server. Please check if the server is running.');
        }
        
        // If it's a server error with specific message
        if (error.message.includes('HTTP')) {
          throw new Error(`Server error: ${error.message}`);
        }
        
        throw error;
      }
    }

    async getAllOrganizations(params = {}) {
      try {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE_URL}/organizations?${queryString}`);
        
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

    async getOrganizationById(id) {
      try {
        const response = await fetch(`${API_BASE_URL}/organizations/${id}`);
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch organization');
        }
        
        return data;
      } catch (error) {
        console.error('Fetch organization error:', error);
        throw error;
      }
    }

    async updateOrganization(id, organizationData) {
      try {
        const formData = new FormData();
        
        const { logo, ...orgDataWithoutLogo } = organizationData;
        
        Object.keys(orgDataWithoutLogo).forEach(key => {
          formData.append(key, orgDataWithoutLogo[key]);
        });
        
        if (logo && logo instanceof File) {
          formData.append('logo', logo);
        }

        const response = await fetch(`${API_BASE_URL}/organizations/${id}`, {
          method: 'PUT',
          body: formData
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

    async deleteOrganization(id) {
      try {
        const response = await fetch(`${API_BASE_URL}/organizations/${id}`, {
          method: 'DELETE'
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

    async addCandidate(organizationId, candidateData) {
      try {
        const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/candidates`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(candidateData)
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

    async updateCandidate(organizationId, candidateId, candidateData) {
      try {
        const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/candidates/${candidateId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(candidateData)
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

    async removeCandidate(organizationId, candidateId) {
      try {
        const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/candidates/${candidateId}`, {
          method: 'DELETE'
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

    async getCandidatesByOrganization(organizationId, params = {}) {
      try {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/candidates?${queryString}`);
        
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

    async bulkAddCandidates(organizationId, candidates) {
      try {
        const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/candidates/bulk`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ candidates })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Bulk add failed');
        }
        
        return data;
      } catch (error) {
        console.error('Bulk add candidates error:', error);
        throw error;
      }
    }

    async exportCandidates(organizationId, format = 'json') {
      try {
        const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/candidates/export?format=${format}`);
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Export failed');
        }
        
        if (format === 'csv') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `candidates-${organizationId}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          return { success: true, message: 'CSV downloaded successfully' };
        } else {
          return response.json();
        }
      } catch (error) {
        console.error('Export candidates error:', error);
        throw error;
      }
    }

    async searchCandidates(params = {}) {
      try {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE_URL}/organizations/search/candidates?${queryString}`);
        
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

    async getDashboardStats() {
      try {
        const response = await fetch(`${API_BASE_URL}/organizations/dashboard/stats`);
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch stats');
        }
        
        return data;
      } catch (error) {
        console.error('Fetch dashboard stats error:', error);
        throw error;
      }
    }

    // Helper method to test connection
    async testConnection() {
      try {
        console.log('Testing connection to:', API_BASE_URL);
        const response = await fetch(`${API_BASE_URL}/health`, {
          method: 'GET'
        });
        
        console.log('Health check response:', response.status);
        return response.ok;
      } catch (error) {
        console.error('Connection test failed:', error);
        return false;
      }
    }
  }

  export default new OrganizationService();