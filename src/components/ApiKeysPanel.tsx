"use client";

import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEFAULT_API_SERVICES, type ServiceApiKey } from "@/types/zsprite";

const STORAGE_KEY = "zsprite.local-api-keys.v1";
const STORAGE_EVENT = "zsprite:api-keys";
let cachedStorageValue: string | null = null;
let cachedServices: ServiceApiKey[] = DEFAULT_API_SERVICES;

function mergeDefaultServices(saved: ServiceApiKey[]) {
  const savedById = new Map(saved.map((service) => [service.id, service]));
  const merged = DEFAULT_API_SERVICES.map((service) => savedById.get(service.id) ?? service);
  const custom = saved.filter((service) => !DEFAULT_API_SERVICES.some((preset) => preset.id === service.id));
  return [...merged, ...custom];
}

function subscribeToApiKeys(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(STORAGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(STORAGE_EVENT, onStoreChange);
  };
}

function getApiKeysSnapshot() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      cachedStorageValue = null;
      cachedServices = DEFAULT_API_SERVICES;
      return cachedServices;
    }

    if (saved === cachedStorageValue) {
      return cachedServices;
    }

    cachedStorageValue = saved;
    cachedServices = mergeDefaultServices(JSON.parse(saved) as ServiceApiKey[]);
    return cachedServices;
  } catch {
    cachedStorageValue = null;
    cachedServices = DEFAULT_API_SERVICES;
    return cachedServices;
  }
}

export function ApiKeysPanel() {
  const services = useSyncExternalStore(
    subscribeToApiKeys,
    getApiKeysSnapshot,
    () => DEFAULT_API_SERVICES,
  );
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());

  const commitServices = (nextServices: ServiceApiKey[]) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextServices));
    window.dispatchEvent(new Event(STORAGE_EVENT));
  };

  const filledCount = useMemo(
    () => services.filter((service) => service.apiKey.trim().length > 0).length,
    [services],
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Local API Vault</div>
            <div className="mt-1 text-sm text-slate-300">
              Store service keys only in this browser. The MVP does not send or sync them anywhere.
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-400">
            {filledCount} saved
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {services.map((service) => {
          const visible = visibleIds.has(service.id);

          return (
            <div key={service.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)_auto_auto]">
                <Input
                  value={service.name}
                  onChange={(event) =>
                    commitServices(
                      services.map((item) =>
                        item.id === service.id ? { ...item, name: event.target.value } : item,
                      ),
                    )
                  }
                  placeholder="Service name"
                />
                <Input
                  type={visible ? "text" : "password"}
                  value={service.apiKey}
                  onChange={(event) =>
                    commitServices(
                      services.map((item) =>
                        item.id === service.id ? { ...item, apiKey: event.target.value } : item,
                      ),
                    )
                  }
                  placeholder="Paste API key"
                />
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() =>
                    setVisibleIds((current) => {
                      const next = new Set(current);
                      if (next.has(service.id)) {
                        next.delete(service.id);
                      } else {
                        next.add(service.id);
                      }
                      return next;
                    })
                  }
                >
                  {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => commitServices(services.filter((item) => item.id !== service.id))}
                  disabled={DEFAULT_API_SERVICES.some((preset) => preset.id === service.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          variant="secondary"
          onClick={() =>
            commitServices([
              ...services,
              {
                id: crypto.randomUUID(),
                name: "Custom Service",
                apiKey: "",
              },
            ])
          }
        >
          <Plus className="size-4" />
          Add Service
        </Button>
        <Button
          variant="ghost"
          onClick={() => commitServices(services.map((service) => ({ ...service, apiKey: "" })))}
        >
          Clear Saved Keys
        </Button>
      </div>
    </div>
  );
}
