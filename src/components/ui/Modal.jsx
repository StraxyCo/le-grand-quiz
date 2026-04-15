import React from 'react'

export function Modal({ children, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

export function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <Modal onClose={onCancel}>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '1.05rem',
        color: 'var(--white)',
        marginBottom: 28,
        lineHeight: 1.5,
        textAlign: 'center',
      }}>
        {message}
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button className="btn btn-secondary" onClick={onCancel}>Annuler</button>
        <button className="btn btn-danger" onClick={onConfirm}>Confirmer</button>
      </div>
    </Modal>
  )
}
