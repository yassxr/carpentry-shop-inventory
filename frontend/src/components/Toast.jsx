import { useEffect } from "react";
import { Icon, icons } from "./Icon";

export default function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`toast ${type}`}>
      <Icon path={type === "success" ? icons.check : icons.x} size={16} />
      {msg}
    </div>
  );
}
