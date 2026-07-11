import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, Eye, EyeOff, Save, X, ChevronDown, ChevronUp, Image as ImageIcon, Upload, Copy, Check, Layers, Globe } from "lucide-react";

interface Spec { label: string; value: string; }
interface SizeTable { title: string; cols: string[]; rows: string[][]; }

function normalizeSizeTable(raw: any): SizeTable {
  if (raw.cols && Array.isArray(raw.rows?.[0])) return raw as SizeTable;
  const col3label = raw.rows?.[0]?.col3label ?? "Обхват груди (см)";
  const extraCols: string[] = [];
  if (raw.rows?.some((r: any) => r.hips)) extraCols.push("Обхват бёдер (см)");
  if (raw.rows?.some((r: any) => r.height)) extraCols.push("Рост (см)");
  return {
    title: raw.title ?? "Таблица",
    cols: ["Размер", "RU", col3label, "Обхват талии (см)", ...extraCols],
    rows: (raw.rows ?? []).map((r: any) => {
      const base = [r.size ?? "", r.ru ?? "", r.col3 ?? "", r.waist ?? ""];
      if (extraCols.includes("Обхват бёдер (см)")) base.push(r.hips ?? "");
      if (extraCols.includes("Рост (см)")) base.push(r.height ?? "");
      return base;
    }),
  };
}
interface CareItem { icon: string; text: string; }

const CARE_ICONS: { value: string; label: string; svg: string }[] = [
  { value: "wash",   label: "Стирка",         svg: "M2 8h20v2a10 10 0 0 1-20 0V8zM2 8l2-5h16l2 5M9 13v3m6-3v3" },
  { value: "bleach", label: "Отбеливание",    svg: "M3 6h18v2a9 9 0 0 1-18 0V6zM3 6l1-3h16l1 3M4 4l16 16" },
  { value: "iron",   label: "Утюжка",         svg: "M4 6h16a1 1 0 0 1 1 1v1H3V7a1 1 0 0 1 1-1zM3 8h18v1a9 9 0 0 1-2 5.7V19a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-4.3A9 9 0 0 1 3 9V8z" },
  { value: "tumble", label: "Машинная сушка", svg: "M3 3h18v18H3zM3 3l18 18" },
  { value: "dry",    label: "Сушка",          svg: "M3 3h18v18H3zM7 12h10" },
];

function CareIcon({ icon }: { icon: string }) {
  const found = CARE_ICONS.find(c => c.value === icon);
  if (!found) return null;
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {found.svg.split("M").filter(Boolean).map((d, i) => (
        <path key={i} d={`M${d}`} />
      ))}
    </svg>
  );
}

function parseJSON<T>(val: string | null | undefined, fallback: T): T {
  if (!val) return fallback;
  try { return JSON.parse(val) as T; } catch { return fallback; }
}

const emptyForm = () => ({
  name: "",
  sku: "",
  price: 12990,
  collection: "",
  description: "",
  telegramLink: "https://t.me/tansylate_bot",
  images: [] as string[],
  features: [] as string[],
  specs: [
    { label: "Материал", value: "" },
    { label: "Состав", value: "" },
    { label: "Плотность", value: "" },
  ] as Spec[],
  sizeTables: [
    {
      title: "Худи",
      cols: ["Размер", "RU", "Обхват груди (см)", "Обхват талии (см)"],
      rows: [["XS-S", "42", "84", "66"], ["S-M", "44", "88", "70"]],
    },
    {
      title: "Брюки",
      cols: ["Размер", "RU", "Обхват бёдер (см)", "Обхват талии (см)"],
      rows: [["XS-S", "42", "90", "66"], ["S-M", "44", "94", "70"]],
    },
  ] as SizeTable[],
  careInstructions: [
    { icon: "wash",   text: "Стирка 30°C, вывернув наизнанку" },
    { icon: "bleach", text: "Отбеливание: запрещено" },
    { icon: "iron",   text: "Утюжка: до 110°C" },
    { icon: "tumble", text: "Машинная сушка: запрещена" },
    { icon: "dry",    text: "Сушка: только горизонтально в тени" },
  ] as CareItem[],
  careNote: "Первое время с изнанки может осыпаться лишний ворс — это особенность ткани. После 1–2 стирок всё пройдёт.",
  isVisible: 1,
});

type Form = ReturnType<typeof emptyForm>;

// Вспомогательные компоненты вне ProductForm — React размонтирует DOM на каждый ре-рендер

function InputField({ label, value, onChange, type = "text", placeholder = "" }: any) {
  return (
    <div>
      <label className="block text-xs text-[#5A6262] mb-1 uppercase tracking-wide">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-[#E8E7E2] rounded-lg text-sm text-[#1F1F1D] focus:outline-none focus:border-[#5A6262]"
      />
    </div>
  );
}

function Section({ id, label, openSection, onToggle, children }: {
  id: string;
  label: string;
  openSection: string | null;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[#E8E7E2] rounded-xl overflow-hidden mb-3 md:mb-4">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="w-full flex justify-between items-center px-3 md:px-5 py-3 md:py-4 bg-[#F9F9F7] hover:bg-[#F0EFEA] transition-colors text-left"
      >
        <span className="font-medium text-[#1F1F1D] text-xs md:text-sm">{label}</span>
        {openSection === id ? <ChevronUp size={16} className="text-[#5A6262]" /> : <ChevronDown size={16} className="text-[#5A6262]" />}
      </button>
      {openSection === id && <div className="p-3 md:p-5 space-y-3 md:space-y-4 bg-white">{children}</div>}
    </div>
  );
}

function ProductForm({
  initial,
  onSave,
  onCancel,
  isSaving,
  mediaImages = [],
  onUploadImage,
}: {
  initial: Form;
  onSave: (f: Form) => void;
  onCancel: () => void;
  isSaving: boolean;
  mediaImages?: string[];
  onUploadImage?: (file: File) => Promise<string>;
}) {
  const [form, setForm] = useState<Form>(initial);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [openSection, setOpenSection] = useState<string | null>("basic");
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const set = (key: keyof Form, val: any) => setForm(f => ({ ...f, [key]: val }));
  const toggle = (section: string) => setOpenSection(o => (o === section ? null : section));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadImage) return;
    setUploading(true);
    setUploadError(null);
    try {
      const url = await onUploadImage(file);
      set("images", [...form.images, url]);
    } catch (err: any) {
      setUploadError(err?.message || "Ошибка загрузки фото");
    } finally {
      setUploading(false);
      (e.target as HTMLInputElement).value = "";
    }
  };

  return (
    <div className="space-y-2">
      {/* Скрытый input всегда смонтирован — не внутри Section */}
      {onUploadImage && (
        <input
          id="product-file-upload"
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={handleFileUpload}
        />
      )}

      <Section id="basic" label="Основная информация" openSection={openSection} onToggle={toggle}>
        <InputField label="Название" value={form.name} onChange={(v: string) => set("name", v)} placeholder="Спортивный костюм" />
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Цена (₽)" value={form.price} onChange={(v: string) => set("price", Number(v))} type="number" />
          <InputField label="Коллекция" value={form.collection} onChange={(v: string) => set("collection", v)} placeholder="Коллекция 2026" />
        </div>
        <InputField label="Артикул (необязательно)" value={form.sku} onChange={(v: string) => set("sku", v)} placeholder="TS-001" />
        <div>
          <label className="block text-xs text-[#5A6262] mb-1 uppercase tracking-wide">Описание</label>
          <textarea
            value={form.description}
            onChange={e => set("description", e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-[#E8E7E2] rounded-lg text-sm text-[#1F1F1D] focus:outline-none focus:border-[#5A6262] resize-none"
            placeholder="Описание товара..."
          />
        </div>
        <InputField label="Ссылка на Telegram-бот" value={form.telegramLink} onChange={(v: string) => set("telegramLink", v)} placeholder="https://t.me/tansylate_bot" />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => set("isVisible", form.isVisible ? 0 : 1)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs uppercase tracking-wide border transition-colors ${form.isVisible ? "bg-[#5A6262] text-white border-[#5A6262]" : "bg-white text-[#5A6262] border-[#5A6262]"}`}
          >
            {form.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
            {form.isVisible ? "Видимый" : "Скрытый"}
          </button>
        </div>
      </Section>

      <Section id="images" label={`Фотографии (${form.images.length})`} openSection={openSection} onToggle={toggle}>
        <div className="flex flex-wrap gap-2">
          {onUploadImage && (
            <label
              htmlFor="product-file-upload"
              className={`flex items-center gap-2 px-4 py-2.5 bg-[#1F1F1D] text-white rounded-lg text-xs cursor-pointer hover:bg-[#3a3a3a] transition-colors ${uploading ? "opacity-40 pointer-events-none" : ""}`}
            >
              <Upload size={14} />
              {uploading ? "Загрузка..." : "Загрузить фото"}
            </label>
          )}
          <button
            type="button"
            onClick={() => setShowMediaPicker(p => !p)}
            className={`flex items-center gap-2 px-4 py-2.5 border text-xs rounded-lg transition-colors ${showMediaPicker ? "border-[#5A6262] bg-[#5A6262] text-white" : "border-[#E8E7E2] text-[#5A6262] hover:border-[#5A6262]"}`}
          >
            <Layers size={14} />
            Из медиатеки {mediaImages.length > 0 ? `(${mediaImages.length})` : ""}
          </button>
          {uploadError && (
            <p className="w-full text-xs text-red-500">{uploadError}</p>
          )}
        </div>

        {showMediaPicker && (
          <div className="border border-[#E8E7E2] rounded-xl overflow-hidden bg-[#F9F9F7]">
            <div className="px-3 py-2 border-b border-[#E8E7E2] flex items-center justify-between">
              <p className="text-xs text-[#5A6262] uppercase tracking-wide">
                Медиатека — нажмите чтобы выбрать
              </p>
              {form.images.length > 0 && (
                <p className="text-xs text-[#5A6262]">выбрано: {form.images.filter(u => mediaImages.includes(u)).length}</p>
              )}
            </div>
            {mediaImages.length === 0 ? (
              <div className="py-10 text-center text-sm text-[#5A6262]">
                <ImageIcon size={28} className="mx-auto mb-2 opacity-30" />
                Нет фото — загрузите через кнопку выше
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 p-3 max-h-72 overflow-y-auto">
                {mediaImages.map((url, i) => {
                  const selected = form.images.includes(url);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => set("images", selected ? form.images.filter(u => u !== url) : [...form.images, url])}
                      className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${selected ? "border-[#1F1F1D] opacity-100" : "border-transparent opacity-80 hover:opacity-100"}`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect fill='%23E8E7E2' width='60' height='60'/%3E%3C/svg%3E"; }}
                      />
                      {selected && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                            <Check size={12} className="text-[#1F1F1D]" />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {form.images.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {form.images.map((url, i) => (
              <div key={i} className="relative group h-28 bg-[#E8E7E2] rounded-xl overflow-hidden border border-[#E8E7E2]">
                <img src={url} alt="" className="w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <div className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[10px] rounded-md px-1.5 py-0.5 font-medium">
                  {i === 0 ? "Главное" : i + 1}
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-end justify-center pb-2 gap-1 opacity-0 group-hover:opacity-100">
                  <button
                    type="button"
                    disabled={i === 0}
                    onClick={() => { const arr = [...form.images]; [arr[i-1], arr[i]] = [arr[i], arr[i-1]]; set("images", arr); }}
                    className="bg-white rounded-lg px-2 py-1 text-[#5A6262] text-xs hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
                  >←</button>
                  <button
                    type="button"
                    onClick={() => set("images", form.images.filter((_, j) => j !== i))}
                    className="bg-red-500 rounded-lg px-2 py-1 text-white text-xs hover:bg-red-600"
                  ><Trash2 size={11} /></button>
                  <button
                    type="button"
                    disabled={i === form.images.length - 1}
                    onClick={() => { const arr = [...form.images]; [arr[i], arr[i+1]] = [arr[i+1], arr[i]]; set("images", arr); }}
                    className="bg-white rounded-lg px-2 py-1 text-[#5A6262] text-xs hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
                  >→</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-[#5A6262] text-sm border-2 border-dashed border-[#E8E7E2] rounded-xl">
            <ImageIcon size={24} className="mx-auto mb-2 opacity-40" />
            Нет фото — загрузите или выберите из медиатеки
          </div>
        )}

        <details className="text-xs">
          <summary className="cursor-pointer text-[#5A6262] hover:text-black select-none py-1">Добавить по URL</summary>
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newImageUrl}
              onChange={e => setNewImageUrl(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && newImageUrl.trim()) { set("images", [...form.images, newImageUrl.trim()]); setNewImageUrl(""); } }}
              placeholder="/uploads/photo.jpeg или https://..."
              className="flex-1 px-3 py-2 border border-[#E8E7E2] rounded-lg text-sm focus:outline-none focus:border-[#5A6262]"
            />
            <button
              type="button"
              onClick={() => { if (newImageUrl.trim()) { set("images", [...form.images, newImageUrl.trim()]); setNewImageUrl(""); } }}
              className="px-4 py-2 bg-[#5A6262] text-white rounded-lg text-sm hover:bg-[#3a4242] transition-colors"
            ><Plus size={16} /></button>
          </div>
        </details>
      </Section>

      <Section id="specs" label="Характеристики" openSection={openSection} onToggle={toggle}>
        <div className="space-y-2">
          {form.specs.map((spec, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                value={spec.label}
                onChange={e => { const arr = [...form.specs]; arr[i] = { ...arr[i], label: e.target.value }; set("specs", arr); }}
                placeholder="Название"
                className="w-1/3 px-3 py-2 border border-[#E8E7E2] rounded-lg text-sm focus:outline-none focus:border-[#5A6262]"
              />
              <input
                type="text"
                value={spec.value}
                onChange={e => { const arr = [...form.specs]; arr[i] = { ...arr[i], value: e.target.value }; set("specs", arr); }}
                placeholder="Значение"
                className="flex-1 px-3 py-2 border border-[#E8E7E2] rounded-lg text-sm focus:outline-none focus:border-[#5A6262]"
              />
              <button type="button" onClick={() => set("specs", form.specs.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => set("specs", [...form.specs, { label: "", value: "" }])} className="flex items-center gap-2 text-sm text-[#5A6262] hover:text-black transition-colors mt-2">
          <Plus size={14} /> Добавить характеристику
        </button>
      </Section>

      <Section id="features" label="Особенности (✓ список)" openSection={openSection} onToggle={toggle}>
        <div className="space-y-2">
          {form.features.map((feat, i) => (
            <div key={i} className="flex gap-2 items-center">
              <span className="text-[#5A6262] text-sm">✓</span>
              <input
                type="text"
                value={feat}
                onChange={e => { const arr = [...form.features]; arr[i] = e.target.value; set("features", arr); }}
                placeholder="Швы на профессиональном оборудовании"
                className="flex-1 px-3 py-2 border border-[#E8E7E2] rounded-lg text-sm focus:outline-none focus:border-[#5A6262]"
              />
              <button type="button" onClick={() => set("features", form.features.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => set("features", [...form.features, ""])} className="flex items-center gap-2 text-sm text-[#5A6262] hover:text-black transition-colors mt-2">
          <Plus size={14} /> Добавить особенность
        </button>
      </Section>

      <Section id="sizes" label={`Размерные сетки (${form.sizeTables.length})`} openSection={openSection} onToggle={toggle}>
        {form.sizeTables.map((table, ti) => (
          <div key={ti} className="border border-[#E8E7E2] rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={table.title}
                onChange={e => { const arr = [...form.sizeTables]; arr[ti] = { ...arr[ti], title: e.target.value }; set("sizeTables", arr); }}
                className="flex-1 px-3 py-2 border border-[#E8E7E2] rounded-lg text-sm font-medium focus:outline-none focus:border-[#5A6262]"
                placeholder="Название (например: Худи)"
              />
              <button type="button" onClick={() => set("sizeTables", form.sizeTables.filter((_, j) => j !== ti))} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
            </div>
            <div className="mb-2">
              <p className="text-[10px] text-[#5A6262] mb-1.5 uppercase tracking-wide">Колонки</p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {table.cols.map((col, ci) => (
                  <div key={ci} className="flex items-center gap-1 bg-[#F9F9F7] border border-[#E8E7E2] rounded-lg px-2 py-1">
                    <input
                      type="text"
                      value={col}
                      onChange={e => {
                        const arr = [...form.sizeTables];
                        const cols = [...arr[ti].cols]; cols[ci] = e.target.value;
                        arr[ti] = { ...arr[ti], cols };
                        set("sizeTables", arr);
                      }}
                      className="text-xs font-medium text-[#1F1F1D] bg-transparent focus:outline-none w-28"
                      placeholder="Название"
                    />
                    {table.cols.length > 1 && (
                      <button type="button" onClick={() => {
                        const arr = [...form.sizeTables];
                        const cols = arr[ti].cols.filter((_, j) => j !== ci);
                        const rows = arr[ti].rows.map(r => r.filter((_, j) => j !== ci));
                        arr[ti] = { ...arr[ti], cols, rows };
                        set("sizeTables", arr);
                      }} className="text-red-400 hover:text-red-600 flex-shrink-0"><X size={10} /></button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => {
                  const arr = [...form.sizeTables];
                  arr[ti] = { ...arr[ti], cols: [...arr[ti].cols, ""], rows: arr[ti].rows.map(r => [...r, ""]) };
                  set("sizeTables", arr);
                }} className="flex items-center gap-1 text-xs text-[#5A6262] hover:text-black border border-dashed border-[#E8E7E2] rounded-lg px-2 py-1 hover:border-[#5A6262] transition-colors">
                  <Plus size={10} /> Колонка
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse mb-2">
                <thead>
                  <tr className="bg-[#F9F9F7]">
                    {table.cols.map((col, ci) => (
                      <th key={ci} className="border border-[#E8E7E2] px-2 py-1 text-left font-medium text-[#5A6262] whitespace-nowrap">{col || `Кол. ${ci+1}`}</th>
                    ))}
                    <th className="border border-[#E8E7E2] px-1 py-1 w-6"></th>
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, ri) => (
                    <tr key={ri}>
                      {table.cols.map((_, ci) => (
                        <td key={ci} className="border border-[#E8E7E2] px-1 py-1">
                          <input
                            type="text"
                            value={row[ci] ?? ""}
                            onChange={e => {
                              const arr = [...form.sizeTables];
                              const rows = arr[ti].rows.map((r, j) => j === ri ? r.map((c, k) => k === ci ? e.target.value : c) : r);
                              arr[ti] = { ...arr[ti], rows };
                              set("sizeTables", arr);
                            }}
                            className="w-full px-1 py-0.5 bg-transparent focus:outline-none focus:bg-[#F9F9F7] rounded text-xs min-w-[40px]"
                          />
                        </td>
                      ))}
                      <td className="border border-[#E8E7E2] px-1 py-1 text-center">
                        <button type="button" onClick={() => {
                          const arr = [...form.sizeTables];
                          arr[ti] = { ...arr[ti], rows: arr[ti].rows.filter((_, j) => j !== ri) };
                          set("sizeTables", arr);
                        }} className="text-red-400 hover:text-red-600"><X size={12} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" onClick={() => {
              const arr = [...form.sizeTables];
              arr[ti] = { ...arr[ti], rows: [...arr[ti].rows, table.cols.map(() => "")] };
              set("sizeTables", arr);
            }} className="flex items-center gap-1 text-xs text-[#5A6262] hover:text-black mt-1">
              <Plus size={12} /> Добавить строку
            </button>
          </div>
        ))}
        <button type="button" onClick={() => set("sizeTables", [...form.sizeTables, {
          title: "Новая таблица",
          cols: ["Размер", "RU", "Обхват груди (см)", "Обхват талии (см)"],
          rows: [["", "", "", ""]],
        }])} className="flex items-center gap-2 text-sm text-[#5A6262] hover:text-black transition-colors">
          <Plus size={14} /> Добавить таблицу размеров
        </button>
      </Section>

      <Section id="care" label="Уход за изделием" openSection={openSection} onToggle={toggle}>
        <div className="space-y-2">
          {form.careInstructions.map((item, i) => (
            <div key={i} className="flex gap-2 items-center">
              <select
                value={item.icon}
                onChange={e => { const arr = [...form.careInstructions]; arr[i] = { ...arr[i], icon: e.target.value }; set("careInstructions", arr); }}
                className="px-2 py-2 border border-[#E8E7E2] rounded-lg text-xs focus:outline-none focus:border-[#5A6262] bg-white"
              >
                {CARE_ICONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <input
                type="text"
                value={item.text}
                onChange={e => { const arr = [...form.careInstructions]; arr[i] = { ...arr[i], text: e.target.value }; set("careInstructions", arr); }}
                className="flex-1 px-3 py-2 border border-[#E8E7E2] rounded-lg text-sm focus:outline-none focus:border-[#5A6262]"
              />
              <button type="button" onClick={() => set("careInstructions", form.careInstructions.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => set("careInstructions", [...form.careInstructions, { icon: "wash", text: "" }])} className="flex items-center gap-2 text-sm text-[#5A6262] hover:text-black mt-2">
          <Plus size={14} /> Добавить пункт
        </button>
        <div className="mt-4">
          <label className="block text-xs text-[#5A6262] mb-1 uppercase tracking-wide">Заметка (мелкий текст под иконками)</label>
          <textarea
            value={form.careNote}
            onChange={e => set("careNote", e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-[#E8E7E2] rounded-lg text-sm focus:outline-none focus:border-[#5A6262] resize-none"
          />
        </div>
      </Section>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => onSave(form)}
          disabled={isSaving}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#1F1F1D] text-white text-sm uppercase tracking-widest rounded-full hover:bg-[#3a4242] transition-colors disabled:opacity-50"
        >
          <Save size={16} />
          {isSaving ? "Сохранение..." : "Сохранить"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-[#E8E7E2] text-[#5A6262] text-sm uppercase tracking-widest rounded-full hover:bg-[#F0EFEA] transition-colors"
        >
          Отмена
        </button>
      </div>
    </div>
  );
}

function MediaLibrary({
  images,
  onUpload,
}: {
  images: string[];
  onUpload: (file: File) => Promise<string>;
}) {
  const [uploading, setUploading] = useState(false);
  const [serverList, setServerList] = useState<string[]>(images);
  const [copied, setCopied] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setServerList(images); }, [images]);

  const refreshList = () => {
    fetch("/api/uploads")
      .then(r => r.json())
      .then((urls: string[]) => setServerList(urls))
      .catch(() => {});
  };

  const deleteImage = async (url: string) => {
    const filename = url.split("/").pop();
    if (!filename || !confirm(`Удалить ${filename}?`)) return;
    await fetch(`/api/uploads/${filename}`, { method: "DELETE" }).catch(() => {});
    refreshList();
  };

  const uploadFiles = async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    setUploadError(null);
    try {
      await Promise.all(files.map(f => onUpload(f)));
      refreshList();
    } catch (err: any) {
      setUploadError(err?.message || "Ошибка загрузки");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    uploadFiles(Array.from(e.target.files ?? []));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (files.length) uploadFiles(files);
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <h1 className="text-2xl font-serif text-[#1F1F1D]">Медиатека</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#5A6262]">{serverList.length} фото</span>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileInput} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1F1F1D] text-white text-xs uppercase tracking-widest rounded-full hover:bg-[#3a4242] transition-colors disabled:opacity-50"
          >
            <Upload size={14} />
            {uploading ? "Загрузка..." : "Загрузить фото"}
          </button>
        </div>
      </div>

      {uploadError && <p className="text-xs text-red-500 mb-4">{uploadError}</p>}

      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`mb-5 border-2 border-dashed rounded-xl py-8 text-center cursor-pointer transition-all select-none ${
          dragOver
            ? "border-[#5A6262] bg-[#5A6262]/5 text-[#1F1F1D]"
            : "border-[#E8E7E2] text-[#5A6262] hover:border-[#5A6262] hover:text-[#1F1F1D]"
        }`}
      >
        <Upload size={22} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">{uploading ? "Загрузка..." : "Перетащите фото сюда или нажмите"}</p>
        <p className="text-xs mt-1 opacity-60">JPG, PNG, WebP до 20 МБ · можно несколько файлов</p>
      </div>

      {serverList.length === 0 ? (
        <div className="text-center py-12 text-[#5A6262]">
          <ImageIcon size={36} className="mx-auto mb-3 opacity-25" />
          <p className="text-sm">Нет загруженных фото</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {serverList.map((url, i) => {
            const filename = url.split("/").pop() ?? "";
            return (
              <div key={i} className="group relative rounded-xl overflow-hidden border border-[#E8E7E2] bg-white">
                <div className="aspect-square relative">
                  <img
                    src={url} alt=""
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23E8E7E2' width='100' height='100'/%3E%3C/svg%3E"; }}
                  />
                  {/* Кнопка удаления — всегда видна */}
                  <button
                    onClick={() => deleteImage(url)}
                    className="absolute top-1.5 right-1.5 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow transition-colors z-10"
                    title="Удалить"
                  >
                    <Trash2 size={12} />
                  </button>
                  {/* Кнопка копирования URL — только на десктопе при hover */}
                  <div className="absolute inset-0 bg-transparent group-hover:bg-black/30 transition-all flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => copyUrl(url)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-white text-[#1F1F1D] text-xs rounded-full shadow hover:bg-[#F0EFEA] transition-colors"
                    >
                      {copied === url ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                      {copied === url ? "Скопировано" : "URL"}
                    </button>
                  </div>
                </div>
                <div className="px-2 py-1.5 border-t border-[#E8E7E2]">
                  <p className="text-[10px] text-[#5A6262] truncate" title={filename}>{filename}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const DEFAULT_ABOUT = {
  title: "О бренде",
  paragraphs: [
    "Меня зовут Тансылу, мне 16 лет. Моя цель — создавать по-настоящему долговечную одежду.",
    "Все ключевые этапы контролирую лично: от разработки удобных эскизов и работы с дизайнерами до проверки швейного цеха и финальной упаковки.",
    "Это не просто бизнес, а ответственность за внешний вид и качество готового изделия. В процесс вкладывается максимум сил, чтобы гарантировать высокое качество исполнения и внимание к каждому шву.",
  ],
  photo: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663598344304/IQqWhEnndFbtqytb.jpeg",
};


const DEFAULT_HERO_CONTENT = {
  badge: "Основано в 2026",
  title: "История в двух цветах",
  subtitle: "Одежда, в которой ты разный",
  buttonText: "Каталог",
};
const DEFAULT_DELIVERY_CONTENT = {
  title: "Доставка и возврат",
  cards: [
    { title: "Доставка", items: ["Доставка по всей России (СДЭК / Почта России)", "Сроки: 3–7 рабочих дней", "Стоимость уточняется при оформлении", "Примерка перед оплатой"] },
    { title: "Возврат", items: ["Возврат в течение 14 дней", "Бирки не срезаны, нет следов носки", "Стоимость упаковки не возвращается"] },
  ],
};
const DEFAULT_CONTACTS_CONTENT = {
  telegram: "https://t.me/tansylate",
  instagram: "https://www.instagram.com/p/DYaX6I5iA-x/?img_index=9&igsh=MTFnZDI4b3A1Ymx1",
  tiktok: "https://www.tiktok.com/@tansylate",
};
const DEFAULT_LOOKS_CONTENT = {
  title: "Образы",
  description: "Скоро здесь появятся образы с нашими изделиями",
  photos: [] as string[],
};

function ContentView({ onUploadImage }: { onUploadImage: (f: File) => Promise<string> }) {
  const heroQ = trpc.settings.getHero.useQuery();
  const aboutQ = trpc.settings.getAbout.useQuery();
  const deliveryQ = trpc.settings.getDelivery.useQuery();
  const contactsQ = trpc.settings.getContacts.useQuery();
  const looksQ = trpc.settings.getLooks.useQuery();

  const heroMut = trpc.settings.setHero.useMutation();
  const aboutMut = trpc.settings.setAbout.useMutation();
  const deliveryMut = trpc.settings.setDelivery.useMutation();
  const contactsMut = trpc.settings.setContacts.useMutation();
  const looksMut = trpc.settings.setLooks.useMutation();

  const { data: videos = [], refetch: refetchVideos } = trpc.bloggers.getAll.useQuery();
  const addVideoMut = trpc.bloggers.add.useMutation();
  const deleteVideoMut = trpc.bloggers.delete.useMutation();

  const [hero, setHero] = useState(DEFAULT_HERO_CONTENT);
  const [about, setAbout] = useState(DEFAULT_ABOUT);
  const [delivery, setDelivery] = useState(DEFAULT_DELIVERY_CONTENT);
  const [contacts, setContacts] = useState(DEFAULT_CONTACTS_CONTENT);
  const [looks, setLooks] = useState(DEFAULT_LOOKS_CONTENT);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDesc, setVideoDesc] = useState("");
  const [msg, setMsg] = useState("");
  const [uploadingLooks, setUploadingLooks] = useState(false);
  const [uploadingAbout, setUploadingAbout] = useState(false);

  useEffect(() => { if (heroQ.data) setHero(heroQ.data); }, [heroQ.data]);
  useEffect(() => { if (aboutQ.data) setAbout(aboutQ.data); }, [aboutQ.data]);
  useEffect(() => { if (deliveryQ.data) setDelivery(deliveryQ.data); }, [deliveryQ.data]);
  useEffect(() => { if (contactsQ.data) setContacts(contactsQ.data); }, [contactsQ.data]);
  useEffect(() => { if (looksQ.data) setLooks(looksQ.data); }, [looksQ.data]);

  const notify = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  const handleLooksPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLooks(true);
    try {
      const url = await onUploadImage(file);
      setLooks(l => ({ ...l, photos: [...(l.photos ?? []), url] }));
    } finally {
      setUploadingLooks(false);
      (e.target as HTMLInputElement).value = "";
    }
  };

  const handleAboutPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAbout(true);
    try {
      const url = await onUploadImage(file);
      setAbout(a => ({ ...a, photo: url }));
    } finally {
      setUploadingAbout(false);
      (e.target as HTMLInputElement).value = "";
    }
  };

  const card = "bg-white border border-[#E8E7E2] rounded-2xl p-5 md:p-6 mb-6";
  const lbl = "block text-xs text-[#5A6262] mb-1 uppercase tracking-wide";
  const inp = "w-full px-3 py-2 border border-[#E8E7E2] rounded-lg text-sm text-[#1F1F1D] focus:outline-none focus:border-[#5A6262]";
  const saveBtn = (onClick: () => void, pending: boolean, label = "Сохранить") => (
    <button onClick={onClick} disabled={pending}
      className="flex items-center gap-2 px-5 py-2.5 bg-[#1F1F1D] text-white text-xs uppercase tracking-widest rounded-full hover:bg-[#3a4242] transition-colors disabled:opacity-50">
      <Save size={14} /> {pending ? "Сохранение..." : label}
    </button>
  );

  return (
    <div>
      <h1 className="text-2xl font-serif text-[#1F1F1D] mb-6">Контент сайта</h1>
      {msg && <div className="mb-5 px-4 py-2 bg-[#1F1F1D] text-white text-sm rounded-full inline-block">{msg}</div>}

      {/* Главный экран */}
      <div className={card}>
        <h2 className="font-serif text-[#1F1F1D] text-lg mb-4">Главный экран</h2>
        <div className="space-y-3">
          <div><label className={lbl}>Плашка сверху</label>
            <input type="text" value={hero.badge} onChange={e => setHero(h => ({ ...h, badge: e.target.value }))} className={inp} /></div>
          <div><label className={lbl}>Заголовок</label>
            <input type="text" value={hero.title} onChange={e => setHero(h => ({ ...h, title: e.target.value }))} className={inp} /></div>
          <div><label className={lbl}>Подзаголовок</label>
            <input type="text" value={hero.subtitle} onChange={e => setHero(h => ({ ...h, subtitle: e.target.value }))} className={inp} /></div>
          <div><label className={lbl}>Текст кнопки</label>
            <input type="text" value={hero.buttonText} onChange={e => setHero(h => ({ ...h, buttonText: e.target.value }))} className={inp} /></div>
        </div>
        <div className="mt-4">{saveBtn(async () => { await heroMut.mutateAsync(hero); await heroQ.refetch(); notify("✓ Герой сохранён"); }, heroMut.isPending)}</div>
      </div>

      {/* О бренде */}
      <div className={card}>
        <h2 className="font-serif text-[#1F1F1D] text-lg mb-4">О бренде</h2>
        <div className="space-y-4">
          <div><label className={lbl}>Заголовок</label>
            <input type="text" value={about.title} onChange={e => setAbout(a => ({ ...a, title: e.target.value }))} className={inp} /></div>
          <div>
            <label className={lbl}>Абзацы текста</label>
            <div className="space-y-2">
              {about.paragraphs.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <textarea value={p} rows={3}
                    onChange={e => { const arr = [...about.paragraphs]; arr[i] = e.target.value; setAbout(a => ({ ...a, paragraphs: arr })); }}
                    className="flex-1 px-3 py-2 border border-[#E8E7E2] rounded-lg text-sm focus:outline-none focus:border-[#5A6262] resize-none" />
                  {about.paragraphs.length > 1 && (
                    <button type="button" onClick={() => setAbout(a => ({ ...a, paragraphs: a.paragraphs.filter((_, j) => j !== i) }))} className="text-red-400 hover:text-red-600 self-start mt-1"><Trash2 size={16} /></button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setAbout(a => ({ ...a, paragraphs: [...a.paragraphs, ""] }))}
              className="flex items-center gap-2 text-sm text-[#5A6262] hover:text-black mt-2"><Plus size={14} /> Добавить абзац</button>
          </div>
          <div>
            <label className={lbl}>Фото</label>
            {about.photo && (
              <div className="mb-2 relative w-24 h-32 rounded-xl overflow-hidden border border-[#E8E7E2]">
                <img src={about.photo} alt="" className="w-full h-full object-cover" />
                <button onClick={() => setAbout(a => ({ ...a, photo: "" }))} className="absolute top-1 right-1 bg-white/90 rounded-full p-0.5 text-red-400 hover:text-red-600"><X size={12} /></button>
              </div>
            )}
            <label className={`flex items-center gap-2 px-4 py-2 bg-[#1F1F1D] text-white rounded-lg text-xs cursor-pointer hover:bg-[#3a4242] transition-colors inline-flex mb-2 ${uploadingAbout ? "opacity-50 pointer-events-none" : ""}`}>
              <Upload size={13} /> {uploadingAbout ? "Загрузка..." : "Загрузить фото"}
              <input type="file" accept="image/*" className="hidden" onChange={handleAboutPhotoUpload} />
            </label>
            <input type="text" value={about.photo} placeholder="или вставьте URL фото"
              onChange={e => setAbout(a => ({ ...a, photo: e.target.value }))} className={inp} />
          </div>
        </div>
        <div className="mt-4">{saveBtn(async () => { await aboutMut.mutateAsync(about); await aboutQ.refetch(); notify("✓ О бренде сохранено"); }, aboutMut.isPending)}</div>
      </div>

      {/* Нас носят блогеры */}
      <div className={card}>
        <h2 className="font-serif text-[#1F1F1D] text-lg mb-4">Нас носят блогеры</h2>
        <div className="space-y-2 mb-4">
          <input type="text" value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
            placeholder="Ссылка на видео (YouTube, TikTok, Instagram...)" className={inp} />
          <input type="text" value={videoDesc} onChange={e => setVideoDesc(e.target.value)}
            placeholder="Подпись (необязательно)" className={inp} />
          <button onClick={async () => {
            if (!videoUrl.trim()) return;
            await addVideoMut.mutateAsync({ url: videoUrl.trim(), description: videoDesc.trim() || undefined });
            setVideoUrl(""); setVideoDesc("");
            await refetchVideos();
            notify("✓ Видео добавлено");
          }} disabled={!videoUrl.trim() || addVideoMut.isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1F1F1D] text-white text-xs uppercase tracking-widest rounded-full hover:bg-[#3a4242] transition-colors disabled:opacity-50">
            <Plus size={14} /> Добавить
          </button>
        </div>
        {(videos as any[]).length === 0 ? (
          <div className="py-6 text-center text-sm text-[#5A6262] border-2 border-dashed border-[#E8E7E2] rounded-xl">Видео пока нет</div>
        ) : (
          <div className="space-y-2">
            {(videos as any[]).map((v: any) => (
              <div key={v.id} className="flex items-start gap-3 border border-[#E8E7E2] rounded-xl p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#1F1F1D] break-all">{v.videoUrl}</p>
                  {v.description && <p className="text-xs text-[#5A6262] mt-0.5">{v.description}</p>}
                </div>
                <button onClick={async () => { if (!confirm("Удалить?")) return; await deleteVideoMut.mutateAsync({ id: v.id }); await refetchVideos(); }}
                  className="text-red-400 hover:text-red-600 flex-shrink-0"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Образы */}
      <div className={card}>
        <h2 className="font-serif text-[#1F1F1D] text-lg mb-4">Образы</h2>
        <div className="space-y-3 mb-4">
          <div><label className={lbl}>Заголовок секции</label>
            <input type="text" value={looks.title} onChange={e => setLooks(l => ({ ...l, title: e.target.value }))} className={inp} /></div>
          <div><label className={lbl}>Текст-заглушка (если нет фото)</label>
            <input type="text" value={looks.description} onChange={e => setLooks(l => ({ ...l, description: e.target.value }))} className={inp} /></div>
        </div>
        <label className={lbl}>Фотографии</label>
        {(looks.photos ?? []).length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-3">
            {(looks.photos ?? []).map((src, i) => (
              <div key={i} className="relative group aspect-[3/4] rounded-lg overflow-hidden border border-[#E8E7E2]">
                <img src={src} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <button type="button" onClick={() => setLooks(l => ({ ...l, photos: (l.photos ?? []).filter((_, j) => j !== i) }))}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-[#E8E7E2] rounded-xl py-6 text-center text-sm text-[#5A6262] mb-3">
            <ImageIcon size={22} className="mx-auto mb-1 opacity-30" />Нет фото
          </div>
        )}
        <label className={`flex items-center gap-2 px-4 py-2 bg-[#1F1F1D] text-white rounded-lg text-xs cursor-pointer hover:bg-[#3a4242] transition-colors inline-flex mb-4 ${uploadingLooks ? "opacity-50 pointer-events-none" : ""}`}>
          <Upload size={13} /> {uploadingLooks ? "Загрузка..." : "Загрузить фото"}
          <input type="file" accept="image/*" className="hidden" onChange={handleLooksPhotoUpload} />
        </label>
        <div>{saveBtn(async () => { await looksMut.mutateAsync(looks); await looksQ.refetch(); notify("✓ Образы сохранены"); }, looksMut.isPending)}</div>
      </div>

      {/* Доставка */}
      <div className={card}>
        <h2 className="font-serif text-[#1F1F1D] text-lg mb-4">Доставка и возврат</h2>
        <div className="mb-4"><label className={lbl}>Заголовок секции</label>
          <input type="text" value={delivery.title} onChange={e => setDelivery(d => ({ ...d, title: e.target.value }))} className={inp} /></div>
        <div className="space-y-4">
          {delivery.cards.map((dc, ci) => (
            <div key={ci} className="border border-[#E8E7E2] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <input type="text" value={dc.title}
                  onChange={e => { const cards = delivery.cards.map((c, j) => j === ci ? { ...c, title: e.target.value } : c); setDelivery(d => ({ ...d, cards })); }}
                  className="flex-1 px-3 py-1.5 border border-[#E8E7E2] rounded-lg text-sm font-medium focus:outline-none focus:border-[#5A6262]" placeholder="Заголовок блока" />
                {delivery.cards.length > 1 && (
                  <button type="button" onClick={() => setDelivery(d => ({ ...d, cards: d.cards.filter((_, j) => j !== ci) }))} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                )}
              </div>
              <div className="space-y-2">
                {dc.items.map((item, ii) => (
                  <div key={ii} className="flex gap-2">
                    <input type="text" value={item}
                      onChange={e => { const cards = delivery.cards.map((c, j) => j === ci ? { ...c, items: c.items.map((it, k) => k === ii ? e.target.value : it) } : c); setDelivery(d => ({ ...d, cards })); }}
                      className="flex-1 px-3 py-1.5 border border-[#E8E7E2] rounded-lg text-sm focus:outline-none focus:border-[#5A6262]" />
                    <button type="button" onClick={() => { const cards = delivery.cards.map((c, j) => j === ci ? { ...c, items: c.items.filter((_, k) => k !== ii) } : c); setDelivery(d => ({ ...d, cards })); }}
                      className="text-red-400 hover:text-red-600 flex-shrink-0"><X size={14} /></button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => { const cards = delivery.cards.map((c, j) => j === ci ? { ...c, items: [...c.items, ""] } : c); setDelivery(d => ({ ...d, cards })); }}
                className="flex items-center gap-1 text-xs text-[#5A6262] hover:text-black mt-2"><Plus size={12} /> Добавить пункт</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setDelivery(d => ({ ...d, cards: [...d.cards, { title: "", items: [""] }] }))}
          className="flex items-center gap-2 text-sm text-[#5A6262] hover:text-black mt-3 mb-4"><Plus size={14} /> Добавить блок</button>
        {saveBtn(async () => { await deliveryMut.mutateAsync(delivery); await deliveryQ.refetch(); notify("✓ Доставка сохранена"); }, deliveryMut.isPending)}
      </div>

      {/* Контакты */}
      <div className={card}>
        <h2 className="font-serif text-[#1F1F1D] text-lg mb-4">Контакты (ссылки в футере)</h2>
        <div className="space-y-3">
          <div><label className={lbl}>Telegram</label>
            <input type="text" value={contacts.telegram} onChange={e => setContacts(c => ({ ...c, telegram: e.target.value }))} className={inp} placeholder="https://t.me/..." /></div>
          <div><label className={lbl}>Instagram</label>
            <input type="text" value={contacts.instagram} onChange={e => setContacts(c => ({ ...c, instagram: e.target.value }))} className={inp} placeholder="https://www.instagram.com/..." /></div>
          <div><label className={lbl}>TikTok</label>
            <input type="text" value={contacts.tiktok} onChange={e => setContacts(c => ({ ...c, tiktok: e.target.value }))} className={inp} placeholder="https://www.tiktok.com/@..." /></div>
        </div>
        <div className="mt-4">{saveBtn(async () => { await contactsMut.mutateAsync(contacts); await contactsQ.refetch(); notify("✓ Контакты сохранены"); }, contactsMut.isPending)}</div>
      </div>
    </div>
  );
}


export default function Admin() {
  const [view, setView] = useState<"list" | "create" | "edit" | "media" | "content">("list");
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [savedMsg, setSavedMsg] = useState("");
  const utils = trpc.useUtils();
  const logoutMut = trpc.auth.logout.useMutation({
    onSuccess: () => { utils.auth.me.invalidate(); },
  });

  const { data: products = [], refetch } = trpc.admin.products.useQuery();
  const createMut = trpc.admin.createProduct.useMutation();
  const updateMut = trpc.admin.updateProduct.useMutation();
  const deleteMut = trpc.admin.deleteProduct.useMutation();
  const [serverImages, setServerImages] = useState<string[]>([]);

  const isSaving = createMut.isPending || updateMut.isPending;

  const refreshServerImages = () => {
    fetch("/api/uploads")
      .then(r => r.json())
      .then((urls: string[]) => setServerImages(urls))
      .catch(() => {});
  };

  useEffect(() => { refreshServerImages(); }, []);

  const allMediaImages = serverImages.length > 0
    ? serverImages
    : Array.from(new Set(products.flatMap((p: any) => parseJSON<string[]>(p.images, []))));

  const notify = (msg: string) => {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(""), 3000);
  };

  const handleUploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Upload failed (${res.status}): ${text}`);
    }
    const json = await res.json();
    refreshServerImages();
    return json.url;
  };

  const handleSave = async (form: Form) => {
    try {
      if (view === "create") {
        await createMut.mutateAsync(form);
        notify("✓ Товар создан");
      } else if (editingProduct) {
        await updateMut.mutateAsync({ id: editingProduct.id, ...form });
        notify("✓ Изменения сохранены");
      }
      await refetch();
      setView("list");
    } catch (e) {
      notify("✗ Ошибка при сохранении");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить товар? Это действие необратимо.")) return;
    await deleteMut.mutateAsync({ id });
    notify("Товар удалён");
    await refetch();
  };

  const openEdit = (product: any) => {
    setEditingProduct(product);
    setView("edit");
  };

  const formFromProduct = (p: any): Form => ({
    name: p.name ?? "",
    sku: p.sku ?? "",
    price: p.price ?? 12990,
    collection: p.collection ?? "",
    description: p.description ?? "",
    telegramLink: p.telegramLink ?? "https://t.me/tansylate_bot",
    images: parseJSON<string[]>(p.images, []),
    features: parseJSON<string[]>(p.features, []),
    specs: parseJSON<Spec[]>(p.specs, []),
    sizeTables: parseJSON<any[]>(p.sizeTables, []).map(normalizeSizeTable),
    careInstructions: parseJSON<CareItem[]>(p.careInstructions, []),
    careNote: p.careNote ?? "",
    isVisible: p.isVisible ?? 1,
  });

  return (
    <div className="min-h-screen bg-[#F9F9D7]">
      <header className="bg-[#F9F9D7] border-b border-[#E8E7E2] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-3 md:px-6 h-14 md:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            {view !== "list" && view !== "media" && (
              <button onClick={() => setView("list")} className="text-[#5A6262] hover:text-black transition-colors flex-shrink-0">
                ←
              </button>
            )}
            <img src="/tansylate-logo.svg" alt="TANSYLATE" className="h-6 md:h-7" />
            <span className="text-xs text-[#5A6262] uppercase tracking-widest hidden sm:inline">Админ</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <button
              onClick={() => setView(view === "content" ? "list" : "content")}
              className={`transition-colors ${view === "content" ? "text-[#1F1F1D]" : "text-[#5A6262] hover:text-black"}`}
              title="Контент сайта"
            >
              <Globe size={16} />
            </button>

            <button
              onClick={() => setView(view === "media" ? "list" : "media")}
              className={`flex items-center gap-1.5 text-xs uppercase tracking-wide transition-colors ${view === "media" ? "text-[#1F1F1D] font-medium" : "text-[#5A6262] hover:text-black"}`}
            >
              <Layers size={14} />
              <span className="hidden sm:inline">Медиатека</span>
            </button>
            <a href="/" target="_blank" className="text-xs text-[#5A6262] hover:text-black uppercase tracking-wide transition-colors">
              Сайт →
            </a>
            <button
              onClick={() => logoutMut.mutate({})}
              disabled={logoutMut.isPending}
              className="text-xs text-[#5A6262] hover:text-red-600 uppercase tracking-wide transition-colors disabled:opacity-40"
              title="Выйти"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      {savedMsg && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full text-sm font-medium shadow-lg transition-all ${savedMsg.startsWith("✓") ? "bg-[#1F1F1D] text-white" : "bg-red-500 text-white"}`}>
          {savedMsg}
        </div>
      )}

      <main className="max-w-6xl mx-auto px-3 md:px-6 py-6 md:py-8">
        {view === "list" && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6">
              <h1 className="text-2xl font-serif text-[#1F1F1D]">Товары</h1>
              <button
                onClick={() => setView("create")}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-[#1F1F1D] text-white text-xs uppercase tracking-widest rounded-full hover:bg-[#3a4242] transition-colors"
              >
                <Plus size={14} /> Добавить товар
              </button>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-20 text-[#5A6262]">
                <p className="mb-4">Товаров пока нет</p>
                <button onClick={() => setView("create")} className="px-6 py-3 border border-[#5A6262] text-[#5A6262] text-sm uppercase tracking-widest rounded-full hover:bg-[#5A6262] hover:text-white transition-colors">
                  Создать первый товар
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((p: any) => {
                  const imgs = parseJSON<string[]>(p.images, []);
                  return (
                    <div key={p.id} className="bg-white rounded-xl border border-[#E8E7E2] overflow-hidden flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4">
                      <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-[#F9F9D7]">
                        {imgs[0]
                          ? <img src={imgs[0]} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          : <ImageIcon size={24} className="w-full h-full p-4 text-[#5A6262]" />
                        }
                      </div>
                      <div className="flex-1 min-w-0 w-full sm:w-auto">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-serif text-[#1F1F1D] truncate">{p.name}</span>
                          {!p.isVisible && <span className="text-xs bg-[#F9F9D7] text-[#5A6262] px-2 py-0.5 rounded-full flex-shrink-0">скрыт</span>}
                        </div>
                        <div className="text-sm text-[#5A6262]">{(p.price ?? 0).toLocaleString("ru-RU")} ₽ · {imgs.length} фото</div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button onClick={() => openEdit(p)} className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-[#E8E7E2] text-sm text-[#5A6262] rounded-full hover:border-[#5A6262] hover:text-black transition-colors">
                          Редактировать
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="px-2 sm:px-3 py-2 text-red-400 hover:text-red-600 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {view === "create" && (
          <div>
            <h1 className="text-2xl font-serif text-[#1F1F1D] mb-6">Новый товар</h1>
            <ProductForm
              initial={emptyForm()}
              onSave={handleSave}
              onCancel={() => setView("list")}
              isSaving={isSaving}
              mediaImages={allMediaImages}
              onUploadImage={handleUploadImage}
            />
          </div>
        )}

        {view === "edit" && editingProduct && (
          <div>
            <h1 className="text-2xl font-serif text-[#1F1F1D] mb-6">Редактирование: {editingProduct.name}</h1>
            <ProductForm
              initial={formFromProduct(editingProduct)}
              onSave={handleSave}
              onCancel={() => setView("list")}
              isSaving={isSaving}
              mediaImages={allMediaImages}
              onUploadImage={handleUploadImage}
            />
          </div>
        )}

        {view === "media" && (
          <MediaLibrary
            images={allMediaImages}
            onUpload={handleUploadImage}
          />
        )}

        {view === "content" && <ContentView onUploadImage={handleUploadImage} />}
      </main>
    </div>
  );
}
