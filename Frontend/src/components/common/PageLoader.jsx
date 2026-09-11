// frontend/src/components/common/PageLoader.jsx
// Branded full-screen fallback shown while a lazy-loaded route chunk downloads.

const PageLoader = () => (
  <div className="min-h-screen w-full flex items-center justify-center bg-[#070a12]">
    <div className="flex flex-col items-center gap-5 animate-fade-in">
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full border-2 border-white/10" />
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{
            borderTopColor: 'var(--brand-t1)',
            borderRightColor: 'var(--brand-t1)',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <div
          className="absolute inset-[5px] rounded-full opacity-70 blur-sm"
          style={{ background: 'var(--brand-grad)' }}
        />
      </div>
      <p className="font-display text-sm font-semibold tracking-wide text-slate-400">
        Loading<span className="t-brand-grad">…</span>
      </p>
    </div>
  </div>
);

export default PageLoader;
