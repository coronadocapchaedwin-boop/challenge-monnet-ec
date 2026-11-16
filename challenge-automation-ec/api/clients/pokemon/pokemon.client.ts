import { endpoints } from '../../config/endpoints';
import { ApiClient } from '../api-client';

export interface PokemonResponse {
  id: number;
  name: string;
  abilities: Array<{ ability: { name: string } }>;
}

export class PokemonClient extends ApiClient {
  getById(id: number) {
    return this.send<PokemonResponse>('GET', `${endpoints.pokemon}/${id}`);
  }

  getByName(name: string) {
    return this.send<PokemonResponse>('GET', `${endpoints.pokemon}/${encodeURIComponent(name)}`);
  }
}
