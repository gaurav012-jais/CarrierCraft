import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function Layout({ children, title = 'Dashboard' }) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="pl-64 flex-1 flex flex-col min-w-0">
        <Header title={title} />
        <main className="w-full pt-16 flex-1 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
