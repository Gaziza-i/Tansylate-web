import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, Eye, EyeOff, Save, X, ChevronDown, ChevronUp, Image as ImageIcon, Upload, Copy, Check, Layers } from "lucide-react";

// ─── Типы ────────────────────────────────────────────────────────────────────

interface Spec { label: string; value: string; }
interface SizeRow { size: string; ru: string; col3: string; col3label: string; waist: string; }
interface SizeTable { title: string; rows: SizeRow[]; }
interface CareItem { icon: string; text: string; }

const CARE_ICONS: { value: string; label: string; svg: string }[] = [
  { value: "wash",   label: "Стирка",         svg: "M2 8h20v2a10 10 0 0 1-20 0V8zM2 8l2-5h16l2 5M9 13v3m6-3v3" },
  { value: "bleach", label: "Отбеливание",    svg: "M3 6h18v2a9 9 0 0 1-18 0V6zM3 6l1-3h16l1 3M4 4l16 16" },
  { value: "iron",   label: "Утюжка",         svg: "M4 6h16a1 1 0 0 1 1 1v1H3V7a1 1 0 0 1 1-1zM3 8h18v1a9 9 0 0 1-2 5.7V19a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-4.3A9 9 0 0 1 3 9V8z" },
  { value: "tumble", label: "Машинная сушка", svg: "M3 3h18v18H3zM3 3l18 18" },
  { value: "dry",    label: "Сушка",          svg: "M3 3h18v18H3zM7 12h10" },
];

// ─── Иконка ухода ─────────────────────────────────────────────────────────────

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

// ─── Парсинг JSON из БД ──────────────────────────────────────────────────────

function parseJSON<T>(val: string | null | undefined, fallback: T): T {
  if (!val) return fallback;
  try { return JSON.parse(val) as T; } catch { return fallback; }
}

// ─── Начальное состояние формы ───────────────────────────────────────────────

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
      title: "Размерная сетка: Кофта",
      rows: [
        { size: "XS-S", ru: "42", col3: "84 см", col3label: "Обхват груди", waist: "66 см" },
        { size: "S-M",  ru: "44", col3: "88 см", col3label: "Обхват груди", waist: "70 см" },
      ] as SizeRow[],
    },
    {
      title: "Размерная сетка: Штаны",
      rows: [
        { size: "XS-S", ru: "42", col3: "90 см", col3label: "Обхват бёдер", waist: "66 см" },
        { size: "S-M",  ru: "44", col3: "94 см", col3label: "Обхват бёдер", waist: "70 см" },
      ] as SizeRow[],
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

// ─── Вспомогательные компоненты (ВНЕ ProductForm — иначе React размонтирует DOM на каждый ре-рендер) ──

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

// ─── Форма редактирования товара ─────────────────────────────────────────────

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

  const toggle = (section: string) =>
    setOpenSection(o => (o === section ? null : section));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("[upload] handleFileUpload triggered, files:", e.target.files?.length);
    const file = e.target.files?.[0];
    console.log("[upload] file:", file ? `${file.name} (${file.size}b)` : "none", "| onUploadImage:", !!onUploadImage);
    if (!file || !onUploadImage) {
      console.warn("[upload] early return — file:", !!file, "onUploadImage:", !!onUploadImage);
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const url = await onUploadImage(file);
      console.log("[upload] got url:", url);
      set("images", [...form.images, url]);
    } catch (err: any) {
      console.error("[upload] error:", err);
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

      {/* Основное */}
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

      {/* Фото */}
      <Section id="images" label={`Фотографии (${form.images.length})`} openSection={openSection} onToggle={toggle}>

        {/* Кнопки: загрузить + из медиатеки */}
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

        {/* Медиапикер */}
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
                      onClick={() => {
                        set("images", selected
                          ? form.images.filter(u => u !== url)
                          : [...form.images, url]
                        );
                      }}
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

        {/* Текущие фото товара */}
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

        {/* URL вручную */}
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

      {/* Характеристики */}
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

      {/* Особенности */}
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

      {/* Размерные сетки */}
      <Section id="sizes" label={`Размерные сетки (${form.sizeTables.length})`} openSection={openSection} onToggle={toggle}>
        {form.sizeTables.map((table, ti) => (
          <div key={ti} className="border border-[#E8E7E2] rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={table.title}
                onChange={e => { const arr = [...form.sizeTables]; arr[ti] = { ...arr[ti], title: e.target.value }; set("sizeTables", arr); }}
                className="flex-1 px-3 py-2 border border-[#E8E7E2] rounded-lg text-sm font-medium focus:outline-none focus:border-[#5A6262]"
                placeholder="Название таблицы"
              />
              <button type="button" onClick={() => set("sizeTables", form.sizeTables.filter((_, j) => j !== ti))} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse mb-2">
                <thead>
                  <tr className="bg-[#F9F9F7]">
                    <th className="border border-[#E8E7E2] px-2 py-1 text-left font-medium text-[#5A6262]">Размер</th>
                    <th className="border border-[#E8E7E2] px-2 py-1 text-left font-medium text-[#5A6262]">RU</th>
                    <th className="border border-[#E8E7E2] px-2 py-1 text-left font-medium text-[#5A6262]">
                      <input
                        type="text"
                        value={table.rows[0]?.col3label ?? ""}
                        onChange={e => {
                          const arr = [...form.sizeTables];
                          arr[ti] = { ...arr[ti], rows: arr[ti].rows.map(r => ({ ...r, col3label: e.target.value })) };
                          set("sizeTables", arr);
                        }}
                        placeholder="Обхват груди"
                        className="w-full bg-transparent focus:outline-none"
                      />
                    </th>
                    <th className="border border-[#E8E7E2] px-2 py-1 text-left font-medium text-[#5A6262]">Обхват талии</th>
                    <th className="border border-[#E8E7E2] px-1 py-1"></th>
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, ri) => (
                    <tr key={ri}>
                      {(["size","ru","col3","waist"] as const).map(field => (
                        <td key={field} className="border border-[#E8E7E2] px-1 py-1">
                          <input
                            type="text"
                            value={row[field]}
                            onChange={e => {
                              const arr = [...form.sizeTables];
                              const rows = [...arr[ti].rows];
                              rows[ri] = { ...rows[ri], [field]: e.target.value };
                              arr[ti] = { ...arr[ti], rows };
                              set("sizeTables", arr);
                            }}
                            className="w-full px-1 py-0.5 bg-transparent focus:outline-none focus:bg-[#F9F9F7] rounded text-xs"
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
              arr[ti] = { ...arr[ti], rows: [...arr[ti].rows, { size: "", ru: "", col3: "", col3label: arr[ti].rows[0]?.col3label ?? "", waist: "" }] };
              set("sizeTables", arr);
            }} className="flex items-center gap-1 text-xs text-[#5A6262] hover:text-black mt-1">
              <Plus size={12} /> Добавить строку
            </button>
          </div>
        ))}
        <button type="button" onClick={() => set("sizeTables", [...form.sizeTables, { title: "Новая таблица", rows: [{ size: "", ru: "", col3: "", col3label: "Обхват груди", waist: "" }] }])} className="flex items-center gap-2 text-sm text-[#5A6262] hover:text-black transition-colors">
          <Plus size={14} /> Добавить таблицу размеров
        </button>
      </Section>

      {/* Уход */}
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

      {/* Кнопки */}
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

// ─── Медиатека ────────────────────────────────────────────────────────────────

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

      {/* Drag & drop zone */}
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
                <div className="aspect-square">
                  <img
                    src={url} alt=""
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23E8E7E2' width='100' height='100'/%3E%3C/svg%3E"; }}
                  />
                  <div className="absolute inset-0 bg-transparent group-hover:bg-black/40 transition-all flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => copyUrl(url)}
                      className="hidden group-hover:flex items-center gap-1 px-2.5 py-1.5 bg-white text-[#1F1F1D] text-xs rounded-full shadow hover:bg-[#F0EFEA] transition-colors"
                    >
                      {copied === url ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                      {copied === url ? "Скопировано" : "URL"}
                    </button>
                    <button
                      onClick={() => deleteImage(url)}
                      className="hidden group-hover:flex items-center gap-1 px-2 py-1.5 bg-red-500 text-white text-xs rounded-full shadow hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={12} />
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

// ─── Главный компонент Admin ──────────────────────────────────────────────────

export default function Admin() {
  const [view, setView] = useState<"list" | "create" | "edit" | "media">("list");
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [savedMsg, setSavedMsg] = useState("");

  const { data: products = [], refetch } = trpc.admin.products.useQuery();
  const createMut = trpc.admin.createProduct.useMutation();
  const updateMut = trpc.admin.updateProduct.useMutation();
  const deleteMut = trpc.admin.deleteProduct.useMutation();
  const [serverImages, setServerImages] = useState<string[]>([]);

  const isSaving = createMut.isPending || updateMut.isPending;

  useEffect(() => {
    fetch("/api/uploads")
      .then(r => r.json())
      .then((urls: string[]) => setServerImages(urls))
      .catch(() => {});
  }, []);

  const allMediaImages = serverImages.length > 0
    ? serverImages
    : Array.from(new Set(products.flatMap((p: any) => parseJSON<string[]>(p.images, []))));

  const notify = (msg: string) => {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(""), 3000);
  };

  const refreshServerImages = () => {
    fetch("/api/uploads")
      .then(r => r.json())
      .then((urls: string[]) => setServerImages(urls))
      .catch(() => {});
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
    sizeTables: parseJSON<SizeTable[]>(p.sizeTables, []),
    careInstructions: parseJSON<CareItem[]>(p.careInstructions, []),
    careNote: p.careNote ?? "",
    isVisible: p.isVisible ?? 1,
  });

  return (
    <div className="min-h-screen bg-[#F9F9D7]">
      {/* Header */}
      <header className="bg-[#F9F9D7] border-b border-[#E8E7E2] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-3 md:px-6 h-14 md:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            {view !== "list" && view !== "media" && (
              <button onClick={() => setView("list")} className="text-[#5A6262] hover:text-black transition-colors flex-shrink-0">
                ←
              </button>
            )}
            <span className="text-lg md:text-xl text-[#1F1F1D] truncate" style={{ fontFamily: "'Montserrat', Arial, sans-serif", fontWeight: 700, letterSpacing: "-0.01em" }}>TANSYLATE</span>
            <span className="text-xs text-[#5A6262] uppercase tracking-widest hidden sm:inline">Админ</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
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
          </div>
        </div>
      </header>

      {/* Уведомление */}
      {savedMsg && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full text-sm font-medium shadow-lg transition-all ${savedMsg.startsWith("✓") ? "bg-[#1F1F1D] text-white" : "bg-red-500 text-white"}`}>
          {savedMsg}
        </div>
      )}

      <main className="max-w-6xl mx-auto px-3 md:px-6 py-6 md:py-8">

        {/* Список товаров */}
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

        {/* Создание */}
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

        {/* Редактирование */}
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

        {/* Медиатека */}
        {view === "media" && (
          <MediaLibrary
            images={allMediaImages}
            onUpload={handleUploadImage}
          />
        )}
      </main>
    </div>
  );
}
