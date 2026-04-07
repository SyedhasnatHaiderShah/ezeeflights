import { FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';

export interface TwoFactorFormProps {
  code: string;
  onCodeChange: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
  disabled?: boolean;
  error?: string;
}

export function TwoFactorForm({ code, onCodeChange, onSubmit, disabled, error }: TwoFactorFormProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-redmix">
          <ShieldCheck className="w-5 h-5" />
          <h1 className="text-xl font-black font-display tracking-tight text-foreground leading-tight">
            Secure your access<span className="text-redmix">.</span>
          </h1>
        </div>
        <p className="text-muted-foreground text-xs font-medium tracking-tight">
          Enter the 6-digit code from your authenticator app to continue.
        </p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground ml-0.5">Verification Code</label>
            <Input
              placeholder="000 000"
              inputMode="numeric"
              autoComplete="one-time-code"
              className="text-center text-lg tracking-[0.5em] font-mono h-12"
              value={code}
              onChange={(e) => onCodeChange(e.target.value.replace(/\s/g, ''))}
              disabled={disabled}
              required
            />
          </div>
        </div>

        {error ? <p className="text-[10px] text-redmix font-bold animate-shake">{error}</p> : null}

        <Button
          variant="brand-red"
          size="lg"
          className="w-full h-11 rounded-xl"
          type="submit"
          disabled={disabled}
        >
          {disabled ? "Verifying..." : "Verify & Continue"}
        </Button>
      </form>
    </div>
  );
}
