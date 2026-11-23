import React, { useState } from 'react';
import { QrCode, Copy, Check, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function QRCodeDisplay({ roomCode, quizTitle }) {
  const [copied, setCopied] = useState(false);
  const joinUrl = `${window.location.origin}/join?code=${encodeURIComponent(roomCode)}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(joinUrl)}&bgcolor=0F172A&color=A855F7&margin=1`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    toast.success('Join link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center p-4 rounded-3xl bg-slate-950/80 border border-purple-500/30 text-center space-y-3 shadow-xl">
      <div className="flex items-center space-x-1.5 text-xs font-bold text-purple-400 uppercase tracking-wider">
        <QrCode className="w-4 h-4" />
        <span>Scan to Join on Phone</span>
      </div>

      <div className="p-2 rounded-2xl bg-slate-900 border border-purple-500/40 shadow-inner group relative">
        <img
          src={qrImageUrl}
          alt={`QR Code for room ${roomCode}`}
          className="w-40 h-40 rounded-xl object-contain transition-transform group-hover:scale-105 duration-200"
          onError={(e) => {
            // Fallback if offline
            e.target.style.display = 'none';
          }}
        />
      </div>

      <div className="space-y-1">
        <p className="font-mono text-2xl font-black tracking-widest text-white">{roomCode}</p>
        <p className="text-[11px] text-slate-400 max-w-[180px] truncate">{quizTitle || 'Live Arena'}</p>
      </div>

      <button
        onClick={handleCopyLink}
        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-purple-300 font-semibold border border-purple-500/20 flex items-center space-x-1 transition-all"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        <span>{copied ? 'Copied' : 'Copy Join Link'}</span>
      </button>
    </div>
  );
}
