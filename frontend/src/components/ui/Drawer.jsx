const Drawer = ({ open, onClose, title, subtitle, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="fixed inset-0 bg-black/20 transition-opacity"
        onClick={onClose}
        aria-label="Tutup drawer"
      />
      <div className="relative h-full w-full max-w-xl overflow-y-auto bg-surface shadow-2xl z-10 flex flex-col">
        <div className="border-b border-border/70 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text-primary">{title}</p>
              {subtitle ? <p className="text-xs text-text-secondary">{subtitle}</p> : null}
            </div>
            <button
              type="button"
              className="rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold hover:bg-background transition-colors"
              onClick={onClose}
            >
              Tutup
            </button>
          </div>
        </div>
        <div className="px-6 py-4 flex-1">{children}</div>
      </div>
    </div>
  );
};

export default Drawer;
