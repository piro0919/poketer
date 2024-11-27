import pLimit from "p-limit";
import { Pokemon, PokemonClient, PokemonSpecies } from "pokenode-ts";
import sleep from "sleep-promise";
import App from "./_components/App";

type PokemonData = {
  pokemon: Pokemon;
  pokemonSpecies: PokemonSpecies;
};

const CONCURRENT_REQUESTS = 10;
const POKEMON_FETCH_DELAY = 250;
const POKEMON_LIMIT = process.env.NODE_ENV === "production" ? 1025 : 125;
const POKEMON_OFFSET = process.env.NODE_ENV === "production" ? 0 : 900;

export const revalidate = 604800; // 1週間

class PokemonService {
  private api: PokemonClient;
  private rateLimiter: ReturnType<typeof pLimit>;

  constructor() {
    this.api = new PokemonClient();
    this.rateLimiter = pLimit(CONCURRENT_REQUESTS);
  }

  async getPokemonSpecies(name: string): Promise<PokemonSpecies | null> {
    try {
      return await this.api.getPokemonSpeciesByName(name);
    } catch (e) {
      // ハイフン付きの名前の場合、ハイフン前の部分で再試行
      const [baseName] = name.split("-");

      if (baseName !== name) {
        try {
          return await this.api.getPokemonSpeciesByName(baseName);
        } catch (error) {
          console.error(
            `Failed to fetch species for ${name} and ${baseName}:`,
            error,
          );

          return null;
        }
      }

      console.error(`Failed to fetch species for ${name}:`, e);

      return null;
    }
  }

  async fetchPokemonData(name: string): Promise<PokemonData | null> {
    await sleep(POKEMON_FETCH_DELAY);

    try {
      const [pokemon, pokemonSpecies] = await Promise.all([
        this.api.getPokemonByName(name),
        this.getPokemonSpecies(name),
      ]);

      if (!pokemon || !pokemonSpecies) {
        return null;
      }

      return { pokemon, pokemonSpecies };
    } catch (error) {
      console.error(`Failed to fetch data for ${name}:`, error);

      return null;
    }
  }

  async fetchAllPokemon(): Promise<PokemonData[]> {
    try {
      // offset + limit <= 1025
      const { results } = await this.api.listPokemons(
        POKEMON_OFFSET,
        POKEMON_LIMIT,
      );
      const pokemonDataPromises = results.map(({ name }) =>
        this.rateLimiter(() => this.fetchPokemonData(name)),
      );
      const pokemonData = await Promise.all(pokemonDataPromises);

      return pokemonData.filter((data): data is PokemonData => data !== null);
    } catch (error) {
      console.error("Failed to fetch Pokemon list:", error);

      return [];
    }
  }
}

export default async function Page(): Promise<JSX.Element> {
  const pokemonService = new PokemonService();
  const pokemons = await pokemonService.fetchAllPokemon();

  return <App pokemons={pokemons} />;
}
