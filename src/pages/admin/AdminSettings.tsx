import { useEffect, useState } from "react";
import { Eye, EyeOff, Save, CreditCard, CheckCircle, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

type Setting = {
  id: string;
  setting_key: string;
  setting_value: string | null;
  setting_label: string | null;
  setting_group: string;
};

const GATEWAY_OPTIONS = [
  { value: "cod", label: "Cash on Delivery", description: "No online payment, collect cash at delivery" },
  { value: "razorpay", label: "Razorpay", description: "Popular Indian payment gateway (UPI, Cards, Net Banking)" },
  { value: "stripe", label: "Stripe", description: "International payments (Cards)" },
];

const AdminSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("admin_settings").select("*").order("setting_group");
    setSettings(data || []);
    const values: Record<string, string> = {};
    (data || []).forEach((s: Setting) => { values[s.setting_key] = s.setting_value || ""; });
    setForm(values);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    const updates = settings.map((s) => ({
      id: s.id,
      setting_key: s.setting_key,
      setting_value: form[s.setting_key] ?? "",
      setting_label: s.setting_label,
      setting_group: s.setting_group,
    }));

    for (const u of updates) {
      await supabase.from("admin_settings").upsert(u, { onConflict: "setting_key" });
    }

    toast({ title: "Settings saved!", description: "Payment gateway settings have been updated." });
    setSaving(false);
    load();
  };

  const toggle = (key: string) => setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));

  // Multi-select payment methods
  const enabledMethods = (form["payment_gateway"] || "cod").split(",").filter(Boolean);

  const toggleMethod = (method: string) => {
    let updated: string[];
    if (enabledMethods.includes(method)) {
      updated = enabledMethods.filter(m => m !== method);
      if (updated.length === 0) updated = ["cod"]; // At least one must be enabled
    } else {
      updated = [...enabledMethods, method];
    }
    setForm(prev => ({ ...prev, payment_gateway: updated.join(",") }));
  };

  if (loading) return <div className="text-muted-foreground text-sm">Loading settings...</div>;

  return (
    <div className="max-w-2xl">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure payment gateways and store settings</p>
      </div>

      {/* Payment Methods Multi-Select */}
      <div className="mt-8">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Enabled Payment Methods
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Select all payment methods you want to offer customers at checkout.</p>
        <div className="mt-4 grid gap-3">
          {GATEWAY_OPTIONS.map((gw) => {
            const isEnabled = enabledMethods.includes(gw.value);
            return (
              <button
                key={gw.value}
                type="button"
                onClick={() => toggleMethod(gw.value)}
                className={`flex items-start gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                  isEnabled
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <Checkbox checked={isEnabled} className="mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">{gw.label}</p>
                  <p className="text-sm text-muted-foreground">{gw.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Razorpay Settings */}
      {enabledMethods.includes("razorpay") && (
        <div className="mt-8 rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">Razorpay Configuration</h3>
            <a href="https://dashboard.razorpay.com/app/website-app-settings/api-keys" target="_blank" rel="noopener noreferrer" className="text-xs text-accent underline">Get API Keys →</a>
          </div>
          <p className="text-xs text-muted-foreground">Get your API keys from the Razorpay Dashboard → Settings → API Keys</p>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">Key ID (Publishable)</label>
              <Input
                value={form["razorpay_key_id"] || ""}
                onChange={(e) => setForm(prev => ({ ...prev, razorpay_key_id: e.target.value }))}
                placeholder="rzp_live_XXXXXXXXXXXXXXXX"
                className="mt-1 font-mono"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Key Secret</label>
              <div className="relative mt-1">
                <Input
                  type={showKeys["razorpay_key_secret"] ? "text" : "password"}
                  value={form["razorpay_key_secret"] || ""}
                  onChange={(e) => setForm(prev => ({ ...prev, razorpay_key_secret: e.target.value }))}
                  placeholder="Enter Razorpay Key Secret"
                  className="font-mono pr-10"
                />
                <button type="button" onClick={() => toggle("razorpay_key_secret")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showKeys["razorpay_key_secret"] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted border border-border p-3 text-xs text-muted-foreground">
            ⚠️ Never share your Key Secret. It is stored encrypted and only used server-side.
          </div>
        </div>
      )}

      {/* Stripe Settings */}
      {enabledMethods.includes("stripe") && (
        <div className="mt-8 rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">Stripe Configuration</h3>
            <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-xs text-accent underline">Get API Keys →</a>
          </div>
          <p className="text-xs text-muted-foreground">Get your API keys from the Stripe Dashboard → Developers → API keys</p>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">Publishable Key</label>
              <Input
                value={form["stripe_publishable_key"] || ""}
                onChange={(e) => setForm(prev => ({ ...prev, stripe_publishable_key: e.target.value }))}
                placeholder="pk_live_XXXXXXXXXXXXXXXX"
                className="mt-1 font-mono"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Secret Key</label>
              <div className="relative mt-1">
                <Input
                  type={showKeys["stripe_secret_key"] ? "text" : "password"}
                  value={form["stripe_secret_key"] || ""}
                  onChange={(e) => setForm(prev => ({ ...prev, stripe_secret_key: e.target.value }))}
                  placeholder="sk_live_XXXXXXXXXXXXXXXX"
                  className="font-mono pr-10"
                />
                <button type="button" onClick={() => toggle("stripe_secret_key")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showKeys["stripe_secret_key"] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted border border-border p-3 text-xs text-muted-foreground">
            ⚠️ Never share your Secret Key. It is stored encrypted and only used server-side.
          </div>
        </div>
      )}

      {/* Footer Settings */}
      <div className="mt-12">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Footer Settings
        </h2>
        <div className="mt-4 rounded-xl border border-border bg-card p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Footer Tagline</label>
            <Input
              value={form["footer_tagline"] || ""}
              onChange={(e) => setForm(prev => ({ ...prev, footer_tagline: e.target.value }))}
              placeholder="Pure nutrition packed in every bite..."
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">WhatsApp Number (with country code)</label>
            <Input
              value={form["footer_whatsapp"] || ""}
              onChange={(e) => setForm(prev => ({ ...prev, footer_whatsapp: e.target.value }))}
              placeholder="919876543210"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Copyright Text</label>
            <Input
              value={form["footer_copyright"] || ""}
              onChange={(e) => setForm(prev => ({ ...prev, footer_copyright: e.target.value }))}
              placeholder="NanheRam. All rights reserved."
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Button onClick={save} disabled={saving} className="rounded-full px-8">
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
