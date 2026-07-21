'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/dashboard', icon: 'ti-home', label: 'Beranda' },
  { href: '/dashboard/wawasan', icon: 'ti-chart-donut', label: 'Wawasan' },
  { href: '/dashboard/transaksi', icon: 'ti-list', label: 'Transaksi' },
  { href: '/dashboard/akun', icon: 'ti-building-bank', label: 'Akun' },
];

export default function BottomNav({ onAdd }: { onAdd: () => void }) {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white border-t border-pink-100 flex justify-around items-center px-1.5 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] z-50">
      {ITEMS.map((item, i) => {
        const active = pathname === item.href;
        const el = (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 text-[9px] px-2.5 ${active ? 'text-pink-600' : 'text-gray-400'}`}
          >
            <i className={`ti ${item.icon} text-xl`} />
            {item.label}
          </Link>
        );
        if (i === 1) {
          return (
            <div key="withfab" className="contents">
              {el}
              <button
                onClick={onAdd}
                className="w-12 h-12 rounded-full bg-pink-400 flex items-center justify-center -mt-8 shadow-lg shadow-pink-300/50 border-4 border-bg text-white text-xl"
              >
                <i className="ti ti-plus" />
              </button>
            </div>
          );
        }
        return el;
      })}
    </div>
  );
}
