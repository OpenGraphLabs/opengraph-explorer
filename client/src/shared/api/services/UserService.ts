import { ApiClient } from '../client';
import type {
  UserCreate,
  UserUpdate,
  UserRead
} from '../generated/models';

export class UserService {
  constructor(private apiClient: ApiClient) {}

  // Get current user
  async getCurrentUser() {
    const response = await this.apiClient.users.getCurrentUserInfoApiV1UsersMeGet();
    return response.data as UserRead;
  }

  // Get user by ID
  async getUserById(userId: number) {
    const response = await this.apiClient.users.getUserApiV1UsersUserIdGet({
      userId
    });
    return response.data as UserRead;
  }

  // Create user
  async createUser(data: UserCreate) {
    const response = await this.apiClient.users.createUserApiV1UsersPost({
      userCreate: data
    });
    return response.data as UserRead;
  }

  // Update user
  async updateUser(userId: number, data: UserUpdate) {
    const response = await this.apiClient.users.updateUserApiV1UsersUserIdPut({
      userId,
      userUpdate: data
    });
    return response.data as UserRead;
  }

  // Delete user
  async deleteUser(userId: number) {
    const response = await this.apiClient.users.deleteUserApiV1UsersUserIdDelete({
      userId
    });
    return response.data;
  }

  // Update user profile
  async updateProfile(data: UserUpdate) {
    const response = await this.apiClient.users.updateCurrentUserApiV1UsersMePut({
      userUpdate: data
    });
    return response.data as UserRead;
  }

  // Get user datasets
  async getUserDatasets(userId: number, params: { skip?: number; limit?: number } = {}) {
    const response = await this.apiClient.getAxiosInstance().get(
      `/api/v1/users/${userId}/datasets`,
      { params }
    );
    return response.data;
  }

  // Get user annotations
  async getUserAnnotations(userId: number, params: { skip?: number; limit?: number } = {}) {
    const response = await this.apiClient.getAxiosInstance().get(
      `/api/v1/users/${userId}/annotations`,
      { params }
    );
    return response.data;
  }
} 