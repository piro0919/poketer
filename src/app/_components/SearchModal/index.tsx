import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@material/react-button";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { camelCase, snakeCase } from "change-case";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { useMemo } from "react";
import { Form, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import styles from "./style.module.css";
import { SearchData } from "@/app/api/search/route";
import Modal, { ModalProps } from "@/components/Modal";

const schema = z.object({
  filters: z.array(
    z.object({
      compare: z.union([
        z.literal("equals"),
        z.literal("greaterThan"),
        z.literal("lessThan"),
      ]),
      name: z.union([
        z.literal("a"),
        z.literal("b"),
        z.literal("c"),
        z.literal("d"),
        z.literal("h"),
        z.literal("s"),
        z.literal("t"),
      ]),
      value: z.number(),
    }),
  ),
});

export type SearchModalProps = Pick<ModalProps, "onClose" | "open">;

type FieldTypes = z.infer<typeof schema>;

export default function SearchModal({
  onClose,
  open,
}: SearchModalProps): JSX.Element {
  const [filters, setFilters] = useQueryState(
    "filters",
    parseAsArrayOf(parseAsString),
  );
  const defaultFilters = useMemo(
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
  const { control, register } = useForm<FieldTypes>({
    defaultValues: {
      filters: (defaultFilters as FieldTypes["filters"] | undefined) ?? [
        {
          compare: "greaterThan",
          name: "h",
          value: 100,
        },
      ],
    },
    progressive: true,
    resolver: zodResolver(schema),
  });
  const { append, fields, remove } = useFieldArray({
    control,
    name: "filters",
  });

  return (
    <Modal onClose={onClose} open={open}>
      <Form
        action="/api/search"
        control={control}
        onSubmit={({ data: { filters }, formData }) =>
          formData.append("filters", JSON.stringify(filters))
        }
        onSuccess={async ({ response }) => {
          const { filters } = (await response.json()) as SearchData;

          await setFilters(
            filters.map(
              ({ compare, name, value }) =>
                `${name}[${snakeCase(compare)}]${value}`,
            ),
          );

          onClose();
        }}
      >
        <div className={styles.fieldsWrapper}>
          <ul className={styles.filtersList}>
            {fields.map((field, index) => (
              <li className={styles.field} key={field.id}>
                <select
                  {...register(`filters.${index}.name`)}
                  className={styles.select}
                >
                  <option value="h">HP</option>
                  <option value="a">攻撃</option>
                  <option value="b">防御</option>
                  <option value="c">特攻</option>
                  <option value="d">特防</option>
                  <option value="s">素早</option>
                  <option value="t">合計</option>
                </select>
                <span>が</span>
                <input
                  {...register(`filters.${index}.value`, {
                    valueAsNumber: true,
                  })}
                  className={styles.input}
                  max={720}
                  min={1}
                  step={1}
                  type="number"
                />
                <select
                  {...register(`filters.${index}.compare`)}
                  className={styles.select}
                >
                  <option value="greaterThan">以上</option>
                  <option value="equals">一致</option>
                  <option value="lessThan">以下</option>
                </select>
                {fields.length === index + 1 ? (
                  <button
                    onClick={() =>
                      append({
                        compare: "greaterThan",
                        name: "h",
                        value: 100,
                      })
                    }
                    type="button"
                  >
                    <IconPlus />
                  </button>
                ) : (
                  <button onClick={() => remove(index)} type="button">
                    <IconMinus />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.buttonsWrapper}>
          <Button
            className={styles.button}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            placeholder={undefined}
            raised={true}
            type="submit"
          >
            検索する
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
