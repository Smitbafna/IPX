import IconContainer from "@workspace/ui/components/ui/floating-dock";
import { useMotionValue } from "motion/react";
import { IconHome, IconGhost, IconSkull, IconUsers } from "@tabler/icons-react";
import WalletConnector from "./WalletConnect";

export default function MyCustomComponent() {
  const mouseX = useMotionValue(Infinity);

  return (
    <div className="w-screen flex items-center justify-center py-4">
      <div
        className="relative flex items-center bg-gradient-to-r from-gray-900/95 via-black/95 to-gray-900/95 backdrop-blur-lg border border-gray-700/30 rounded-2xl max-w-7xl w-full px-8 py-6 shadow-2xl"
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        style={{
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)"
        }}
      >
        {/* On-Chain Hauntings Title (Left side) */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col text-left">
          <span
            style={{
              fontFamily: "Holtwood One SC, serif",
              fontSize: "2rem",
              letterSpacing: "0.15rem",
              color: "white",
              lineHeight: "1",
              filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8))"
            }}
          >
            On-Chain Hauntings
          </span>
          <span className="text-xs text-gray-400 mt-1 tracking-wider font-medium">
            SUPERNATURAL NFTS
          </span>
        </div>

        {/* WalletConnector (Right side) */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2">
          <WalletConnector />
        </div>

        {/* Icon Group (Centered) */}
        <div className="flex items-center gap-6 mx-auto">
          <IconContainer
            mouseX={mouseX}
            title="Home"
            icon={<IconHome className="text-white" />}
            href="/"
          />
          
          <IconContainer
            mouseX={mouseX}
            title="Haunting Map"
            icon={<IconSkull className="text-gray-400" />}
            href="/map"
          />
        
        </div>

        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 via-transparent to-white/5 pointer-events-none" />
      </div>
    </div>
  );
}