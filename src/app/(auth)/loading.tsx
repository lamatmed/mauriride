import { AppLogoIcon } from "@/components/ui/app-logo";

export default function AuthLoading() {
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <div className="bg-white rounded-2xl p-3 shadow-2xl">
            <AppLogoIcon size="lg" />
          </div>
          <span className="absolute inset-0 rounded-2xl ring-2 ring-teal-400/40 animate-ping" />
        </div>
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
