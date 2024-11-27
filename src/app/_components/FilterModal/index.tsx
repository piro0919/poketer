import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@material/react-button";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { Controller, Form, useForm } from "react-hook-form";
import Toggle from "react-toggle";
import { z } from "zod";
import styles from "./style.module.css";
import { FilterData } from "@/app/api/filter/route";
import Modal, { ModalProps } from "@/components/Modal";

const schema = z.object({
  attackType: z.boolean(),
});

type FieldTypes = z.infer<typeof schema>;

export type FilterModalProps = Pick<ModalProps, "onClose" | "open">;

export default function FilterModal({
  onClose,
  open,
}: FilterModalProps): JSX.Element {
  const [attackType, setAttackType] = useQueryState(
    "attack_type",
    parseAsStringLiteral(["max"] as const),
  );
  const { control } = useForm<FieldTypes>({
    defaultValues: {
      attackType: attackType === "max",
    },
    progressive: true,
    resolver: zodResolver(schema),
  });

  return (
    <Modal onClose={onClose} open={open}>
      <Form
        action="/api/filter"
        control={control}
        onSuccess={async ({ response }) => {
          const { attackType } = (await response.json()) as FilterData;

          await setAttackType(attackType ? "max" : null);

          onClose();
        }}
      >
        <div className={styles.fieldsWrapper}>
          <div className={styles.field}>
            <label>攻撃と特攻の大きい方のみ表示する</label>
            <Controller
              control={control}
              name="attackType"
              render={({ field: { onChange, ref, value } }) => (
                <Toggle
                  checked={value}
                  defaultChecked={attackType === "max"}
                  onChange={(e) => onChange(e.target.checked)}
                  ref={ref}
                />
              )}
            />
          </div>
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
            フィルターする
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
