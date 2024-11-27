"use client";
import { IconFilter, IconSearch } from "@tabler/icons-react";
import {
  SortingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { camelCase } from "change-case";
import Image from "next/image";
import {
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
  useQueryState,
} from "nuqs";
import { Pokemon, PokemonSpecies } from "pokenode-ts";
import { useMemo, useState } from "react";
import Spacer from "react-spacer";
import FilterModal from "../FilterModal";
import SearchModal from "../SearchModal";
import SortModal from "../SortModal";
import styles from "./style.module.css";

type PokemonData = {
  aBaseStat: number;
  bBaseStat: number;
  cBaseStat: number;
  dBaseStat: number;
  enableAttackTypeFilter: boolean;
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
    cell: (info) => {
      const {
        row: {
          original: { aBaseStat, cBaseStat, enableAttackTypeFilter },
        },
      } = info;

      if (!enableAttackTypeFilter) {
        return info.renderValue();
      }

      return (
        <span style={{ opacity: aBaseStat >= cBaseStat ? 1 : 0.25 }}>
          {info.renderValue()}
        </span>
      );
    },
    header: "攻撃",
  }),
  columnHelper.accessor("bBaseStat", {
    header: "防御",
  }),
  columnHelper.accessor("cBaseStat", {
    cell: (info) => {
      const {
        row: {
          original: { aBaseStat, cBaseStat, enableAttackTypeFilter },
        },
      } = info;

      if (!enableAttackTypeFilter) {
        return info.renderValue();
      }

      return (
        <span style={{ opacity: cBaseStat >= aBaseStat ? 1 : 0.25 }}>
          {info.renderValue()}
        </span>
      );
    },
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
          ({ language: { name } }) => name === "ja-Hrkt",
        ),
      })),
    [pokemons],
  );
  const [attackType] = useQueryState(
    "attack_type",
    parseAsStringLiteral(["max"] as const),
  );
  const [filters] = useQueryState("filters", parseAsArrayOf(parseAsString));
  const enableAttackTypeFilter = useMemo(
    () => attackType === "max",
    [attackType],
  );
  const typeFilters = useMemo(
    () =>
      filters
        ?.map((filter) => {
          const match = filter.match(/(\w+)\[(\w+)\](\w+)/);

          if (!match) {
            return undefined;
          }

          const [, name, compare, value] = match;

          return {
            compare: camelCase(compare),
            name,
            value: parseInt(value, 10),
          };
        })
        .filter((filter): filter is NonNullable<typeof filter> => !!filter),
    [filters],
  );
  const data = useMemo(
    () =>
      jaPokemons
        .map(
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
            enableAttackTypeFilter,
            frontFefault,
            hBaseStat,
            name,
            sBaseStat,
            total:
              bBaseStat +
              dBaseStat +
              hBaseStat +
              sBaseStat +
              (enableAttackTypeFilter
                ? Math.max(aBaseStat, cBaseStat)
                : aBaseStat + cBaseStat),
          }),
        )
        .filter(
          ({
            aBaseStat,
            bBaseStat,
            cBaseStat,
            dBaseStat,
            hBaseStat,
            sBaseStat,
            total,
          }) =>
            typeFilters?.every(({ compare, name, value }) => {
              const statMap = {
                a: aBaseStat,
                b: bBaseStat,
                c: cBaseStat,
                d: dBaseStat,
                h: hBaseStat,
                s: sBaseStat,
                t: total,
              };
              const compareMap = {
                default: (): boolean => true,
                equals: (a: number, b: number): boolean => a === b,
                greaterThan: (a: number, b: number): boolean => a >= b,
                lessThan: (a: number, b: number): boolean => a <= b,
              } as const;
              const compareFunc =
                compareMap[compare as keyof typeof compareMap] ??
                compareMap.default;

              return compareFunc(statMap[name as keyof typeof statMap], value);
            }) ?? true,
        ),
    [enableAttackTypeFilter, jaPokemons, typeFilters],
  );
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });
  const [openId, setOpenId] = useState("");

  return (
    <>
      <header className={styles.header}>
        <h1>ポケター</h1>
        <Spacer grow={1} />
        <button onClick={() => setOpenId("filter")}>
          <IconFilter />
        </button>
        <button onClick={() => setOpenId("search")}>
          <IconSearch />
        </button>
        {/* <button onClick={() => setOpenId("sort")}>
          <IconArrowsSort />
        </button> */}
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
                          header.getContext(),
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
      <FilterModal onClose={() => setOpenId("")} open={openId === "filter"} />
      <SearchModal onClose={() => setOpenId("")} open={openId === "search"} />
      <SortModal onClose={() => setOpenId("")} open={openId === "sort"} />
    </>
  );
}
