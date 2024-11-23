import { Modal, ModalProps } from "react-responsive-modal";

export type SortModalProps = Pick<ModalProps, "open" | "onClose">;

export default function SortModal({
  onClose,
  open,
}: SortModalProps): JSX.Element {
  return (
    <Modal open={open} onClose={onClose} center={true}>
      <h2>sort</h2>
    </Modal>
  );
}
