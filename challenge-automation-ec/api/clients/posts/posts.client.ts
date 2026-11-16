import { endpoints } from '../../config/endpoints';
import { ApiClient } from '../api-client';

export interface CreatePostPayload {
  title: string;
  body: string;
  userId: number;
}

export interface CreatedPostResponse extends CreatePostPayload {
  id: number;
}

export class PostsClient extends ApiClient {
  create(payload: CreatePostPayload) {
    return this.send<CreatedPostResponse>('POST', endpoints.posts, payload);
  }
}
