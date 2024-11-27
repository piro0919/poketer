import { ReactNode } from "react";
import {
  Modal as ReactResponsiveModal,
  ModalProps as ReactResponsiveModalProps,
} from "react-responsive-modal";
import styles from "./style.module.css";

export type ModalProps = Pick<ReactResponsiveModalProps, "onClose" | "open"> & {
  children: ReactNode;
};

export default function Modal({
  children,
  onClose,
  open,
}: ModalProps): JSX.Element {
  return (
    <ReactResponsiveModal
      center={true}
      classNames={{
        closeButton: styles.closeButton,
        modal: styles.modal,
      }}
      onClose={onClose}
      open={open}
    >
      {children}
    </ReactResponsiveModal>
  );
}
