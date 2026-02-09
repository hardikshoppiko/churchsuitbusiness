let modalHandler = null;

export function registerModalHandler(fn) {
  modalHandler = fn;
}

export function openModal(config) {
  if (!modalHandler) return;
  modalHandler({
    ...config,
    show: true,
  });
}

export function closeModal() {
  if (!modalHandler) return;
  modalHandler((prev) => ({ ...prev, show: false }));
}