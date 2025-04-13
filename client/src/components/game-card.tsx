import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GameCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  iconBgClass: string;
}

export function GameCard({ icon, title, description, href, iconBgClass }: GameCardProps) {
  return (
    <Link href={href}>
      <a className="block">
        <Card className="bg-primary-800 rounded-xl p-5 flex items-center hover:bg-primary-700 transition-all cursor-pointer">
          <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mr-4", iconBgClass)}>
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="text-sm text-neutral-400">{description}</p>
          </div>
        </Card>
      </a>
    </Link>
  );
}

export function CrashGameCard() {
  return (
    <GameCard
      icon={
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 17.8L17 13l-3 4-5-6-5 6"></path>
          <path d="M22 17.8V5c0-1-.8-2-2-2H4c-1 0-2 .9-2 2v13"></path>
        </svg>
      }
      title="Crash"
      description="Risk it for massive multipliers"
      href="/games/crash"
      iconBgClass="bg-accent-purple/20 text-accent-purple"
    />
  );
}

export function DiceGameCard() {
  return (
    <GameCard
      icon={
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <circle cx="15.5" cy="8.5" r="1.5"></circle>
          <circle cx="15.5" cy="15.5" r="1.5"></circle>
          <circle cx="8.5" cy="15.5" r="1.5"></circle>
        </svg>
      }
      title="Dice"
      description="Classic crypto casino play"
      href="/games/dice"
      iconBgClass="bg-accent-teal/20 text-accent-teal"
    />
  );
}

export function SlotsGameCard() {
  return (
    <GameCard
      icon={
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="18" rx="2"></rect>
          <line x1="8" y1="21" x2="8" y2="3"></line>
          <line x1="16" y1="21" x2="16" y2="3"></line>
          <circle cx="6" cy="9" r="2"></circle>
          <circle cx="18" cy="14" r="2"></circle>
          <circle cx="12" cy="8" r="2"></circle>
        </svg>
      }
      title="Slots"
      description="Spin to win big rewards"
      href="/games/slots"
      iconBgClass="bg-accent-orange/20 text-accent-orange"
    />
  );
}
