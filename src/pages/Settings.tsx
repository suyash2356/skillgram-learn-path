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

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const storageKey = `settings:${user?.id || 'guest'}`;
  const [reportSubject, setReportSubject] = useState("");
  const [reportDetails, setReportDetails] = useState("");

  const [account, setAccount] = useState({
    displayName: "",
    email: "",
    website: "",
  });

  const [notifications, setNotifications] = useState({
    productUpdates: true,
    roadmapActivity: true,
    weeklyDigest: false,
    marketingEmails: false,
    pushEnabled: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: "public" as "public" | "private" | "friends",
    showFollowerCounts: true,
    showActivity: true,
  });

  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
  });

  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setAccount(parsed.account || account);
        setNotifications(parsed.notifications || notifications);
        setPrivacy(parsed.privacy || privacy);
        setSecurity(parsed.security || security);
      } else {
        // hydrate account from Supabase user if available
        setAccount(a => ({
          ...a,
          displayName: (user as any)?.user_metadata?.displayName || a.displayName,
          email: user?.email || a.email,
          website: (user as any)?.user_metadata?.website || a.website,
        }));
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ account, notifications, privacy, security }));
    } catch {}
  }, [account, notifications, privacy, security, storageKey]);

  const exportData = async () => {
    try {
      const blob = new Blob([JSON.stringify({ account, notifications, privacy, security }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'settings-export.json'; a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  const saveAccount = async () => {
    try {
      // Update auth user metadata and/or email
      const updates: any = { data: { displayName: account.displayName, website: account.website } };
      if (account.email && account.email !== user?.email) updates.email = account.email;
      const { error } = await supabase.auth.updateUser(updates);
      if (error) {
        toast({ title: 'Account save failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Account settings saved' });
      }
    } catch (e: any) {
      toast({ title: 'Account save failed', description: e?.message || '', variant: 'destructive' });
    }
  };

  const handlePushToggle = async (value: boolean) => {
    if (value && typeof Notification !== 'undefined') {
      try {
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') {
          setNotifications(n => ({ ...n, pushEnabled: false }));
          toast({ title: 'Push blocked', description: 'Please allow notifications in your browser settings.' });
          return;
        }
      } catch {}
    }
    setNotifications(n => ({ ...n, pushEnabled: value }));
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
      // Remove user data we own in this app (example: roadmaps and their children)
      const { data: steps, error: stepsErr } = await supabase.from('roadmap_steps').select('id, roadmap_id').in('roadmap_id', (await supabase.from('roadmaps').select('id').eq('user_id', user.id)).data?.map(r => r.id) || []);
      if (stepsErr) {}
      if (steps && steps.length > 0) {
        const stepIds = steps.map(s => s.id);
        await supabase.from('roadmap_step_resources').delete().in('step_id', stepIds);
      }
      await supabase.from('roadmap_steps').delete().in('roadmap_id', (await supabase.from('roadmaps').select('id').eq('user_id', user.id)).data?.map(r => r.id) || []);
      await supabase.from('roadmaps').delete().eq('user_id', user.id);
      await supabase.auth.signOut();
      toast({ title: 'Account deleted' });
      window.location.href = '/';
    } catch (e: any) {
      toast({ title: 'Failed to delete account', description: e?.message || '', variant: 'destructive' });
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
              <TabsTrigger value="data" className="whitespace-nowrap">Data & Export</TabsTrigger>
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
                  <Button variant="outline" onClick={() => window.location.reload()}>Cancel</Button>
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
                    <Checkbox id="product-updates" checked={notifications.productUpdates} onCheckedChange={(v: boolean) => setNotifications(n => ({ ...n, productUpdates: v }))} />
                    <Label htmlFor="product-updates">Product updates</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="roadmap-activity" checked={notifications.roadmapActivity} onCheckedChange={(v: boolean) => setNotifications(n => ({ ...n, roadmapActivity: v }))} />
                    <Label htmlFor="roadmap-activity">Roadmap activity (comments, mentions)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="weekly-digest" checked={notifications.weeklyDigest} onCheckedChange={(v: boolean) => setNotifications(n => ({ ...n, weeklyDigest: v }))} />
                    <Label htmlFor="weekly-digest">Weekly email digest</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="marketing-emails" checked={notifications.marketingEmails} onCheckedChange={(v: boolean) => setNotifications(n => ({ ...n, marketingEmails: v }))} />
                    <Label htmlFor="marketing-emails">Marketing emails</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="push-enabled" checked={notifications.pushEnabled} onCheckedChange={(v: boolean) => handlePushToggle(v)} />
                    <Label htmlFor="push-enabled">Enable push notifications</Label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => toast({ title: 'Notification preferences saved' })}>Save</Button>
                  <Button variant="outline" onClick={() => window.location.reload()}>Cancel</Button>
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
                      <label className="flex items-center gap-2"><input type="radio" name="visibility" checked={privacy.profileVisibility==='public'} onChange={() => setPrivacy(p => ({ ...p, profileVisibility: 'public' }))} /> Public</label>
                      <label className="flex items-center gap-2"><input type="radio" name="visibility" checked={privacy.profileVisibility==='friends'} onChange={() => setPrivacy(p => ({ ...p, profileVisibility: 'friends' }))} /> Friends</label>
                      <label className="flex items-center gap-2"><input type="radio" name="visibility" checked={privacy.profileVisibility==='private'} onChange={() => setPrivacy(p => ({ ...p, profileVisibility: 'private' }))} /> Private</label>
                    </div>
                  </div>
                  <div>
                    <Label>Show Follower Counts</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Checkbox id="show-followers" checked={privacy.showFollowerCounts} onCheckedChange={(v: boolean) => setPrivacy(p => ({ ...p, showFollowerCounts: v }))} />
                      <Label htmlFor="show-followers">Display follower/following numbers</Label>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Show Activity</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Checkbox id="show-activity" checked={privacy.showActivity} onCheckedChange={(v: boolean) => setPrivacy(p => ({ ...p, showActivity: v }))} />
                      <Label htmlFor="show-activity">Allow others to see my recent activity</Label>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => toast({ title: 'Privacy settings saved' })}>Save</Button>
                  <Button variant="outline" onClick={() => window.location.reload()}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="shadow-card">
              <CardHeader><CardTitle className="text-lg md:text-xl">Security</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Checkbox id="two-factor" checked={security.twoFactorEnabled} onCheckedChange={(v: boolean) => setSecurity(s => ({ ...s, twoFactorEnabled: v }))} />
                  <Label htmlFor="two-factor">Enable Two-Factor Authentication (via email)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="login-alerts" checked={security.loginAlerts} onCheckedChange={(v: boolean) => setSecurity(s => ({ ...s, loginAlerts: v }))} />
                  <Label htmlFor="login-alerts">Email me on new logins</Label>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
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

          <TabsContent value="data">
            <Card className="shadow-card">
              <CardHeader><CardTitle className="text-lg md:text-xl">Data & Export</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" onClick={exportData}>Export Settings (JSON)</Button>
                <div className="text-sm text-muted-foreground">Exports only your settings from this page. Roadmaps and profile data are managed elsewhere.</div>
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
                  <p className="text-sm text-muted-foreground mb-3">This will permanently delete your account and remove all your roadmaps. This action cannot be undone.</p>
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
