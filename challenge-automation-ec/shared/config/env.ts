import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'dotenv';

export function loadEnvironment() {
  const name = process.env.TEST_ENV?.trim().toLowerCase() || 'qa';
  if (!/^[a-z0-9-]+$/.test(name)) throw new Error(`Invalid TEST_ENV: ${name}`);

  const file = path.resolve(__dirname, '../..', `.env.${name}`);
  const env: Record<string, string> = existsSync(file) ? parse(readFileSync(file)) : {};
  const get = (key: string, fallback = '') => process.env[key] ?? env[key] ?? fallback;
  const secretKey = get('SECRET_KEY');
  if (!secretKey.trim()) throw new Error(`SECRET_KEY missing in ${name}`);

  return {
    secretKey,
    pokemonApiUrl: get('POKEMON_API_URL', 'https://pokeapi.co/api/v2'),
    postsApiUrl: get('POSTS_API_URL', 'https://jsonplaceholder.typicode.com'),
    wikipediaUrl: get('WIKIPEDIA_URL', 'https://en.wikipedia.org'),
  };
}

export type EnvironmentConfig = ReturnType<typeof loadEnvironment>;
