import React, { useState, useRef, useEffect } from 'react';
import { StaffRole, STAFF_PROFILES } from '../data';
import { ChevronDown, Check } from 'lucide-react';
import { roleLabel } from '../rbac';

interface RoleSwitcherProps {
  activeRole: StaffRole;
  onRoleChange: (role: StaffRole) => void;
}

const ORDER: StaffRole[] = ['ROLE_INTERN', 'ROLE_CLERK', 'ROLE_MANAGER', 'ROLE_ADMIN'];

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ activeRole, onRoleChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const profile = STAFF_PROFILES[activeRole];

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Current role: ${roleLabel(activeRole)}. Change role.`}
      >
        <span
          className={`w-6 h-6 rounded text-[10px] font-semibold flex items-center justify-center ${profile.rolePillColor}`}
        >
          {profile.avatarInitials}
        </span>
        <span className="hidden sm:flex flex-col items-start leading-tight">
          <span className="text-[12px] font-medium text-slate-800">{profile.name.split(' ')[0]}</span>
          <span className="text-[10px] text-slate-500">{roleLabel(activeRole)}</span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Staff roles"
          className="absolute right-0 mt-1.5 w-64 bg-white rounded-lg border border-slate-200 shadow-md z-50 overflow-hidden"
        >
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-[11px] text-slate-500">Switch demo role</p>
          </div>
          <ul className="py-1">
            {ORDER.map((role) => {
              const p = STAFF_PROFILES[role];
              const selected = role === activeRole;
              return (
                <li key={role}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      onRoleChange(role);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex gap-2.5 items-center hover:bg-slate-50 transition-colors ${
                      selected ? 'bg-blue-50/70' : ''
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded text-[10px] font-semibold flex items-center justify-center shrink-0 ${p.rolePillColor}`}
                    >
                      {p.avatarInitials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-medium text-slate-800">{p.name}</span>
                        {selected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" aria-hidden />}
                      </span>
                      <span className="text-[11px] text-slate-500 block">{p.title}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
