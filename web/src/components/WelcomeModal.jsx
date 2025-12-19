import React from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Sparkles, Download, Shield, Zap } from 'lucide-react';

export default function WelcomeModal({ isOpen, onClose }) {
  const handleGetStarted = () => {
    localStorage.setItem('cora-welcome-shown', 'true');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <div className="flex flex-col items-center text-center py-4">
          {/* Logo */}
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full border-4 border-background flex items-center justify-center">
              <span className="text-xs">1</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Welcome to Cora
          </h2>
          <p className="text-muted-foreground mb-6">
            Your private AI assistant
          </p>

          {/* Key Points */}
          <div className="w-full space-y-4 mb-6">
            <div className="flex items-start gap-3 text-left p-3 rounded-lg bg-secondary/50">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Download className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">One-time setup</p>
                <p className="text-xs text-muted-foreground">
                  The first time you use Cora, it needs to download the AI brain to your device. This may take a few minutes depending on your connection.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-left p-3 rounded-lg bg-secondary/50">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Zap className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Fast after that</p>
                <p className="text-xs text-muted-foreground">
                  Once downloaded, Cora starts instantly every time. Your browser remembers everything.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-left p-3 rounded-lg bg-secondary/50">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Shield className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Completely private</p>
                <p className="text-xs text-muted-foreground">
                  Everything stays on your device. Your conversations are never sent anywhere.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleGetStarted}
            className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Get Started
          </button>

          <p className="text-xs text-muted-foreground mt-4">
            Tip: Keep this tab open during the initial download
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
