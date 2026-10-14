import { Check, Cpu, AppWindow } from "lucide-react";
import { toKey } from "../../game/words";

const Section = ({ title, icon: Icon, words, found, onOpen, color }) => (
  <div className="mb-5">
    <h3 className="font-heading text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
      <Icon className={`w-5 h-5 ${color}`} /> {title}
    </h3>
    <ul className="grid grid-cols-2 gap-2">
      {words.map((w) => {
        const k = toKey(w.label);
        const isFound = found.includes(k);
        return (
          <li key={k}>
            <button
              data-testid={`word-item-${k}`}
              disabled={!isFound}
              onClick={() => onOpen(w)}
              className={`w-full text-left px-3 py-2 rounded-xl border-2 text-sm font-bold uppercase flex items-center gap-2 transition-colors duration-200
                ${isFound ? "bg-emerald-50 border-emerald-400 text-emerald-700 line-through decoration-[3px] decoration-emerald-600 hover:bg-emerald-100 cursor-pointer" : "bg-white border-slate-200 text-slate-700 cursor-default"}`}
            >
              {isFound && <Check className="w-4 h-4 shrink-0 no-underline" />}
              <span className="truncate">{w.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  </div>
);

export const WordList = ({ words, found, onOpen }) => (
  <aside data-testid="word-list-panel" className="bg-white rounded-3xl border-4 border-slate-900 shadow-[8px_8px_0_#0F172A] p-5">
    <h2 className="font-heading text-2xl font-bold text-slate-900 mb-1 uppercase">Guia de Palavras</h2>
    <p className="text-sm text-slate-500 mb-4">Clique numa palavra encontrada para ler de novo a explicação.</p>
    <Section title="PEÇAS DO COMPUTADOR" icon={Cpu} color="text-indigo-600" words={words.filter((w) => w.type === "PEÇA")} found={found} onOpen={onOpen} />
    <Section title="APLICATIVOS" icon={AppWindow} color="text-cyan-600" words={words.filter((w) => w.type === "APLICATIVO")} found={found} onOpen={onOpen} />
  </aside>
);
