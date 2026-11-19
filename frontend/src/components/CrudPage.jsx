import { useState } from "react";
import { Icon, icons } from "./Icon";
import Modal from "./Modal";

export default function CrudPage({ title, icon, items, columns, renderRow, onDelete, onInfo, addForm }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <div className="page-header">
        <h2>{title}</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Icon path={icons.plus} size={16} /> Ajouter
        </button>
      </div>
      <div className="card">
        <div className="card-header">
          <span><Icon path={icon} size={16} /> {items.length} enregistrements</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {columns.map(c => <th key={c}>{c}</th>)}
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} style={{ textAlign: "center", color: "var(--gray-400)", padding: 24 }}>
                    Aucun enregistrement
                  </td>
                </tr>
              ) : items.map(item => (
                <tr key={item.id}>
                  {renderRow(item)}
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      {onInfo && (
                        <button className="btn btn-info btn-sm" onClick={() => onInfo(item)}>
                          <Icon path={icons.info} size={13} />
                        </button>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => onDelete(item.id)}>
                        <Icon path={icons.trash} size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <Modal
          title={`Ajouter — ${title}`}
          onClose={() => setShowModal(false)}
          footer={<button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>Fermer</button>}
        >
          {addForm(() => setShowModal(false))}
        </Modal>
      )}
    </div>
  );
}
