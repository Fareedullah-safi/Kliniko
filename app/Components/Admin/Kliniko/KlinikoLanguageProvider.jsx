"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const API = "/api/kliniko-languages";

const PUBLIC_LANGUAGES_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_PUBLIC_LANGUAGES === "true";

const ADMIN_KEY = "kliniko-admin-edit-language";
const PUBLIC_KEY = "kliniko-public-language";
const OLD_KEY = "kliniko-selected-language";

const DEFAULT_LANGUAGES = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    direction: "ltr",
    enabled: true,
  },
  {
    code: "fa",
    name: "Dari",
    nativeName: "دری",
    direction: "rtl",
    enabled: true,
  },
];

const LanguageContext = createContext(null);

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function normalizeLanguages(value) {
  if (!Array.isArray(value)) return [];

  const used = new Set();

  return value
    .filter((item) => {
      const code = String(item?.code || "")
        .trim()
        .toLowerCase();

      if (!code || item.enabled === false || used.has(code)) {
        return false;
      }

      used.add(code);
      return true;
    })
    .map((item) => ({
      code: String(item.code).trim().toLowerCase(),
      name: String(item.name || item.code),
      nativeName: String(item.nativeName || item.name || item.code),
      direction: item.direction === "rtl" ? "rtl" : "ltr",
      enabled: true,
    }));
}

function validLanguage(list, code, fallback) {
  return list.some((item) => item.code === code) ? code : fallback;
}

export function KlinikoLanguageProvider({ children }) {
  const pathname = usePathname();

  const isAdmin = pathname === "/admin" || pathname?.startsWith("/admin/");

  const [languages, setLanguages] = useState(DEFAULT_LANGUAGES);

  const [defaultLanguage, setDefaultLanguage] = useState("en");

  // Language for CMS editing.
  const [adminLanguage, setAdminLanguage] = useState("en");

  // Separate language for website visitors.
  const [visitorLanguage, setVisitorLanguage] = useState("en");

  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  const requestId = useRef(0);

  // =====================================
  // FETCH ENABLED LANGUAGES FROM MONGODB
  // =====================================

  const refreshLanguages = useCallback(async () => {
    const id = ++requestId.current;

    try {
      const response = await fetch(API, {
        cache: "no-store",
      });

      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error(`Languages API returned HTML (${response.status}).`);
      }

      const result = await response.json();

      if (!response.ok || !result.success || !Array.isArray(result.languages)) {
        throw new Error(result.message || "Failed to load languages.");
      }

      const list = normalizeLanguages(result.languages);

      if (!list.length) {
        throw new Error("No enabled languages found.");
      }

      if (id !== requestId.current) return;

      const fallback = validLanguage(
        list,
        result.defaultLanguage,
        list.some((item) => item.code === "en") ? "en" : list[0].code,
      );

      setLanguages(list);
      setDefaultLanguage(fallback);

      // Restore admin editing language independently.
      setAdminLanguage((previous) => {
        const saved =
          readStorage(ADMIN_KEY) || readStorage(OLD_KEY) || previous;

        return validLanguage(list, saved, fallback);
      });

      // Restore website visitor language independently.
      setVisitorLanguage((previous) => {
        const saved = readStorage(PUBLIC_KEY) || previous;

        return validLanguage(list, saved, fallback);
      });

      setError("");
    } catch (err) {
      if (id === requestId.current) {
        console.error("Language error:", err);
        setError(err.message);
      }
    } finally {
      if (id === requestId.current) {
        setReady(true);
      }
    }
  }, []);

  // =====================================
  // LOAD + UPDATE LIST
  // =====================================

  useEffect(() => {
    void refreshLanguages();

    function handleUpdate() {
      void refreshLanguages();
    }

    window.addEventListener("kliniko-languages-updated", handleUpdate);

    return () => {
      window.removeEventListener("kliniko-languages-updated", handleUpdate);

      requestId.current += 1;
    };
  }, [refreshLanguages]);

  // =====================================
  // DETERMINE LANGUAGE FOR THIS PAGE
  // =====================================

  const language = isAdmin
    ? validLanguage(languages, adminLanguage, defaultLanguage)
    : PUBLIC_LANGUAGES_ENABLED
      ? validLanguage(languages, visitorLanguage, defaultLanguage)
      : "en";

  const selectedLanguage =
    languages.find((item) => item.code === language) || languages[0];

  const direction = selectedLanguage?.direction || "ltr";

  const isRTL = direction === "rtl";

  // =====================================
  // CHANGE THE CURRENT LANGUAGE
  // =====================================

  const setLanguage = useCallback(
    (code) => {
      if (!languages.some((item) => item.code === code)) {
        return;
      }

      if (isAdmin) {
        // CMS language changes remain inside admin.
        setAdminLanguage(code);
        writeStorage(ADMIN_KEY, code);
      } else if (PUBLIC_LANGUAGES_ENABLED) {
        // Public language changes stay independent.
        setVisitorLanguage(code);
        writeStorage(PUBLIC_KEY, code);
      }
    },
    [languages, isAdmin],
  );

  // =====================================
  // UPDATE TEXT DIRECTION
  // =====================================

  useEffect(() => {
    // Admin dashboard always stays LTR.
    // Only translated inputs use their own dir.
    document.documentElement.dir = isAdmin ? "ltr" : direction;

    document.documentElement.lang = isAdmin ? "en" : language;
  }, [isAdmin, language, direction]);

  // =====================================
  // CONTEXT
  // =====================================

  const value = useMemo(
    () => ({
      languages,
      defaultLanguage,

      language,
      selectedLanguage,
      direction,
      isRTL,

      setLanguage,
      refreshLanguages,

      ready,
      loading: !ready,
      error,

      isAdmin,
      publicLanguagesEnabled: PUBLIC_LANGUAGES_ENABLED,

      adminLanguage,
      visitorLanguage,
    }),
    [
      languages,
      defaultLanguage,
      language,
      selectedLanguage,
      direction,
      isRTL,
      setLanguage,
      refreshLanguages,
      ready,
      error,
      isAdmin,
      adminLanguage,
      visitorLanguage,
    ],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useKlinikoLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("KlinikoLanguageProvider is missing from layout.jsx.");
  }

  return context;
}
