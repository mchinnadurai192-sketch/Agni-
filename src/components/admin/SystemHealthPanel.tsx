import React from 'react';
import { Activity, Server, Database, Cpu, Wifi, Radio, Users, Clock, RefreshCw } from 'lucide-react';
import { useCricket } from '../../context/CricketContext';

export const SystemHealthPanel: React.FC = () => {
  const { systemHealth, cameras, reconnectCamera } = useCricket();

  const services = [
    { name: 'API Server', status: systemHealth.server, icon: Server },
    { name: 'Postgres Database', status: systemHealth.database, icon: Database },
    { name: 'WebSocket State Sync', status: systemHealth.websocket, icon: Wifi },
    { name: 'AI Vision Engine', status: systemHealth.aiEngine, icon: Cpu },
    { name: 'WebRTC Media Server', status: systemHealth.mediaServer, icon: Radio },
  ];

  return (
    <div className="flex flex-col rounded-xl bg-zinc-900 border border-zinc-800 p-4 sm:p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            SYSTEM HEALTH & TELEMETRY
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Production broadcast nodes, media relays and camera interconnects
          </p>
        </div>

        {/* Global status badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>ALL NODES OPERATIONAL</span>
        </div>
      </div>

      {/* Services Grid */}
      <div>
        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
          Infrastructure Services
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {services.map((srv) => {
            const Icon = srv.icon;
            const isOnline = srv.status === 'ONLINE';

            return (
              <div
                key={srv.name}
                className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-4 h-4 text-zinc-400" />
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isOnline ? 'bg-emerald-500 shadow-sm shadow-emerald-500' : 'bg-red-500'
                    }`}
                  />
                </div>
                <span className="text-xs font-semibold text-zinc-200">{srv.name}</span>
                <span className="text-[10px] font-mono font-bold text-emerald-400 mt-0.5">
                  ● {srv.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cameras Status Matrix */}
      <div>
        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
          6-Camera Device Links
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {cameras.map((cam) => {
            const isConnected = cam.status === 'CONNECTED';

            return (
              <div
                key={cam.id}
                className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                  <span>CAM {cam.number}</span>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isConnected ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                  />
                </div>
                <div className="text-[10px] text-zinc-400 truncate">{cam.purpose}</div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/80 text-[10px] font-mono-numbers">
                  <span className={isConnected ? 'text-emerald-400' : 'text-red-400'}>
                    {cam.status}
                  </span>
                  {!isConnected && (
                    <button
                      onClick={() => reconnectCamera(cam.id)}
                      className="text-orange-400 hover:underline flex items-center gap-0.5"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      <span>Fix</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Viewers & Broadcast Telemetry */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-xs font-mono-numbers">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-orange-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase block">Active Viewers</span>
            <span className="text-base font-bold text-white">{systemHealth.activeViewers}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-emerald-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase block">Stream Latency</span>
            <span className="text-base font-bold text-white">{systemHealth.streamLatencyMs} ms</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-blue-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase block">AI Inference CPU</span>
            <span className="text-base font-bold text-white">{systemHealth.cpuLoadPercent}%</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-purple-400">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase block">RAM Allocation</span>
            <span className="text-base font-bold text-white">{systemHealth.memoryUsagePercent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
