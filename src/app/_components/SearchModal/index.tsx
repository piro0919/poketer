import { Modal, ModalProps } from "react-responsive-modal";
import { Form, useForm } from "react-hook-form";

export type SearchModalProps = Pick<ModalProps, "open" | "onClose">;

export default function SearchModal({
  onClose,
  open,
}: SearchModalProps): JSX.Element {
  const { control, register } = useForm({
    defaultValues: {
      hoge: "25",
    },
    progressive: true,
  });

  return (
    <Modal open={open} onClose={onClose} center={true}>
      <br />
      <br />
      <Form action="/api/search" control={control} method="post">
        <input {...register("hoge")} />
        <button type="submit">submit</button>
      </Form>
    </Modal>
  );
}
