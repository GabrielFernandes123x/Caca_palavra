import { useCallback, useEffect, useMemo, useState } from "react";
import "@/App.css";
import axios from "axios";
import { Timer, RotateCcw, Lightbulb, Trophy, Monitor } from "lucide-react";
import { Toaster, toast } from "sonner";
import { Button } from "./components/ui/button";
import { Progress } from "./components/ui/progress";
import { Grid } from "./components/game/Grid";
import { WordList } from "./components/game/WordList";
import { ExplanationModal, VictoryModal, LeaderboardModal, fmt } from "./components/game/Modals";
import { WORDS, toKey } from "./game/words";
import { generateGrid } from "./game/generator";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const KEYS = WORDS.map((w) => toKey(w.label));

function App() {
  const [game, setGame] = useState(() => generateGrid(KEYS));
  const [found, setFound] = useState([]);
  const [seconds, setSeconds] = useState(0);
  const [current, setCurrent] = useState(null);
  const [hint, setHint] = useState(null);
  const [saved, setSaved] = useState(false);
  const [boardOpen, setBoardOpen] = useState(false);
  const [scores, setScores] = useState([]);
  const won = found.length === KEYS.length;

  useEffect(() => {
    if (won) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [won, game]);

  const loadScores = useCallback(async () => {
    const { data } = await axios.get(`${API}/scores`);
    setScores(data);
  }, []);

  const foundCells = useMemo(
    () => new Set(found.flatMap((k) => game.placements[k].map((c) => c.join("-")))),
    [found, game]
  );

  const onSelect = (cells) => {
    if (cells.length < 2) return;
    const sig = cells.map((c) => c.join("-")).join("|");
    const rev = [...cells].reverse().map((c) => c.join("-")).join("|");
    const key = KEYS.find((k) => {
      if (found.includes(k)) return false;
      const p = game.placements[k].map((c) => c.join("-")).join("|");
      return p === sig || p === rev;
    });
    if (!key) return;
    setFound((f) => [...f, key]);
    setHint(null);
    const w = WORDS.find((x) => toKey(x.label) === key);
    if (found.length + 1 < KEYS.length) setCurrent(w);
  };

  const newGame = () => {
    setGame(generateGrid(KEYS)); setFound([]); setSeconds(0);
    setCurrent(null); setHint(null); setSaved(false); setBoardOpen(false);
  };

  const giveHint = () => {
    const left = KEYS.filter((k) => !found.includes(k));
    const k = left[Math.floor(Math.random() * left.length)];
    setHint(game.placements[k][0].join("-"));
    setSeconds((s) => s + 10);
    toast("DICA: +10 SEGUNDOS NO TEMPO");
    setTimeout(() => setHint(null), 3000);
  };

  const saveScore = async (name) => {
    try {
      await axios.post(`${API}/scores`, { name, seconds });
      setSaved(true);
      await loadScores();
      setBoardOpen(true);
    } catch {
      toast.error("NÃO FOI POSSÍVEL SALVAR. TENTE DE NOVO.");
    }
  };

  const openBoard = async () => { await loadScores(); setBoardOpen(true); };

  return (
    <div className="min-h-screen bg-[#FEF9EF] bg-dots font-body text-slate-900 uppercase">
      <Toaster position="top-center" />
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-8 animate-rise">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 border-4 border-slate-900 flex items-center justify-center shadow-[4px_4px_0_#0F172A] rotate-[-6deg]">
              <Monitor className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 data-testid="game-title" className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight">CAÇA-PALAVRAS TECH</h1>
              <p className="text-sm text-slate-600 font-semibold">ACHE AS 25 PEÇAS E APLICATIVOS DO COMPUTADOR!</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div data-testid="timer-display" className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white font-grid font-bold text-lg">
              <Timer className="w-5 h-5 text-amber-400" /> {fmt(seconds)}
            </div>
            <Button data-testid="hint-button" onClick={giveHint} disabled={won} className="rounded-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold border-2 border-slate-900"><Lightbulb className="w-4 h-4 mr-1" /> DICA</Button>
            <Button data-testid="leaderboard-button" onClick={openBoard} className="rounded-full bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-bold border-2 border-slate-900"><Trophy className="w-4 h-4 mr-1" /> RANKING</Button>
            <Button data-testid="new-game-button" onClick={newGame} className="rounded-full bg-indigo-600 hover:bg-indigo-700 font-bold border-2 border-slate-900"><RotateCcw className="w-4 h-4 mr-1" /> NOVO JOGO</Button>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6 lg:gap-8">
          <section className="col-span-12 lg:col-span-7 animate-rise" style={{ animationDelay: "80ms" }}>
            <div className="mb-4 flex items-center gap-3">
              <span data-testid="words-found-counter" className="font-heading font-bold text-lg whitespace-nowrap">{found.length} DE {KEYS.length} ENCONTRADAS</span>
              <Progress value={(found.length / KEYS.length) * 100} className="h-3 bg-white border-2 border-slate-900" />
            </div>
            <Grid grid={game.grid} foundCells={foundCells} hintCell={hint} onSelect={onSelect} />
            <p className="mt-4 text-sm text-slate-600 font-semibold">COMO JOGAR: CLIQUE NA PRIMEIRA LETRA E ARRASTE ATÉ A ÚLTIMA. AS PALAVRAS ESTÃO NA HORIZONTAL, VERTICAL OU DIAGONAL.</p>
          </section>
          <div className="col-span-12 lg:col-span-5 animate-rise" style={{ animationDelay: "160ms" }}>
            <WordList words={WORDS} found={found} onOpen={setCurrent} />
          </div>
        </div>
      </div>

      <ExplanationModal word={current} onClose={() => setCurrent(null)} />
      <VictoryModal key={game.grid[0].join("")} open={won && !boardOpen} seconds={seconds} saved={saved} onSave={saveScore} onNewGame={newGame} />
      <LeaderboardModal open={boardOpen} onClose={() => setBoardOpen(false)} scores={scores} />
    </div>
  );
}

export default App;
