import App from "./_components/App";
import { PokemonClient } from "pokenode-ts";
import pLimit from "p-limit";

// キャッシュは 1 日ごと
export const revalidate = 86400;

export default async function Page(): Promise<JSX.Element> {
  const api = new PokemonClient();
  // offset + limit <= 1025
  const { results } = await api.listPokemons(0, 1025);
  const limit = pLimit(5);
  const fetchPokemonData = async (name: string) => ({
    pokemon: await api.getPokemonByName(name),
    pokemonSpecies: await api.getPokemonSpeciesByName(name),
  });
  const input = results.map(({ name }) => limit(() => fetchPokemonData(name)));
  const pokemons = await Promise.all(input);

  return <App pokemons={pokemons} />;
}
