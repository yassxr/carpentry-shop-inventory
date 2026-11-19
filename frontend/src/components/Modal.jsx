import { Icon, icons } from "./Icon";

export default function Modal({ title, children, footer, onClose, style }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={style} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          {title}
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ color: "white", border: "1px solid rgba(255,255,255,0.3)" }}>
            <Icon path={icons.x} size={14} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
