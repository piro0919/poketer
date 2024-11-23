"use client";
import { Pokemon, PokemonSpecies } from "pokenode-ts";
import { useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import styles from "./style.module.css";
import Image from "next/image";
import { IconSearch, IconArrowsSort } from "@tabler/icons-react";
import Spacer from "react-spacer";
import SearchModal from "../SearchModal";
import SortModal from "../SortModal";

type PokemonData = {
  aBaseStat: number;
  bBaseStat: number;
  cBaseStat: number;
  dBaseStat: number;
  frontFefault: string | null;
  hBaseStat: number;
  name: string;
  sBaseStat: number;
  total: number;
};

const columnHelper = createColumnHelper<PokemonData>();

const columns = [
  columnHelper.accessor("frontFefault", {
    cell: (info) => (
      <Image alt="" height={36} src={info.getValue() ?? ""} width={36} />
    ),
    header: "",
  }),
  columnHelper.accessor("name", {
    header: "",
  }),
  columnHelper.accessor("hBaseStat", {
    header: "HP",
  }),
  columnHelper.accessor("aBaseStat", {
    header: "攻撃",
  }),
  columnHelper.accessor("bBaseStat", {
    header: "防御",
  }),
  columnHelper.accessor("cBaseStat", {
    header: "特攻",
  }),
  columnHelper.accessor("dBaseStat", {
    header: "特防",
  }),
  columnHelper.accessor("sBaseStat", {
    header: "素早",
  }),
  columnHelper.accessor("total", {
    header: "合計",
  }),
];

export type AppProps = {
  pokemons: {
    pokemon: Pokemon;
    pokemonSpecies: PokemonSpecies;
  }[];
};

export default function App({ pokemons }: AppProps): JSX.Element {
  const jaPokemons = useMemo(
    () =>
      pokemons.map(({ pokemon, pokemonSpecies }) => ({
        ...pokemon,
        ...pokemonSpecies.names.find(
          ({ language: { name } }) => name === "ja-Hrkt"
        ),
      })),
    [pokemons]
  );
  const data = useMemo(
    () =>
      jaPokemons.map(
        ({
          name,
          sprites: { front_default: frontFefault },
          stats: [
            { base_stat: hBaseStat },
            { base_stat: aBaseStat },
            { base_stat: bBaseStat },
            { base_stat: cBaseStat },
            { base_stat: dBaseStat },
            { base_stat: sBaseStat },
          ],
        }) => ({
          aBaseStat,
          bBaseStat,
          cBaseStat,
          dBaseStat,
          frontFefault,
          hBaseStat,
          name,
          sBaseStat,
          total:
            aBaseStat +
            bBaseStat +
            cBaseStat +
            dBaseStat +
            hBaseStat +
            sBaseStat,
        })
      ),
    [jaPokemons]
  );
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    columns,
    data,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  const [openId, setOpenId] = useState("");

  console.log(jaPokemons[0]);

  return (
    <>
      <header className={styles.header}>
        <h1>ポケター</h1>
        <Spacer grow={1} />
        <button onClick={() => setOpenId("sort")}>
          <IconArrowsSort />
        </button>
        <button onClick={() => setOpenId("search")}>
          <IconSearch />
        </button>
      </header>
      <main className={styles.main}>
        <table className={styles.table}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th className={styles.th} key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td className={styles.td} key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </main>
      <SortModal open={openId === "sort"} onClose={() => setOpenId("")} />
      <SearchModal open={openId === "search"} onClose={() => setOpenId("")} />
    </>
  );
}
