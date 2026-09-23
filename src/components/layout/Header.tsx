import { Bell, Search, User } from 'lucide-react';

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between bg-white px-8 shadow-sm border-b border-slate-200">
      <div className="flex w-full max-w-md items-center gap-2 rounded-full bg-slate-100 px-4 py-2 transition-shadow focus-within:ring-2 focus-within:ring-primary-500/50">
        <Search className="h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search vehicles, customers, or bookings..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500"
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            3
          </span>
        </button>
        
        <div className="h-8 w-[1px] bg-slate-200" />

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-700 ring-2 ring-white group-hover:ring-primary-100 transition-all">
            <User className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-700">Admin User</span>
            <span className="text-xs text-slate-500">Fleet Manager</span>
          </div>
        </div>
      </div>
    </header>
  );
}
