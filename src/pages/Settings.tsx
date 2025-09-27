import { Layout } from "@/components/Layout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserPreferences } from "@/hooks/useUserPreferences";

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { preferences, updatePreferences, isLoading: isLoadingPreferences } = useUserPreferences();

  const [reportSubject, setReportSubject] = useState("");
  const [reportDetails, setReportDetails] = useState("");

  const [account, setAccount] = useState({
    displayName: "",
    email: "",
    website: "",
  });

  const [notifications, setNotifications] = useState({
    product_updates: true,
    roadmap_activity: true,
    weekly_digest: false,
    marketing_emails: false,
    push_enabled: false,
  });

  const [privacy, setPrivacy] = useState({
    profile_visibility: "public" as "public" | "private" | "friends",
    show_follower_counts: true,
    show_activity: true,
  });

  const [security, setSecurity] = useState({
    two_factor_enabled: false,
    login_alerts: true,
  });

  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (user) {
      setAccount({
        displayName: (user as any)?.user_metadata?.displayName || user.email || '',
        email: user.email || '',
        website: (user as any)?.user_metadata?.website || '',
      });
    }
    if (preferences) {
      setNotifications(current => ({ ...current, ...(preferences.email_notifications || {}) }));
      setPrivacy(current => ({ ...current, ...(preferences.privacy_settings || {}) }));
      setSecurity(current => ({ ...current, ...(preferences.interface_settings?.security || {}) }));
    }
  }, [user, preferences]);

  const saveAccount = async () => {
    try {
      const updates: any = { data: { displayName: account.displayName, website: account.website } };
      if (account.email && account.email !== user?.email) updates.email = account.email;
      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;
      toast({ title: 'Account settings saved' });
    } catch (e: any) {
      toast({ title: 'Account save failed', description: e?.message || '', variant: 'destructive' });
    }
  };

  const savePreferences = async () => {
    try {
      await updatePreferences({
        email_notifications: notifications,
        privacy_settings: privacy,
        interface_settings: { security },
      });
      toast({ title: 'Preferences saved successfully' });
    } catch (error: any) {
      toast({ title: 'Failed to save preferences', description: error.message, variant: 'destructive' });
    }
  };

  const handlePushToggle = async (value: boolean) => {
    if (value && typeof Notification !== 'undefined') {
      try {
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') {
          setNotifications(n => ({ ...n, push_enabled: false }));
          toast({ title: 'Push blocked', description: 'Please allow notifications in your browser settings.' });
          return;
        }
      } catch {}
    }
    setNotifications(n => ({ ...n, push_enabled: value }));
  };

  const updatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast({ title: 'Password too short', description: 'Use at least 6 characters.', variant: 'destructive' });
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword("");
      toast({ title: 'Password updated' });
    } catch (e: any) {
      toast({ title: 'Password update failed', description: e?.message || '', variant: 'destructive' });
    }
  };

  const deleteAccount = async () => {
    if (!user) { toast({ title: 'Not logged in', variant: 'destructive' }); return; }
    if (!confirm('Are you sure you want to permanently delete your account and all data? This cannot be undone.')) return;
    const second = prompt('Type DELETE to confirm');
    if ((second || '').trim().toUpperCase() !== 'DELETE') return;
    try {
      // This should be handled by a backend function for security and completeness
      const { error } = await supabase.rpc('delete_user_account');
      if (error) throw error;
      
      await supabase.auth.signOut();
      toast({ title: 'Account deleted successfully' });
      window.location.href = '/';
    } catch (e: any) {
      toast({ title: 'Failed to delete account', description: e?.message || 'An error occurred.', variant: 'destructive' });
    }
  };

  const sendReport = () => {
    const subject = encodeURIComponent(reportSubject || "Website Issue Report");
    const body = encodeURIComponent(`User: ${user?.email || 'guest'}\n\nDetails:\n${reportDetails}`);
    window.location.href = `mailto:shriharikrishna2356@gmail.com?subject=${subject}&body=${body}`;
    toast({ title: 'Opening email app to send report' });
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({ title: 'Signed out' });
      window.location.href = '/';
    } catch (e: any) {
      toast({ title: 'Sign out failed', description: e?.message || '', variant: 'destructive' });
    }
  };

  if (isLoadingPreferences) {
    return <Layout><div>Loading settings...</div></Layout>;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Settings</h1>
        <Tabs defaultValue="account" className="space-y-6">
          <div className="w-full overflow-x-auto">
            <TabsList className="flex w-max md:w-full md:grid md:grid-cols-6 gap-2 md:gap-0">
              <TabsTrigger value="account" className="whitespace-nowrap">Account</TabsTrigger>
              <TabsTrigger value="notifications" className="whitespace-nowrap">Notifications</TabsTrigger>
              <TabsTrigger value="privacy" className="whitespace-nowrap">Privacy</TabsTrigger>
              <TabsTrigger value="security" className="whitespace-nowrap">Security</TabsTrigger>
              <TabsTrigger value="danger" className="whitespace-nowrap">Danger Zone</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="account">
            <Card className="shadow-card">
              <CardHeader><CardTitle className="text-lg md:text-xl">Account</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Display Name</Label>
                    <Input value={account.displayName} onChange={(e) => setAccount(a => ({ ...a, displayName: e.target.value }))} placeholder="Your name" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={account.email} onChange={(e) => setAccount(a => ({ ...a, email: e.target.value }))} placeholder="you@example.com" />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Website</Label>
                    <Input value={account.website} onChange={(e) => setAccount(a => ({ ...a, website: e.target.value }))} placeholder="https://" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveAccount}>Save</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="shadow-card">
              <CardHeader><CardTitle className="text-lg md:text-xl">Notifications</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox id="product-updates" checked={notifications.product_updates} onCheckedChange={(v: boolean) => setNotifications(n => ({ ...n, product_updates: v }))} />
                    <Label htmlFor="product-updates">Product updates</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="roadmap-activity" checked={notifications.roadmap_activity} onCheckedChange={(v: boolean) => setNotifications(n => ({ ...n, roadmap_activity: v }))} />
                    <Label htmlFor="roadmap-activity">Roadmap activity (comments, mentions)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="weekly-digest" checked={notifications.weekly_digest} onCheckedChange={(v: boolean) => setNotifications(n => ({ ...n, weekly_digest: v }))} />
                    <Label htmlFor="weekly-digest">Weekly email digest</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="marketing-emails" checked={notifications.marketing_emails} onCheckedChange={(v: boolean) => setNotifications(n => ({ ...n, marketing_emails: v }))} />
                    <Label htmlFor="marketing-emails">Marketing emails</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="push-enabled" checked={notifications.push_enabled} onCheckedChange={(v: boolean) => handlePushToggle(v)} />
                    <Label htmlFor="push-enabled">Enable push notifications</Label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={savePreferences}>Save</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card className="shadow-card">
              <CardHeader><CardTitle className="text-lg md:text-xl">Privacy</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Profile Visibility</Label>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <label className="flex items-center gap-2"><input type="radio" name="visibility" checked={privacy.profile_visibility==='public'} onChange={() => setPrivacy(p => ({ ...p, profile_visibility: 'public' }))} /> Public</label>
                      <label className="flex items-center gap-2"><input type="radio" name="visibility" checked={privacy.profile_visibility==='friends'} onChange={() => setPrivacy(p => ({ ...p, profile_visibility: 'friends' }))} /> Friends</label>
                      <label className="flex items-center gap-2"><input type="radio" name="visibility" checked={privacy.profile_visibility==='private'} onChange={() => setPrivacy(p => ({ ...p, profile_visibility: 'private' }))} /> Private</label>
                    </div>
                  </div>
                  <div>
                    <Label>Show Follower Counts</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Checkbox id="show-followers" checked={privacy.show_follower_counts} onCheckedChange={(v: boolean) => setPrivacy(p => ({ ...p, show_follower_counts: v }))} />
                      <Label htmlFor="show-followers">Display follower/following numbers</Label>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Show Activity</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Checkbox id="show-activity" checked={privacy.show_activity} onCheckedChange={(v: boolean) => setPrivacy(p => ({ ...p, show_activity: v }))} />
                      <Label htmlFor="show-activity">Allow others to see my recent activity</Label>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={savePreferences}>Save</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="shadow-card">
              <CardHeader><CardTitle className="text-lg md:text-xl">Security</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Checkbox id="two-factor" checked={security.two_factor_enabled} onCheckedChange={(v: boolean) => setSecurity(s => ({ ...s, two_factor_enabled: v }))} />
                  <Label htmlFor="two-factor">Enable Two-Factor Authentication (via email)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="login-alerts" checked={security.login_alerts} onCheckedChange={(v: boolean) => setSecurity(s => ({ ...s, login_alerts: v }))} />
                  <Label htmlFor="login-alerts">Email me on new logins</Label>
                </div>
                 <Button onClick={savePreferences}>Save Security Settings</Button>
                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t mt-4">
                  <div>
                    <Label>Change Password</Label>
                    <Input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </div>
                  <div>
                    <Label>&nbsp;</Label>
                    <Button className="w-full" onClick={updatePassword}>Update Password</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="danger">
            <Card className="shadow-card">
              <CardHeader><CardTitle className="text-lg md:text-xl">Danger Zone</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-md">
                  <h3 className="font-semibold mb-2">Report a Problem</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>Subject</Label>
                      <Input value={reportSubject} onChange={(e) => setReportSubject(e.target.value)} placeholder="Brief summary" />
                    </div>
                    <div>
                      <Label>Details</Label>
                      <textarea className="w-full border rounded-md p-2 bg-background" rows={4} value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} placeholder="Describe the issue, steps to reproduce, screenshots links, etc." />
                    </div>
                    <Button onClick={sendReport}>Send Report</Button>
                  </div>
                </div>
                <div className="p-4 border rounded-md">
                  <h3 className="font-semibold mb-2">Delete Account</h3>
                  <p className="text-sm text-muted-foreground mb-3">This will permanently delete your account and remove all your data. This action cannot be undone.</p>
                  <Button variant="destructive" onClick={deleteAccount}>Delete Account</Button>
                </div>
                <div className="p-4 border rounded-md">
                  <h3 className="font-semibold mb-2">Sign Out</h3>
                  <p className="text-sm text-muted-foreground mb-3">You can sign back in anytime.</p>
                  <Button variant="outline" onClick={signOut}>Sign Out</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
