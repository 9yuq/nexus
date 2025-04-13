import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getUserInitials } from "@/lib/auth";

interface UserAvatarProps {
  username: string;
  size?: "sm" | "md" | "lg";
  vipLevel?: number;
}

export function UserAvatar({ username, size = "md", vipLevel }: UserAvatarProps) {
  const initials = getUserInitials(username);
  
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base"
  };
  
  // VIP badge colors - higher levels get more prestigious colors
  const vipLevelColors = [
    "bg-gray-600", // Level 0
    "bg-accent-purple", // Level 1
    "bg-accent-teal", // Level 2 
    "bg-yellow-500", // Level 3
    "bg-gradient-to-r from-accent-purple to-accent-teal" // Level 4+
  ];
  
  const avatarColor = vipLevel !== undefined && vipLevel < vipLevelColors.length 
    ? vipLevelColors[vipLevel]
    : vipLevelColors[vipLevelColors.length - 1];
  
  return (
    <Avatar className={`${sizeClasses[size]} ${avatarColor}`}>
      <AvatarFallback className="font-semibold text-white">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
