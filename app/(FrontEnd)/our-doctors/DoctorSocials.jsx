"use client";

import { Globe, Share2 } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";

const NETWORKS = [
  { key: "facebook", label: "Facebook", Icon: FaFacebookF },
  { key: "twitter", label: "Twitter / X", Icon: FaTwitter },
  { key: "linkedin", label: "LinkedIn", Icon: FaLinkedinIn },
  { key: "whatsapp", label: "WhatsApp", Icon: FaWhatsapp },
  { key: "instagram", label: "Instagram", Icon: FaInstagram },
  { key: "website", label: "Website", Icon: Globe },
];

function profileUrl(value) {
  if (typeof value !== "string" || !value.trim()) return "";

  try {
    const url = new URL(value);

    if (!["https:", "http:"].includes(url.protocol)) return "";
    if (url.username || url.password) return "";

    // Your MongoDB demo profiles use example.com placeholder links.
    if (
      url.hostname === "example.com" ||
      url.hostname.endsWith(".example.com")
    ) {
      return "";
    }

    return url.href;
  } catch {
    return "";
  }
}

function shareUrl(network, pageUrl, name) {
  if (!pageUrl) return "";

  const url = encodeURIComponent(pageUrl);
  const title = encodeURIComponent(`${name} | Kliniko`);

  switch (network) {
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    case "twitter":
      return `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    case "whatsapp":
      return `https://wa.me/?text=${encodeURIComponent(`${name} | Kliniko\n${pageUrl}`)}`;
    default:
      return "";
  }
}

export default function DoctorSocials({
  name,
  profilePath,
  links = {},
  variant = "card",
}) {
  const inline = variant === "details";
  const panelId = useId();
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [pageUrl, setPageUrl] = useState("");

  useEffect(() => {
    setPageUrl(new URL(profilePath, window.location.origin).href);
  }, [profilePath]);

  useEffect(() => {
    if (inline || !open) return;

    function close() {
      setOpen(false);
      setPinned(false);
    }

    function outside(event) {
      if (!rootRef.current?.contains(event.target)) close();
    }

    function escape(event) {
      if (event.key !== "Escape") return;

      if (rootRef.current?.contains(document.activeElement)) {
        triggerRef.current?.focus();
      }

      close();
    }

    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);

    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [inline, open]);

  const items = NETWORKS.flatMap(({ key, label, Icon }) => {
    const saved = profileUrl(links[key]);
    const href = saved || shareUrl(key, pageUrl, name);
    if (!href) return [];

    const description = saved
      ? `Open ${name}'s ${label} link`
      : `Share ${name}'s profile on ${label}`;

    return [{ key, Icon, href, description }];
  });

  return (
    <div
      ref={rootRef}
      className={inline ? "" : "relative z-10 shrink-0"}
      onPointerEnter={(event) => {
        if (!inline && event.pointerType === "mouse") setOpen(true);
      }}
      onPointerLeave={(event) => {
        if (inline || pinned || event.pointerType !== "mouse") return;

        if (!rootRef.current?.contains(document.activeElement)) {
          setOpen(false);
        }
      }}
      onBlur={(event) => {
        if (!inline && !event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
          setPinned(false);
        }
      }}
    >
      {!inline && (
        <button
          ref={triggerRef}
          type="button"
          aria-label={`${open ? "Close" : "Show"} social links for ${name}`}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => {
            const next = !pinned;
            setPinned(next);
            setOpen(next);
          }}
          className={`grid size-11 cursor-pointer place-items-center rounded-full text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#169FB4] ${
            open
              ? "bg-gradient-to-br from-[#6653E9] to-[#139DB0]"
              : "bg-[#6050E5]"
          }`}
        >
          <Share2 size={18} aria-hidden="true" />
        </button>
      )}

      <ul
        id={panelId}
        aria-label={`${name} social links`}
        className={
          inline
            ? "flex flex-wrap items-center gap-2"
            : open
              ? "absolute end-0 bottom-full flex flex-col items-center gap-1 pb-2"
              : "hidden"
        }
      >
        {items.map(({ key, Icon, href, description }) => (
          <li key={key}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={description}
              title={description}
              className={`group/icon grid place-items-center rounded-full bg-white text-[#112753] transition-colors hover:border-[#1199AD] hover:bg-[#1199AD] hover:text-white focus-visible:border-[#1199AD] focus-visible:bg-[#1199AD] focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#117F91] ${
                inline
                  ? "size-11 border-2 border-[#B3E1E6]"
                  : "mx-1 size-9 border border-[#D3E6E8] shadow-sm"
              }`}
            >
              <Icon
                size={inline ? 17 : 15}
                aria-hidden="true"
                className="motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover/icon:-translate-y-0.5 motion-safe:group-hover/icon:scale-110"
              />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
