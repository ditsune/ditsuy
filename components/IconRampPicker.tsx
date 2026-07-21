'use client';
import { RAMP_HEX } from '@/lib/types';

export const PICKABLE_ICONS = [
  'ti-tag', 'ti-star', 'ti-wallet', 'ti-heart', 'ti-home', 'ti-gift',
  'ti-car', 'ti-briefcase', 'ti-book', 'ti-paw', 'ti-plane', 'ti-device-gamepad-2',
];

export function IconRampPicker({
  icon, ramp, onIcon, onRamp,
}: {
  icon: string; ramp: string; onIcon: (v: string) => void; onRamp: (v: string) => void;
}) {
  return (
    <div className="mb-3.5">
      <p className="text-[11px] text-gray-400 mb-1.5">Ikon</p>
      <div className="grid grid-cols-6 gap-2 mb-3">
        {PICKABLE_ICONS.map((i) => {
          const colors = RAMP_HEX[ramp];
          const active = i === icon;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onIcon(i)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center border ${active ? 'border-pink-400' : 'border-pink-100'}`}
              style={{ background: active ? colors.bg : '#fff', color: active ? colors.fg : '#9CA3AF' }}
            >
              <i className={`ti ${i}`} />
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-gray-400 mb-1.5">Warna</p>
      <div className="flex gap-2">
        {Object.entries(RAMP_HEX).map(([key, colors]) => (
          <button
            key={key}
            type="button"
            onClick={() => onRamp(key)}
            className="w-7 h-7 rounded-full border-2"
            style={{ background: colors.fg, borderColor: ramp === key ? colors.fg : 'transparent' }}
          />
        ))}
      </div>
    </div>
  );
}
