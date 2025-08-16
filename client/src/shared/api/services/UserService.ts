import { ApiClient } from "../client";
import type { UserProfile } from "../generated";

export class UserService {
  constructor(private apiClient: ApiClient) {}

  // Get current user profile
  async getCurrentUserProfile() {
    const response = await this.apiClient.users.getCurrentUserProfileApiV1UsersMeProfileGet();
    return response.data as UserProfile;
  }
}
