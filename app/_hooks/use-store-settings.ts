"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";

export type StoreSettings = {
  isOpen: boolean;
  serviceFeeRate: number;
  announcement: string;
};

type FirestoreStoreSettings = {
  isOpen?: boolean;
  serviceFeeRate?: number;
  announcement?: string;
};

export const defaultStoreSettings: StoreSettings = {
  announcement: "",
  isOpen: true,
  serviceFeeRate: 0.1,
};

function mapStoreSettings(data: FirestoreStoreSettings): StoreSettings {
  return {
    announcement: data.announcement || "",
    isOpen: typeof data.isOpen === "boolean" ? data.isOpen : true,
    serviceFeeRate:
      typeof data.serviceFeeRate === "number" ? data.serviceFeeRate : 0.1,
  };
}

export function useStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings>(defaultStoreSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [documentExists, setDocumentExists] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "storeSettings", "main"),
      (snapshot) => {
        if (!snapshot.exists()) {
          setSettings(defaultStoreSettings);
          setDocumentExists(false);
        } else {
          setSettings(mapStoreSettings(snapshot.data() as FirestoreStoreSettings));
          setDocumentExists(true);
        }

        setErrorMessage("");
        setIsLoading(false);
      },
      (error) => {
        setSettings(defaultStoreSettings);
        setErrorMessage(error.message);
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  return {
    documentExists,
    errorMessage,
    isLoading,
    settings,
  };
}
