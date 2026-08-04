import Sidebar from './Sidebar';

export default function Layout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />
      <main className="flex-1 px-8 py-8 max-w-6xl">
        {(title || subtitle) && (
          <header className="mb-8">
            {title && <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>}
            {subtitle && <p className="text-muted text-sm mt-1">{subtitle}</p>}
          </header>
        )}
        {children}
      </main>
    </div>
  );
}
