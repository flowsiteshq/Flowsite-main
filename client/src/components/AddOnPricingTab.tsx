/**
 * AddOnPricingTab — Interactive add-on selector for agents
 * Features:
 *  - Search bar filtering across all add-ons
 *  - Multi-select checkboxes on every card
 *  - Sticky cart panel showing selected items + running total
 *  - Assign-to-client modal with client search
 *  - Save quote to DB
 */
import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { CORE_ADDONS, AUTO_ADDONS, INDUSTRY_ADDONS, fmt, type AddOn } from "@/lib/addons";
import {
  Search,
  X,
  ShoppingCart,
  Layers,
  Cpu,
  Building,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  User,
  FileText,
  Trash2,
  Check,
} from "lucide-react";

const ALL_ADDONS: AddOn[] = [
  ...CORE_ADDONS,
  ...AUTO_ADDONS,
  ...Object.values(INDUSTRY_ADDONS).flat(),
];

const INDUSTRY_LABELS: Record<string, { label: string; colorClass: string }> = {
  martial_arts: { label: "Martial Arts",            colorClass: "text-red-400" },
  restaurant:   { label: "Restaurant",              colorClass: "text-orange-400" },
  salon:        { label: "Salon / Spa",             colorClass: "text-pink-400" },
  insurance:    { label: "Insurance",               colorClass: "text-sky-400" },
  real_estate:  { label: "Real Estate",             colorClass: "text-emerald-400" },
  general:      { label: "General / Service Biz",   colorClass: "text-gray-400" },
};

interface Props {
  isDark: boolean;
}

export default function AddOnPricingTab({ isDark }: Props) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [cartOpen, setCartOpen] = useState(true);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [selectedClientName, setSelectedClientName] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch client accounts for the assign modal
  const { data: accounts } = trpc.clientBilling.adminListAccounts.useQuery();
  const saveQuoteMutation = trpc.clientBilling.saveAddonQuote.useMutation();

  const selectedAddons = useMemo(
    () => ALL_ADDONS.filter((a) => selected.has(a.id)),
    [selected]
  );

  const total = useMemo(
    () => selectedAddons.reduce((sum, a) => sum + a.price, 0),
    [selectedAddons]
  );

  const filteredAccounts = useMemo(() => {
    if (!accounts) return [];
    const q = clientSearch.toLowerCase();
    return accounts.filter(
      (a) =>
        a.clientName.toLowerCase().includes(q) ||
        a.businessName.toLowerCase().includes(q) ||
        (a.clientEmail ?? "").toLowerCase().includes(q)
    );
  }, [accounts, clientSearch]);

  const toggleAddon = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearAll = () => {
    setSelected(new Set());
  };

  const handleSaveQuote = async () => {
    if (selected.size === 0) {
      toast.error("Select at least one add-on before saving a quote.");
      return;
    }
    if (!selectedClientName && !selectedClientId) {
      toast.error("Please assign this quote to a client first.");
      return;
    }
    setSaving(true);
    try {
      const client = selectedClientId
        ? accounts?.find((a) => a.id === selectedClientId)
        : null;
      await saveQuoteMutation.mutateAsync({
        clientAccountId: selectedClientId ?? undefined,
        clientName: client?.clientName ?? selectedClientName,
        clientEmail: client?.clientEmail ?? "",
        addonIds: selectedAddons.map((a) => a.id),
        addonLabels: selectedAddons.map((a) => a.label),
        addonPrices: selectedAddons.map((a) => a.price),
        totalCents: total,
        notes,
      });
      toast.success(`Quote saved — ${selectedAddons.length} add-ons, ${fmt(total)} total`);
      setAssignModalOpen(false);
      clearAll();
      setNotes("");
      setSelectedClientId(null);
      setSelectedClientName("");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save quote");
    } finally {
      setSaving(false);
    }
  };

  // Filter add-ons by search query
  const filterAddons = (addons: AddOn[]) => {
    if (!search.trim()) return addons;
    const q = search.toLowerCase();
    return addons.filter(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        (a.description ?? "").toLowerCase().includes(q)
    );
  };

  const bg = isDark ? "bg-[oklch(0.13_0.005_260)]" : "bg-gray-50";
  const cardBg = isDark ? "bg-white/4 border-white/8 hover:bg-white/7" : "bg-white border-gray-200 hover:bg-gray-50";
  const selectedCardBg = isDark
    ? "bg-red-500/12 border-red-500/40 ring-1 ring-red-500/30"
    : "bg-red-50 border-red-300 ring-1 ring-red-200";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textMuted = isDark ? "text-white/50" : "text-gray-500";
  const divider = isDark ? "border-white/10" : "border-gray-200";

  const AddonCard = ({ addon }: { addon: AddOn }) => {
    const isSelected = selected.has(addon.id);
    return (
      <button
        key={addon.id}
        onClick={() => toggleAddon(addon.id)}
        className={`w-full text-left rounded-xl p-4 border flex items-start gap-3 transition-all duration-150 cursor-pointer ${
          isSelected ? selectedCardBg : cardBg
        }`}
      >
        <div className="mt-0.5 flex-shrink-0">
          {isSelected ? (
            <CheckSquare size={18} className="text-red-400" />
          ) : (
            <Square size={18} className={textMuted} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium leading-tight ${textPrimary}`}>{addon.label}</p>
          {addon.description && (
            <p className={`text-xs mt-0.5 ${textMuted}`}>{addon.description}</p>
          )}
        </div>
        <span className={`text-sm font-bold whitespace-nowrap ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
          {fmt(addon.price)}
        </span>
      </button>
    );
  };

  const filteredCore = filterAddons(CORE_ADDONS);
  const filteredAuto = filterAddons(AUTO_ADDONS);
  const filteredIndustry = Object.entries(INDUSTRY_ADDONS).map(([key, addons]) => ({
    key,
    addons: filterAddons(addons),
  })).filter((g) => g.addons.length > 0);

  const hasResults = filteredCore.length > 0 || filteredAuto.length > 0 || filteredIndustry.length > 0;

  return (
    <div className={`flex gap-6 p-6 min-h-screen ${bg}`}>
      {/* ── Main catalog ── */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="mb-6">
          <h2 className={`text-2xl font-bold mb-1 ${textPrimary}`}>Add-On Pricing</h2>
          <p className={`text-sm ${textMuted}`}>
            Click any add-on to select it. Build a quote and assign it to a client.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative mb-6">
          <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} />
          <input
            type="text"
            placeholder="Search add-ons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
              isDark
                ? "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/25"
                : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-gray-400"
            }`}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${textMuted} hover:text-white transition-colors`}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {!hasResults && (
          <div className={`text-center py-16 ${textMuted}`}>
            <Search size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No add-ons match "{search}"</p>
          </div>
        )}

        {/* Website Add-Ons */}
        {filteredCore.length > 0 && (
          <section className="mb-8">
            <div className={`flex items-center gap-2 mb-4 pb-2 border-b ${divider}`}>
              <Layers size={18} className="text-blue-400" />
              <h3 className={`text-base font-semibold ${textPrimary}`}>Website Add-Ons</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? "bg-blue-500/15 text-blue-300" : "bg-blue-100 text-blue-700"}`}>
                {filteredCore.length} items
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredCore.map((addon) => <AddonCard key={addon.id} addon={addon} />)}
            </div>
          </section>
        )}

        {/* Automation Add-Ons */}
        {filteredAuto.length > 0 && (
          <section className="mb-8">
            <div className={`flex items-center gap-2 mb-4 pb-2 border-b ${divider}`}>
              <Cpu size={18} className="text-purple-400" />
              <h3 className={`text-base font-semibold ${textPrimary}`}>Automation & Integration Add-Ons</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? "bg-purple-500/15 text-purple-300" : "bg-purple-100 text-purple-700"}`}>
                {filteredAuto.length} items
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredAuto.map((addon) => <AddonCard key={addon.id} addon={addon} />)}
            </div>
          </section>
        )}

        {/* Industry-Specific Add-Ons */}
        {filteredIndustry.length > 0 && (
          <section>
            <div className={`flex items-center gap-2 mb-4 pb-2 border-b ${divider}`}>
              <Building size={18} className="text-amber-400" />
              <h3 className={`text-base font-semibold ${textPrimary}`}>Industry-Specific Add-Ons</h3>
            </div>
            {filteredIndustry.map(({ key, addons }) => {
              const meta = INDUSTRY_LABELS[key] ?? { label: key, colorClass: "text-gray-400" };
              return (
                <div key={key} className="mb-6">
                  <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${meta.colorClass}`}>
                    {meta.label}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {addons.map((addon) => <AddonCard key={addon.id} addon={addon} />)}
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </div>

      {/* ── Sticky Cart Panel ── */}
      <div className="w-80 flex-shrink-0">
        <div
          className={`sticky top-6 rounded-2xl border overflow-hidden ${
            isDark ? "bg-[oklch(0.16_0.005_260)] border-white/10" : "bg-white border-gray-200"
          }`}
        >
          {/* Cart header */}
          <button
            onClick={() => setCartOpen((v) => !v)}
            className={`w-full flex items-center justify-between px-5 py-4 border-b ${divider}`}
          >
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} className="text-red-400" />
              <span className={`text-sm font-semibold ${textPrimary}`}>
                Selected Add-Ons
              </span>
              {selected.size > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold">
                  {selected.size}
                </span>
              )}
            </div>
            {cartOpen ? (
              <ChevronUp size={16} className={textMuted} />
            ) : (
              <ChevronDown size={16} className={textMuted} />
            )}
          </button>

          {cartOpen && (
            <>
              {/* Cart items */}
              <div className="max-h-80 overflow-y-auto">
                {selectedAddons.length === 0 ? (
                  <div className={`px-5 py-8 text-center ${textMuted}`}>
                    <ShoppingCart size={28} className="mx-auto mb-2 opacity-25" />
                    <p className="text-xs">Click add-ons to select them</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-white/5">
                    {selectedAddons.map((addon) => (
                      <li key={addon.id} className="flex items-center gap-3 px-5 py-3">
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium truncate ${textPrimary}`}>{addon.label}</p>
                        </div>
                        <span className={`text-xs font-bold whitespace-nowrap ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                          {fmt(addon.price)}
                        </span>
                        <button
                          onClick={() => toggleAddon(addon.id)}
                          className={`${textMuted} hover:text-red-400 transition-colors flex-shrink-0`}
                        >
                          <X size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Total */}
              {selectedAddons.length > 0 && (
                <div className={`px-5 py-3 border-t ${divider}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${textPrimary}`}>Total</span>
                    <span className="text-lg font-bold text-red-400">{fmt(total)}</span>
                  </div>
                  <p className={`text-xs mt-0.5 ${textMuted}`}>One-time build cost</p>
                </div>
              )}

              {/* Actions */}
              <div className={`px-5 py-4 border-t ${divider} flex flex-col gap-2`}>
                <button
                  onClick={() => setAssignModalOpen(true)}
                  disabled={selected.size === 0}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <User size={15} />
                  Assign to Client
                </button>
                {selected.size > 0 && (
                  <button
                    onClick={clearAll}
                    className={`w-full py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                      isDark
                        ? "text-white/40 hover:text-white/70"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <Trash2 size={13} />
                    Clear all
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Assign to Client Modal ── */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setAssignModalOpen(false)}
          />
          <div
            className={`relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden ${
              isDark ? "bg-[oklch(0.14_0.005_260)] border-white/12" : "bg-white border-gray-200"
            }`}
          >
            {/* Modal header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b ${divider}`}>
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-red-400" />
                <h3 className={`text-base font-semibold ${textPrimary}`}>Assign Quote to Client</h3>
              </div>
              <button
                onClick={() => setAssignModalOpen(false)}
                className={`${textMuted} hover:text-white transition-colors`}
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Quote summary */}
              <div className={`rounded-xl p-4 border ${isDark ? "bg-white/4 border-white/8" : "bg-gray-50 border-gray-200"}`}>
                <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${textMuted}`}>Quote Summary</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {selectedAddons.map((a) => (
                    <div key={a.id} className="flex justify-between text-xs">
                      <span className={textMuted}>{a.label}</span>
                      <span className={`font-medium ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>{fmt(a.price)}</span>
                    </div>
                  ))}
                </div>
                <div className={`flex justify-between mt-3 pt-2 border-t ${divider}`}>
                  <span className={`text-sm font-semibold ${textPrimary}`}>Total</span>
                  <span className="text-sm font-bold text-red-400">{fmt(total)}</span>
                </div>
              </div>

              {/* Client search */}
              <div>
                <label className={`text-xs font-semibold uppercase tracking-wider mb-2 block ${textMuted}`}>
                  Search Client
                </label>
                <div className="relative">
                  <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} />
                  <input
                    type="text"
                    placeholder="Name, business, or email..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className={`w-full pl-8 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                      isDark
                        ? "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/25"
                        : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-gray-400"
                    }`}
                  />
                </div>

                {/* Client list */}
                <div className={`mt-2 rounded-xl border overflow-hidden max-h-44 overflow-y-auto ${isDark ? "border-white/8" : "border-gray-200"}`}>
                  {filteredAccounts.length === 0 ? (
                    <div className={`px-4 py-3 text-xs text-center ${textMuted}`}>
                      {clientSearch ? "No clients match your search" : "No clients found"}
                    </div>
                  ) : (
                    filteredAccounts.map((account) => (
                      <button
                        key={account.id}
                        onClick={() => {
                          setSelectedClientId(account.id);
                          setSelectedClientName(account.clientName);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b last:border-b-0 ${divider} ${
                          selectedClientId === account.id
                            ? isDark
                              ? "bg-red-500/15"
                              : "bg-red-50"
                            : isDark
                            ? "hover:bg-white/5"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-red-400">
                            {account.clientName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${textPrimary}`}>{account.clientName}</p>
                          <p className={`text-xs truncate ${textMuted}`}>{account.businessName}</p>
                        </div>
                        {selectedClientId === account.id && (
                          <Check size={16} className="text-red-400 flex-shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className={`text-xs font-semibold uppercase tracking-wider mb-2 block ${textMuted}`}>
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this quote..."
                  rows={3}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none resize-none transition-colors ${
                    isDark
                      ? "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/25"
                      : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-gray-400"
                  }`}
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t ${divider}`}>
              <button
                onClick={() => setAssignModalOpen(false)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isDark ? "text-white/50 hover:text-white" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQuote}
                disabled={saving || !selectedClientId}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FileText size={15} />
                    Save Quote
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
