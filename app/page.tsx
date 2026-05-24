"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Crown,
  Download,
  Film,
  FolderOpen,
  ImagePlus,
  ListFilter,
  Lock,
  Play,
  RefreshCw,
  Search,
  Sparkles,
  Upload
} from "lucide-react";
import type { ChangeEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

type Plan = "free" | "pro";
type ProductStatus = "Needs content" | "Sample received" | "Filmed" | "Posted" | "Reuse winner";
type WorkspaceView = "command" | "products" | "workspace" | "upgrade";

type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  status: ProductStatus;
  image: string;
  due: string;
  nextAction: string;
  scriptStarter: string;
};

type ScriptSet = {
  id: string;
  hook: string;
  voiceover: string;
  caption: string;
  tags: string;
};

type FootageAsset = {
  id: string;
  name: string;
  type: string;
  note: string;
  url?: string;
  mime?: string;
};

type ProductRecord = {
  status: ProductStatus;
  scripts: ScriptSet[];
  footage: FootageAsset[];
  resultNote: string;
};

const products: Product[] = [
  {
    id: "mist",
    name: "Hydrating Facial Mist Sprayer",
    brand: "Sample Brand",
    category: "Beauty",
    status: "Needs content",
    image: "HM",
    due: "Due today",
    nextAction: "Film closeup mist, reaction, and before makeup shot.",
    scriptStarter: "I did not expect this to make my routine easier, but this is the part that changed everything."
  },
  {
    id: "organizer",
    name: "Countertop Storage Organizer",
    brand: "Home Sample",
    category: "Home",
    status: "Needs content",
    image: "CO",
    due: "Due tomorrow",
    nextAction: "Film before/after counter reset and final organized shot.",
    scriptStarter: "If your counter always looks messy, this tiny reset makes it look planned."
  },
  {
    id: "light",
    name: "Clip-On Creator Light",
    brand: "Creator Gear",
    category: "Filming",
    status: "Reuse winner",
    image: "CL",
    due: "Reuse this week",
    nextAction: "Reuse the best B-roll and create a second angle.",
    scriptStarter: "Here is what I would show differently after using this for a full week."
  },
  {
    id: "pouch",
    name: "Silicone Travel Makeup Pouch",
    brand: "Beauty Travel Co",
    category: "Travel",
    status: "Sample received",
    image: "MP",
    due: "Needs first post",
    nextAction: "Film purse dump, packing test, zipper closeup, and packed bag shot.",
    scriptStarter: "I tested what actually fits because the photos made it look smaller than it is."
  },
  {
    id: "vacuum",
    name: "Mini Desk Vacuum",
    brand: "Clean Desk Finds",
    category: "Home Office",
    status: "Filmed",
    image: "DV",
    due: "Edit next",
    nextAction: "Attach final CapCut export and track performance.",
    scriptStarter: "If your filming desk gets messy, this tiny cleanup tool is oddly satisfying."
  },
  {
    id: "curling",
    name: "Heatless Curling Rod Set",
    brand: "Morning Hair Sample",
    category: "Beauty Hair",
    status: "Needs content",
    image: "HC",
    due: "Due in 2 days",
    nextAction: "Film night setup, morning reveal, and curl check.",
    scriptStarter: "I wanted to see if this actually worked overnight, so I filmed the full before and after."
  }
];

const blankScript: ScriptSet = {
  id: "",
  hook: "",
  voiceover: "",
  caption: "",
  tags: ""
};

function initialRecords(): Record<string, ProductRecord> {
  return Object.fromEntries(
    products.map((product) => [
      product.id,
      {
        status: product.status,
        scripts: [],
        footage: [],
        resultNote: ""
      }
    ])
  );
}

export default function Home() {
  const [view, setView] = useState<WorkspaceView>("command");
  const [plan, setPlan] = useState<Plan>("free");
  const [query, setQuery] = useState("");
  const [activeProductId, setActiveProductId] = useState(products[0].id);
  const [records, setRecords] = useState<Record<string, ProductRecord>>(initialRecords);
  const [scriptDraft, setScriptDraft] = useState<ScriptSet>(blankScript);
  const [assetType, setAssetType] = useState("Raw camera clip");
  const [assetNote, setAssetNote] = useState("");
  const [tiktokRefresh, setTiktokRefresh] = useState({
    connected: false,
    message: "TikTok Showcase is ready for demo refresh."
  });

  const activeProduct = products.find((product) => product.id === activeProductId) || products[0];
  const activeRecord = records[activeProduct.id];
  const productLimit = plan === "free" ? 10 : Infinity;
  const scriptLimit = plan === "free" ? 2 : Infinity;
  const priorityLimit = plan === "free" ? 5 : Infinity;

  useEffect(() => {
    const savedRecords = window.localStorage.getItem("creatorvault-next-records");
    const savedPlan = window.localStorage.getItem("creatorvault-next-plan") as Plan | null;
    const savedProduct = window.localStorage.getItem("creatorvault-next-active-product");

    if (savedRecords) {
      try {
        setRecords({ ...initialRecords(), ...JSON.parse(savedRecords) });
      } catch {
        setRecords(initialRecords());
      }
    }

    if (savedPlan === "free" || savedPlan === "pro") {
      setPlan(savedPlan);
    }

    if (savedProduct && products.some((product) => product.id === savedProduct)) {
      setActiveProductId(savedProduct);
    }
  }, []);

  useEffect(() => {
    const storageSafeRecords = Object.fromEntries(
      Object.entries(records).map(([productId, record]) => [
        productId,
        {
          ...record,
          footage: record.footage.map((asset) => ({
            ...asset,
            url: "",
            mime: asset.mime || ""
          }))
        }
      ])
    );
    window.localStorage.setItem("creatorvault-next-records", JSON.stringify(storageSafeRecords));
  }, [records]);

  useEffect(() => {
    window.localStorage.setItem("creatorvault-next-plan", plan);
  }, [plan]);

  useEffect(() => {
    window.localStorage.setItem("creatorvault-next-active-product", activeProductId);
  }, [activeProductId]);

  const visibleProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return products
      .slice(0, productLimit)
      .filter((product) =>
        [product.name, product.brand, product.category, records[product.id]?.status, product.nextAction]
          .join(" ")
          .toLowerCase()
          .includes(normalized)
      );
  }, [plan, productLimit, query, records]);

  const priorities = useMemo(
    () =>
      products
        .filter((product) => ["Needs content", "Sample received"].includes(records[product.id]?.status || product.status))
        .slice(0, priorityLimit),
    [priorityLimit, records]
  );

  function openProduct(productId: string) {
    setActiveProductId(productId);
    setView("workspace");
    setScriptDraft(blankScript);
  }

  function updateStatus(status: ProductStatus) {
    setRecords((current) => ({
      ...current,
      [activeProduct.id]: {
        ...current[activeProduct.id],
        status
      }
    }));
  }

  function saveScript() {
    const existing = activeRecord.scripts;
    if (existing.length >= scriptLimit) {
      setView("upgrade");
      return;
    }

    const nextScript: ScriptSet = {
      id: crypto.randomUUID(),
      hook: scriptDraft.hook.trim() || activeProduct.scriptStarter,
      voiceover: scriptDraft.voiceover.trim() || activeProduct.nextAction,
      caption: scriptDraft.caption.trim() || "Caption idea saved for this product.",
      tags: scriptDraft.tags.trim() || "#tiktokshop #creatorvault"
    };

    setRecords((current) => ({
      ...current,
      [activeProduct.id]: {
        ...current[activeProduct.id],
        scripts: [nextScript, ...current[activeProduct.id].scripts]
      }
    }));
    setScriptDraft(blankScript);
  }

  function uploadFootage(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const uploaded = files.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      type: assetType,
      note: assetNote || "Saved to this product workspace for future reuse.",
      url: URL.createObjectURL(file),
      mime: file.type
    }));

    setRecords((current) => ({
      ...current,
      [activeProduct.id]: {
        ...current[activeProduct.id],
        footage: [...uploaded, ...current[activeProduct.id].footage]
      }
    }));
    setAssetNote("");
    event.target.value = "";
  }

  async function copyScript(script: ScriptSet) {
    const text = [
      `On-screen hook: ${script.hook}`,
      `Voiceover: ${script.voiceover}`,
      `Caption: ${script.caption}`,
      `Tags: ${script.tags}`
    ].join("\n\n");
    await navigator.clipboard?.writeText(text);
  }

  function refreshTikTokShowcase() {
    setTiktokRefresh({
      connected: true,
      message:
        plan === "pro"
          ? `Pulled ${products.length} demo Showcase products. Pro will pull the full approved TikTok Showcase when API access is connected.`
          : `Pulled ${Math.min(products.length, 10)} demo Showcase products. Free tracks up to 10 products.`
    });
    setQuery("");
    setView("products");
  }

  return (
    <main className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <div className="sticky top-0 z-20 border-b border-black/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <button
            className="flex items-center gap-2 rounded-lg bg-black px-3 py-2 text-sm font-black text-white"
            onClick={() => setView("command")}
          >
            <span className="grid h-8 w-8 place-items-center rounded-md bg-[#00f2ea] text-black">CV</span>
            CreatorVault
          </button>
          <div className="hidden items-center gap-2 md:flex">
            <NavButton active={view === "command"} icon={<Sparkles size={17} />} label="Command" onClick={() => setView("command")} />
            <NavButton active={view === "products"} icon={<ListFilter size={17} />} label="Products" onClick={() => setView("products")} />
            <NavButton active={view === "workspace"} icon={<FolderOpen size={17} />} label="Workspace" onClick={() => setView("workspace")} />
            <NavButton active={view === "upgrade"} icon={<Crown size={17} />} label="Upgrade" onClick={() => setView("upgrade")} />
          </div>
          <button
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-black"
            onClick={() => setPlan(plan === "free" ? "pro" : "free")}
          >
            {plan === "free" ? "Free" : "Pro demo"}
          </button>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[280px_1fr]">
        <aside className="hidden rounded-lg border border-black/10 bg-white p-3 shadow-soft lg:block">
          <p className="label px-2 py-2">Creator flow</p>
          <SideButton active={view === "command"} icon={<Sparkles size={18} />} label="What should I do today?" onClick={() => setView("command")} />
          <SideButton active={view === "products"} icon={<ListFilter size={18} />} label="TikTok product list" onClick={() => setView("products")} />
          <SideButton active={view === "workspace"} icon={<FolderOpen size={18} />} label="Active product workspace" onClick={() => setView("workspace")} />
          <SideButton active={view === "upgrade"} icon={<Crown size={18} />} label="Free vs Pro" onClick={() => setView("upgrade")} />
          <div className="mt-4 rounded-lg bg-slate-950 p-4 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#00f2ea]">Paid promise</p>
            <p className="mt-2 text-sm font-bold">Never lose product footage, hooks, captions, tags, or post ideas again.</p>
          </div>
        </aside>

        <section className="grid gap-5">
          {view === "command" && (
            <CommandCenter
              priorities={priorities}
              records={records}
              onOpenProduct={openProduct}
              onProducts={() => setView("products")}
              onRefresh={refreshTikTokShowcase}
              tiktokRefresh={tiktokRefresh}
            />
          )}

          {view === "products" && (
            <ProductList
              plan={plan}
              query={query}
              products={visibleProducts}
              records={records}
              onOpenProduct={openProduct}
              onQuery={setQuery}
              onRefresh={refreshTikTokShowcase}
              onUpgrade={() => setView("upgrade")}
              tiktokRefresh={tiktokRefresh}
            />
          )}

          {view === "workspace" && (
            <ProductWorkspace
              product={activeProduct}
              record={activeRecord}
              plan={plan}
              scriptDraft={scriptDraft}
              scriptLimit={scriptLimit}
              assetType={assetType}
              assetNote={assetNote}
              onBack={() => setView("products")}
              onCopyScript={copyScript}
              onSaveScript={saveScript}
              onScriptDraft={setScriptDraft}
              onStatus={updateStatus}
              onAssetNote={setAssetNote}
              onAssetType={setAssetType}
              onUpload={uploadFootage}
              onUpgrade={() => setView("upgrade")}
            />
          )}

          {view === "upgrade" && <Upgrade plan={plan} onPlan={setPlan} />}
        </section>
      </div>
    </main>
  );
}

function NavButton({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-black ${active ? "bg-black text-white" : "bg-white text-slate-700"}`}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}

function SideButton({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      className={`mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-black ${
        active ? "bg-[#00f2ea] text-black" : "text-slate-700 hover:bg-slate-100"
      }`}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}

function CommandCenter({
  priorities,
  records,
  onOpenProduct,
  onProducts,
  onRefresh,
  tiktokRefresh
}: {
  priorities: Product[];
  records: Record<string, ProductRecord>;
  onOpenProduct: (id: string) => void;
  onProducts: () => void;
  onRefresh: () => void;
  tiktokRefresh: { connected: boolean; message: string };
}) {
  return (
    <>
      <div className="rounded-lg bg-black p-5 text-white shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#00f2ea]">Creator Command Center</p>
            <h1 className="mt-2 text-3xl font-black md:text-5xl">What should I film today?</h1>
            <p className="mt-3 max-w-2xl text-sm text-white/70">
              Start with TikTok products that need footage. Every hook, script, tag, clip, and result is saved under one product.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="rounded-lg bg-[#00f2ea] px-4 py-3 text-sm font-black text-black" onClick={onProducts}>
              Product List
            </button>
            <button className="rounded-lg border border-white/20 px-4 py-3 text-sm font-black text-white" onClick={onRefresh}>
              {tiktokRefresh.connected ? "Refresh TikTok" : "Connect TikTok"}
            </button>
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-white/10 bg-white/10 p-3 text-sm font-bold text-white/80">
          {tiktokRefresh.connected ? "Connected demo account @ericabrooks03. " : ""}
          {tiktokRefresh.message}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Products need footage" value={String(priorities.length)} />
        <Metric label="Saved scripts" value={String(Object.values(records).reduce((sum, record) => sum + record.scripts.length, 0))} />
        <Metric label="Saved clips" value={String(Object.values(records).reduce((sum, record) => sum + record.footage.length, 0))} />
        <Metric label="Best next move" value="Film" />
      </div>

      <div className="panel p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="label">Today's priorities</p>
            <h2 className="mt-1 text-2xl font-black">Products that need content</h2>
          </div>
          <button className="rounded-lg border border-black/10 px-3 py-2 text-sm font-black" onClick={onProducts}>
            View all
          </button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {priorities.map((product) => (
            <ProductCard key={product.id} product={product} record={records[product.id]} onOpen={() => onOpenProduct(product.id)} />
          ))}
        </div>
      </div>
    </>
  );
}

function ProductList({
  plan,
  query,
  products,
  records,
  onOpenProduct,
  onQuery,
  onRefresh,
  onUpgrade,
  tiktokRefresh
}: {
  plan: Plan;
  query: string;
  products: Product[];
  records: Record<string, ProductRecord>;
  onOpenProduct: (id: string) => void;
  onQuery: (query: string) => void;
  onRefresh: () => void;
  onUpgrade: () => void;
  tiktokRefresh: { connected: boolean; message: string };
}) {
  return (
    <div className="grid gap-5">
      <div className="panel p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="label">TikTok Showcase</p>
            <h1 className="mt-1 text-3xl font-black">Pick a product. Everything starts there.</h1>
            <p className="mt-2 text-sm text-slate-600">Free tracks 10 products. Pro unlocks your full Showcase and unlimited workspaces.</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-black text-white" onClick={onRefresh}>
            <RefreshCw size={17} />
            {tiktokRefresh.connected ? "Refresh TikTok" : "Connect TikTok"}
          </button>
        </div>
        <div className="mt-4 rounded-lg border border-black/10 bg-[#f0fffd] p-3 text-sm font-bold text-slate-700">
          {tiktokRefresh.connected ? "Connected demo account @ericabrooks03. " : ""}
          {tiktokRefresh.message}
        </div>
        <label className="mt-4 flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2">
          <Search size={18} />
          <input className="w-full outline-none" value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Search products, status, category" />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} record={records[product.id]} onOpen={() => onOpenProduct(product.id)} />
        ))}
      </div>

      {plan === "free" && (
        <button className="rounded-lg border border-black/10 bg-white p-4 text-left shadow-soft" onClick={onUpgrade}>
          <div className="flex items-center gap-3">
            <Lock size={20} />
            <div>
              <p className="font-black">Pro unlocks unlimited TikTok products</p>
              <p className="text-sm text-slate-600">Use Free to test the system. Upgrade when your Showcase is bigger than 10 products.</p>
            </div>
          </div>
        </button>
      )}
    </div>
  );
}

function ProductWorkspace({
  product,
  record,
  plan,
  scriptDraft,
  scriptLimit,
  assetType,
  assetNote,
  onBack,
  onCopyScript,
  onSaveScript,
  onScriptDraft,
  onStatus,
  onAssetNote,
  onAssetType,
  onUpload,
  onUpgrade
}: {
  product: Product;
  record: ProductRecord;
  plan: Plan;
  scriptDraft: ScriptSet;
  scriptLimit: number;
  assetType: string;
  assetNote: string;
  onBack: () => void;
  onCopyScript: (script: ScriptSet) => void;
  onSaveScript: () => void;
  onScriptDraft: (draft: ScriptSet) => void;
  onStatus: (status: ProductStatus) => void;
  onAssetNote: (note: string) => void;
  onAssetType: (type: string) => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onUpgrade: () => void;
}) {
  return (
    <div className="grid gap-5">
      <button className="flex w-fit items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-black shadow-soft" onClick={onBack}>
        <ArrowLeft size={17} />
        Back to Product List
      </button>

      <div className="panel overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[300px_1fr]">
          <div className="grid min-h-72 place-items-center bg-black p-6 text-white">
            <div className="grid h-40 w-40 place-items-center rounded-lg bg-gradient-to-br from-[#00f2ea] to-[#ff0050] text-5xl font-black text-black">
              {product.image}
            </div>
          </div>
          <div className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="label">Product workspace</p>
                <h1 className="mt-1 text-3xl font-black">{product.name}</h1>
                <p className="mt-2 text-sm text-slate-600">{product.brand} · {product.category}</p>
              </div>
              <select className="field max-w-56" value={record.status} onChange={(event) => onStatus(event.target.value as ProductStatus)}>
                <option>Needs content</option>
                <option>Sample received</option>
                <option>Filmed</option>
                <option>Posted</option>
                <option>Reuse winner</option>
              </select>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <MiniAction icon={<Film size={18} />} title="Film this" detail={product.nextAction} />
              <MiniAction icon={<Copy size={18} />} title="Script sets" detail={`${record.scripts.length}/${plan === "free" ? "2 free" : "unlimited"}`} />
              <MiniAction icon={<ImagePlus size={18} />} title="Footage saved" detail={`${record.footage.length} clips`} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-5">
          <div className="panel p-4">
            <p className="label">Hook, voiceover, caption, tags</p>
            <h2 className="mt-1 text-2xl font-black">Save a script set for this product</h2>
            <div className="mt-4 grid gap-3">
              <input className="field" value={scriptDraft.hook} onChange={(event) => onScriptDraft({ ...scriptDraft, hook: event.target.value })} placeholder="On-screen hook" />
              <textarea className="field min-h-24" value={scriptDraft.voiceover} onChange={(event) => onScriptDraft({ ...scriptDraft, voiceover: event.target.value })} placeholder="Voiceover" />
              <textarea className="field min-h-20" value={scriptDraft.caption} onChange={(event) => onScriptDraft({ ...scriptDraft, caption: event.target.value })} placeholder="Summary / caption" />
              <input className="field" value={scriptDraft.tags} onChange={(event) => onScriptDraft({ ...scriptDraft, tags: event.target.value })} placeholder="Tags, hashtags, keywords" />
              <button className="rounded-lg bg-black px-4 py-3 text-sm font-black text-white" onClick={onSaveScript}>
                Save script set
              </button>
              {record.scripts.length >= scriptLimit && (
                <button className="rounded-lg border border-black/10 bg-[#fff1f5] px-4 py-3 text-left text-sm font-black" onClick={onUpgrade}>
                  Free includes 2 scripts per product. Upgrade for unlimited script sets.
                </button>
              )}
            </div>
          </div>

          <div className="panel p-4">
            <p className="label">Footage vault for this product</p>
            <h2 className="mt-1 text-2xl font-black">Upload camera, CapCut, AI, or final clips</h2>
            <p className="mt-2 text-sm text-slate-600">In this local demo, previews work during the browser session. The real paid app will save these permanently in Supabase Storage.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-[220px_1fr]">
              <select className="field" value={assetType} onChange={(event) => onAssetType(event.target.value)}>
                <option>Raw camera clip</option>
                <option>CapCut export</option>
                <option>AI clip</option>
                <option>Final video</option>
                <option>TikTok draft backup</option>
                <option>Reusable B-roll</option>
              </select>
              <input className="field" value={assetNote} onChange={(event) => onAssetNote(event.target.value)} placeholder="What this clip shows or how to reuse it" />
            </div>
            <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#00f2ea] px-4 py-4 text-sm font-black text-black">
              <Upload size={18} />
              Upload footage to this product
              <input className="hidden" type="file" multiple accept="video/*,image/*,audio/*" onChange={onUpload} />
            </label>
          </div>

          <div className="panel p-4">
            <p className="label">Saved footage</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {record.footage.length ? (
                record.footage.map((asset) => <AssetCard key={asset.id} asset={asset} />)
              ) : (
                <EmptyState title="No footage saved yet" detail="Upload raw clips, CapCut exports, AI clips, or final videos. They will stay tied to this product." />
              )}
            </div>
          </div>
        </div>

        <aside className="grid content-start gap-5">
          <div className="panel p-4">
            <p className="label">Post this today</p>
            <h2 className="mt-1 text-2xl font-black">Next best action</h2>
            <div className="mt-3 rounded-lg bg-black p-4 text-white">
              <p className="text-sm font-bold text-[#00f2ea]">{record.scripts.length ? "Use your saved script" : "Start with this hook"}</p>
              <p className="mt-2 text-sm">{record.scripts[0]?.hook || product.scriptStarter}</p>
            </div>
            <ul className="mt-4 grid gap-2 text-sm text-slate-700">
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 text-emerald-600" size={17} /> Save one script set</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 text-emerald-600" size={17} /> Upload at least one clip</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 text-emerald-600" size={17} /> Mark product as filmed or posted</li>
            </ul>
          </div>

          <div className="panel p-4">
            <p className="label">Saved script sets</p>
            <div className="mt-4 grid gap-3">
              {record.scripts.length ? (
                record.scripts.map((script) => (
                  <div key={script.id} className="rounded-lg border border-black/10 bg-white p-3">
                    <p className="text-sm font-black">{script.hook}</p>
                    <p className="mt-2 text-sm text-slate-600">{script.voiceover}</p>
                    <p className="mt-2 text-xs font-bold text-slate-500">{script.tags}</p>
                    <button className="mt-3 flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-sm font-black" onClick={() => onCopyScript(script)}>
                      <Copy size={16} />
                      Copy set
                    </button>
                  </div>
                ))
              ) : (
                <EmptyState title="No scripts yet" detail="Save hooks, voiceovers, captions, and tags here so they never get overwritten." />
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Upgrade({ plan, onPlan }: { plan: Plan; onPlan: (plan: Plan) => void }) {
  return (
    <div className="grid gap-5">
      <div className="rounded-lg bg-black p-6 text-white">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-[#00f2ea]">Make Pro obvious</p>
        <h1 className="mt-2 text-4xl font-black">Charge for saved time, saved footage, and less creator chaos.</h1>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <PlanCard
          title="Free"
          price="$0"
          active={plan === "free"}
          items={["10 TikTok products", "5 priority products", "2 script sets per product", "Manual footage upload", "Good enough to feel the value"]}
          onClick={() => onPlan("free")}
        />
        <PlanCard
          title="Pro"
          price="$12/mo"
          active={plan === "pro"}
          items={["Unlimited Showcase products", "Unlimited scripts and footage", "Persistent cloud storage", "Auto thumbnails and MP4 conversion", "Post this today suggestions"]}
          onClick={() => onPlan("pro")}
        />
      </div>
    </div>
  );
}

function ProductCard({ product, record, onOpen }: { product: Product; record: ProductRecord; onOpen: () => void }) {
  return (
    <button className="rounded-lg border border-black/10 bg-white p-4 text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg" onClick={onOpen}>
      <div className="flex gap-3">
        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#00f2ea] to-[#ff0050] text-xl font-black text-black">
          {product.image}
        </div>
        <div>
          <span className="chip">{record.status}</span>
          <h3 className="mt-2 font-black">{product.name}</h3>
          <p className="mt-1 text-sm text-slate-600">{product.due}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-600">{product.nextAction}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="chip">{record.scripts.length} scripts</span>
        <span className="chip">{record.footage.length} clips</span>
      </div>
    </button>
  );
}

function AssetCard({ asset }: { asset: FootageAsset }) {
  const isVideo = asset.mime?.startsWith("video");
  const isImage = asset.mime?.startsWith("image");

  return (
    <div className="rounded-lg border border-black/10 bg-white p-3">
      {asset.url && isVideo && (
        <video className="aspect-[9/16] max-h-72 w-40 rounded-lg bg-black object-contain" controls playsInline preload="metadata">
          <source src={asset.url} type={asset.mime} />
        </video>
      )}
      {asset.url && isImage && <img className="aspect-video w-full rounded-lg object-cover" src={asset.url} alt={asset.name} />}
      {!asset.url && (
        <div className="grid aspect-video place-items-center rounded-lg bg-slate-100">
          <Play size={28} />
        </div>
      )}
      <p className="mt-3 font-black">{asset.name}</p>
      <p className="mt-1 text-sm text-slate-600">{asset.note}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="chip">{asset.type}</span>
        {asset.url && (
          <>
            <a className="flex items-center gap-1 rounded-lg border border-black/10 px-3 py-2 text-sm font-black" href={asset.url} target="_blank" rel="noreferrer">
              <Play size={15} />
              Open
            </a>
            <a className="flex items-center gap-1 rounded-lg border border-black/10 px-3 py-2 text-sm font-black" href={asset.url} download={asset.name}>
              <Download size={15} />
              Download
            </a>
          </>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel p-4">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}

function MiniAction({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) {
  return (
    <div className="rounded-lg border border-black/10 bg-slate-50 p-3">
      <div className="flex items-center gap-2 font-black">
        {icon}
        {title}
      </div>
      <p className="mt-2 text-sm text-slate-600">{detail}</p>
    </div>
  );
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-lg border border-dashed border-black/20 bg-slate-50 p-4">
      <p className="font-black">{title}</p>
      <p className="mt-1 text-sm text-slate-600">{detail}</p>
    </div>
  );
}

function PlanCard({ title, price, items, active, onClick }: { title: string; price: string; items: string[]; active: boolean; onClick: () => void }) {
  return (
    <button className={`rounded-lg border p-5 text-left shadow-soft ${active ? "border-black bg-white" : "border-black/10 bg-white"}`} onClick={onClick}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xl font-black">{title}</p>
          <p className="mt-1 text-3xl font-black">{price}</p>
        </div>
        {active && <span className="rounded-lg bg-[#00f2ea] px-3 py-2 text-sm font-black">Active</span>}
      </div>
      <ul className="mt-4 grid gap-2 text-sm text-slate-700">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <CheckCircle2 className="mt-0.5 text-emerald-600" size={17} />
            {item}
          </li>
        ))}
      </ul>
    </button>
  );
}
