import Button from "@material/react-button";
import { Form, useForm } from "react-hook-form";
import styles from "./style.module.css";
import Modal, { ModalProps } from "@/components/Modal";

export type SortModalProps = Pick<ModalProps, "onClose" | "open">;

export default function SortModal({
  onClose,
  open,
}: SortModalProps): JSX.Element {
  const { control, register } = useForm({
    defaultValues: {
      hoge: "25",
    },
    progressive: true,
  });

  return (
    <Modal onClose={onClose} open={open}>
      <Form
        action="/api/filter"
        control={control}
        onSuccess={async ({ response }) => {
          const data = await response.json();

          console.log(data);

          onClose();
        }}
      >
        <div>
          <input {...register("hoge")} />
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
            ソートする
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
