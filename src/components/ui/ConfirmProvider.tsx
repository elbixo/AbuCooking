"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import ConfirmDialog from "./ConfirmDialog";

type ConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel: string;
  danger?: boolean;
};

const ConfirmContext = createContext<(options: ConfirmOptions) => Promise<boolean>>(async () => false);

// La ventana de confirmación vive en el layout (fuera de las páginas): así no se cierra
// si Next.js vuelve a pintar la página mientras está abierta.
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((ok: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    resolver.current?.(false);
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = useCallback((ok: boolean) => {
    resolver.current?.(ok);
    resolver.current = null;
    setOptions(null);
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        open={options !== null}
        title={options?.title ?? ""}
        message={options?.message}
        confirmLabel={options?.confirmLabel ?? ""}
        danger={options?.danger}
        onConfirm={() => close(true)}
        onCancel={() => close(false)}
      />
    </ConfirmContext.Provider>
  );
}

// const confirm = useConfirm(); if (await confirm({ ... })) { ... }
export function useConfirm() {
  return useContext(ConfirmContext);
}
