"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { normalizeAccountAvatarUrl } from "@/src/lib/account-profile";

const avatarColors = ["#0f766e", "#2563eb", "#7c3aed", "#be123c", "#c2410c", "#047857"];

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  return `${words[0][0]}${words.length > 1 ? words[words.length - 1][0] : ""}`.toUpperCase();
}

function getAvatarColor(name: string) {
  const hash = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
}

export default function AccountAvatar({
  name,
  imageUrl,
  size = 28,
  className,
}: {
  name: string;
  imageUrl?: string | null;
  size?: number;
  className?: string;
}) {
  const normalizedImageUrl = normalizeAccountAvatarUrl(imageUrl);
  return (
    <Avatar className={className || "shrink-0 after:border-slate-200"} style={{ width: size, height: size }}>
      {normalizedImageUrl ? <AvatarImage src={normalizedImageUrl} alt={name} /> : null}
      <AvatarFallback
        className="font-semibold leading-none text-white"
        style={{ backgroundColor: getAvatarColor(name), fontSize: Math.max(10, size * 0.34) }}
      >
        <span className="translate-y-px leading-none">{getInitials(name)}</span>
      </AvatarFallback>
    </Avatar>
  );
}
