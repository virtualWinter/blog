'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { disableTOTP } from '@/lib/auth/actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TOTPSetup from '@/components/auth/totp-setup';
import { Shield, Smartphone, Eye, EyeOff } from 'lucide-react';
import type { PublicUser } from '@/lib/auth/types';

interface SecurityFormProps {
  user: PublicUser;
}

export function SecurityForm({ user }: SecurityFormProps) {
  const [isDisabling, setIsDisabling] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [totpDialogOpen, setTotpDialogOpen] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);

  async function handleDisableTOTP(formData: FormData) {
    setIsDisabling(true);
    setMessage(null);

    const password = formData.get('password') as string;

    try {
      const result = await disableTOTP(password);
      
      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else if (result.success) {
        setMessage({ type: 'success', text: result.message || 'TOTP disabled successfully!' });
        setDisableDialogOpen(false);
        // Refresh the page to update the UI
        window.location.reload();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setIsDisabling(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* TOTP Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Two-Factor Authentication (TOTP)</p>
                <p className="text-sm text-muted-foreground">
                  Use an authenticator app for additional security
                </p>
              </div>
            </div>
            <Badge variant={user.totpEnabled ? 'default' : 'secondary'}>
              {user.totpEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>

          <div className="flex gap-2">
            {user.totpEnabled ? (
              <Dialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Disable TOTP
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Enter your password to disable two-factor authentication. This will make your account less secure.
                    </p>
                    
                    <form action={handleDisableTOTP} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="disable-password">Password</Label>
                        <div className="relative">
                          <Input
                            id="disable-password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {message && (
                        <div className={`p-3 rounded-md ${
                          message.type === 'success' 
                            ? 'bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800' 
                            : 'bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
                        }`}>
                          {message.text}
                        </div>
                      )}

                      <div className="flex gap-2 justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setDisableDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="destructive"
                          disabled={isDisabling}
                        >
                          {isDisabling ? 'Disabling...' : 'Disable TOTP'}
                        </Button>
                      </div>
                    </form>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Dialog open={totpDialogOpen} onOpenChange={setTotpDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Enable TOTP
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
                  </DialogHeader>
                  <TOTPSetup />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Security Tips */}
        <div className="border-t pt-6">
          <h3 className="font-medium mb-3">Security Tips</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Use a strong, unique password for your account</p>
            <p>• Enable two-factor authentication for extra security</p>
            <p>• Keep your email address verified and up to date</p>
            <p>• Regularly review your account activity</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}