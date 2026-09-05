import { ReactNode } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
  closeOnOverlayClick = true,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  closeOnOverlayClick?: boolean;
}) {
  if (!open) return null;
  return (
    <div
      className="modal-overlay"
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button
            onClick={onClose}
            className="drawer-close"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}