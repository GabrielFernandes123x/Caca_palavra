import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Trophy, Sparkles } from "lucide-react";

export const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export const ExplanationModal = ({ word, onClose }) => (
  <Dialog open={!!word} onOpenChange={(o) => !o && onClose()}>
    <DialogContent data-testid="explanation-modal" className="rounded-3xl border-4 border-slate-900 shadow-[8px_8px_0_#0F172A]">
      <DialogHeader>
        <span className={`w-fit px-3 py-1 rounded-full text-xs font-bold ${word?.type === "PEÇA" ? "bg-indigo-100 text-indigo-700" : "bg-cyan-100 text-cyan-700"}`}>
          {word?.type === "PEÇA" ? "PEÇA DO COMPUTADOR" : "APLICATIVO"}
        </span>
        <DialogTitle data-testid="explanation-word" className="font-heading text-3xl uppercase flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-amber-500" /> {word?.label}
        </DialogTitle>
        <DialogDescription data-testid="explanation-text" className="text-base text-slate-700 pt-2 uppercase">
          <strong>PARA QUE SERVE?</strong> {word?.info}
        </DialogDescription>
      </DialogHeader>
      <Button data-testid="explanation-modal-close-button" onClick={onClose} className="rounded-full bg-indigo-600 hover:bg-indigo-700 font-bold">
        CONTINUAR PROCURANDO
      </Button>
    </DialogContent>
  </Dialog>
);

export const VictoryModal = ({ open, seconds, onSave, onNewGame, saved }) => {
  const [name, setName] = useState("");
  return (
    <Dialog open={open}>
      <DialogContent data-testid="victory-modal" className="rounded-3xl border-4 border-slate-900 shadow-[8px_8px_0_#0F172A] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="font-heading text-4xl text-center uppercase">PARABÉNS!</DialogTitle>
          <DialogDescription className="text-center text-base uppercase">
            Você achou as 25 palavras em <strong data-testid="victory-time" className="text-indigo-600">{fmt(seconds)}</strong>!
          </DialogDescription>
        </DialogHeader>
        {!saved ? (
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (name.trim()) onSave(name.trim()); }}>
            <Input data-testid="player-name-input" maxLength={30} placeholder="DIGITE SEU NOME" value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())} className="uppercase rounded-full border-2" />
            <Button data-testid="save-score-button" type="submit" className="rounded-full bg-emerald-600 hover:bg-emerald-700 font-bold">SALVAR</Button>
          </form>
        ) : (
          <p data-testid="score-saved-msg" className="text-center font-bold text-emerald-600">TEMPO SALVO NO RANKING!</p>
        )}
        <Button data-testid="victory-new-game-button" onClick={onNewGame} variant="outline" className="rounded-full border-2 font-bold">JOGAR DE NOVO</Button>
      </DialogContent>
    </Dialog>
  );
};

export const LeaderboardModal = ({ open, onClose, scores }) => (
  <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
    <DialogContent data-testid="leaderboard-modal" className="rounded-3xl border-4 border-slate-900 shadow-[8px_8px_0_#0F172A]">
      <DialogHeader>
        <DialogTitle className="font-heading text-3xl uppercase flex items-center gap-2"><Trophy className="w-7 h-7 text-amber-500" /> RANKING</DialogTitle>
        <DialogDescription>OS 10 MAIS RÁPIDOS</DialogDescription>
      </DialogHeader>
      {scores.length === 0 ? (
        <p data-testid="leaderboard-empty" className="text-slate-500">NINGUÉM NO RANKING AINDA. SEJA O PRIMEIRO!</p>
      ) : (
        <ol className="space-y-2">
          {scores.map((s, i) => (
            <li key={s.id} data-testid={`leaderboard-item-${i}`} className={`flex justify-between px-4 py-2 rounded-xl font-bold border-2 ${i === 0 ? "bg-amber-50 border-amber-400" : "bg-slate-50 border-slate-200"}`}>
              <span>{i + 1}º {s.name}</span><span className="font-grid">{fmt(s.seconds)}</span>
            </li>
          ))}
        </ol>
      )}
    </DialogContent>
  </Dialog>
);
