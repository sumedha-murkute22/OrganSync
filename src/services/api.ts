/**
 * OrganSync - Frontend API Service Client
 * 
 * Communicates with the backend REST endpoints and C engine integration.
 */

const API_BASE = 'http://localhost:5000/api';

class ApiClient {
  private currentRole: string = 'Transplant Coordinator';

  public setRole(role: string) {
    this.currentRole = role;
  }

  public getRole(): string {
    return this.currentRole;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-organsync-role': this.currentRole,
      ...(options.headers as Record<string, string> || {}),
    };

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `API error ${res.status}: ${res.statusText}`);
      }

      return await res.json();
    } catch (err: any) {
      console.warn(`[OrganSync API Client] Request to ${endpoint} failed:`, err.message);
      throw err;
    }
  }

  // Health
  public async getHealth() {
    return this.request<{ status: string; service: string; c_engine_binary_present: boolean }>('/health');
  }

  // Auth & Roles
  public async getMe() {
    return this.request<{ user: any; availableRoles: any[] }>('/auth/me');
  }

  public async switchRole(role: string) {
    this.setRole(role);
    return this.request<{ token: string; user: any }>('/auth/switch-role', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  }

  // Donors
  public async getDonors() {
    return this.request<{ donors: any[] }>('/donors');
  }

  public async createDonor(data: any) {
    return this.request<{ donor: any }>('/donors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Organs
  public async getOrgans() {
    return this.request<{ organs: any[] }>('/organs');
  }

  public async createOrgan(data: any) {
    return this.request<{ organ: any }>('/organs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateOrgan(id: string, data: any) {
    return this.request<{ organ: any }>(`/organs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Recipients
  public async getRecipients() {
    return this.request<{ recipients: any[] }>('/recipients');
  }

  public async createRecipient(data: any) {
    return this.request<{ recipient: any }>('/recipients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateRecipient(id: string, data: any) {
    return this.request<{ recipient: any }>(`/recipients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Matching Engine
  public async assessMatches(organId: string) {
    return this.request<{ organ: any; matchingResult: any; policyVersion: string }>('/matching/assess', {
      method: 'POST',
      body: JSON.stringify({ organId }),
    });
  }

  // Allocation Cases
  public async getAllocations() {
    return this.request<{ cases: any[] }>('/allocations');
  }

  public async createAllocation(data: { organId: string; recipientId: string; totalScore: number; rank: number }) {
    return this.request<{ case: any }>('/allocations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async approveAllocation(caseId: string, reason: string) {
    return this.request<{ case: any; transport?: any }>(`/allocations/${caseId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  public async declineAllocation(caseId: string, reason: string) {
    return this.request<{ case: any }>(`/allocations/${caseId}/decline`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Transports
  public async getTransports() {
    return this.request<{ transports: any[] }>('/transports');
  }

  public async updateTransportCheckpoint(transportId: string, data: { milestoneNumber: number; status: string; temperatureC?: number }) {
    return this.request<{ transport: any }>(`/transports/${transportId}/checkpoints`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Surgeries
  public async getSurgeries() {
    return this.request<{ surgeries: any[] }>('/surgeries');
  }

  public async updateSurgicalMilestone(surgeryId: string, data: { milestone: string; surgicalStatus: string; notes?: string }) {
    return this.request<{ surgery: any }>(`/surgeries/${surgeryId}/milestones`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Outcomes
  public async getOutcomes() {
    return this.request<{ followUps: any[] }>('/outcomes');
  }

  public async createOutcome(data: any) {
    return this.request<{ followUp: any }>('/outcomes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Notifications
  public async getNotifications() {
    return this.request<{ notifications: any[] }>('/notifications');
  }

  // Audit Logs
  public async getAuditLogs() {
    return this.request<{ totalEvents: number; auditLogs: any[] }>('/audit-events');
  }

  // Reports
  public async getReports() {
    return this.request<any>('/reports');
  }

  // C DSA Engine Actions
  public async runDsaTests() {
    return this.request<any>('/dsa/test');
  }

  public async calculateDsaRoute(source: string, destination: string) {
    return this.request<any>('/dsa/route', {
      method: 'POST',
      body: JSON.stringify({ source, destination }),
    });
  }
}

export const api = new ApiClient();
