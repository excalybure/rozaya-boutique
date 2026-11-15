"use client";

import {
  loadCustomerPrivacy,
  type CustomerPrivacy,
  type PrivacyConfig,
} from "lib/privacy/customer-privacy";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type PrivacyContextValue = {
  config: PrivacyConfig | null;
  privacy: CustomerPrivacy | null;
  error: string | null;
};
const PrivacyContext = createContext<PrivacyContextValue | null>(null);

export default function PrivacyProvider({
  config,
  children,
}: {
  config: PrivacyConfig | null;
  children: ReactNode;
}) {
  const [privacy, setPrivacy] = useState<CustomerPrivacy | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!config) {
      setError(
        "Privacy controls are not configured. Please contact us for assistance.",
      );
    } else {
      loadCustomerPrivacy(config).then(
        (api) => {
          if (active) {
            setPrivacy(api);
          }
        },
        () => {
          if (active) {
            setError(
              "Privacy controls could not load. Please reload or contact us for assistance.",
            );
          }
        },
      );
    }
    return () => {
      active = false;
    };
  }, [config]);

  return (
    <PrivacyContext.Provider value={{ config, privacy, error }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  const context = useContext(PrivacyContext);
  if (!context) {
    throw new Error("PrivacyProvider is required.");
  }
  return context;
}
