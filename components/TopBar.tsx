'use client';
import { MONTHS } from '@/lib/types';

export default function TopBar({
  monthDate, onPrev, onNext,
}: { monthDate: Date; onPrev: () => void; onNext: () => void }) {
  return (
    <div className="flex items-center justify-between px-[18px] pt-[18px] pb-2">
      <div className="flex items-center gap-3.5 text-sm font-semibold tracking-wide">
        <i className="ti ti-chevron-left text-pink-400 cursor-pointer p-1" onClick={onPrev} />
        <span>{MONTHS[monthDate.getMonth()].toUpperCase()} {monthDate.getFullYear()}</span>
        <i className="ti ti-chevron-right text-pink-400 cursor-pointer p-1" onClick={onNext} />
      </div>
    </div>
  );
}
