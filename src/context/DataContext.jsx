import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createAdapter } from "../data/adapters";
import { seedFor } from "../data/seed";

const DataContext = createContext(null);
const adapter = createAdapter();

// Generic collection hook backed by the active adapter. Feature pages call
// useCollection("events") and get { items, add, update, remove }.
export function DataProvider({ tenantId, children }) {
  const [cache, setCache] = useState({});

  const load = useCallback(
    async (name) => {
      let items = await adapter.getCollection(tenantId, name);
      if (items == null) {
        items = seedFor(name);
        await adapter.saveCollection(tenantId, name, items);
      }
      setCache((c) => ({ ...c, [name]: items }));
      return items;
    },
    [tenantId]
  );

  const persist = useCallback(
    async (name, items) => {
      setCache((c) => ({ ...c, [name]: items }));
      await adapter.saveCollection(tenantId, name, items);
    },
    [tenantId]
  );

  // Reset cache when the tenant changes.
  useEffect(() => setCache({}), [tenantId]);

  return (
    <DataContext.Provider value={{ cache, load, persist }}>
      {children}
    </DataContext.Provider>
  );
}

const uid = () => Math.random().toString(36).slice(2, 9);

export function useCollection(name) {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useCollection must be used within DataProvider");
  const { cache, load, persist } = ctx;
  const items = cache[name];

  useEffect(() => {
    if (items === undefined) load(name);
  }, [items, name, load]);

  const add = (record) => persist(name, [...(items || []), { id: uid(), ...record }]);
  const update = (id, patch) =>
    persist(name, (items || []).map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const remove = (id) => persist(name, (items || []).filter((it) => it.id !== id));

  return { items: items || [], loading: items === undefined, add, update, remove };
}
