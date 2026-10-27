import { useState, useContext } from 'react';
import { GameContext } from '../../../shared/GameContext';

export function ConfigModal() {
  const { config, setConfig, notes, setNotes, setShowConfig } = useContext(GameContext);
  const [localNickname, setLocalNickname] = useState(config.recipientNickname);
  const [localTitle, setLocalTitle] = useState(config.gameTitle);
  const [localNotes, setLocalNotes] = useState(notes);

  const handleSubmit = (e) => {
    e.preventDefault();
    setConfig(prev => ({ ...prev, recipientNickname: localNickname, gameTitle: localTitle }));
    setNotes(localNotes);
    setShowConfig(false);
  };

  const updateNote = (idx, field, val) => {
    const updated = [...localNotes];
    updated[idx] = { ...updated[idx], [field]: val };
    setLocalNotes(updated);
  };

  return (
    <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-slate-900 border border-white/10 max-w-xl w-full rounded-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={() => setShowConfig(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-lg">✕</button>
        <h2 className="text-xl font-serif font-bold text-amber-300 mb-2">Personalize Your Story</h2>
        <p className="text-xs text-slate-400 mb-4">Customize the recipient's nickname and the 5 secret personal messages before playing!</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-pink-300 mb-1">Recipient's Special Nickname</label>
            <input
              type="text"
              value={localNickname}
              onChange={e => setLocalNickname(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-white/20 rounded-lg text-white focus:outline-none focus:border-pink-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-pink-300 mb-1">Game Title</label>
            <input
              type="text"
              value={localTitle}
              onChange={e => setLocalTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-white/20 rounded-lg text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          <hr className="border-white/10 my-2" />
          <h3 className="font-semibold text-amber-300 text-sm">The 5 Secret Personal Notes</h3>

          <div className="space-y-3">
            {localNotes.map((n, idx) => (
              <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-white/10 space-y-2">
                <div className="font-bold text-pink-300">Note #{idx + 1}</div>
                <input
                  type="text"
                  value={n.title}
                  onChange={e => updateNote(idx, 'title', e.target.value)}
                  className="w-full px-2 py-1 bg-slate-900 border border-white/10 rounded text-amber-200"
                  placeholder="Note Title"
                />
                <textarea
                  rows="2"
                  value={n.text}
                  onChange={e => updateNote(idx, 'text', e.target.value)}
                  className="w-full px-2 py-1 bg-slate-900 border border-white/10 rounded text-slate-200"
                  placeholder="Note message"
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg transition text-sm"
          >
            Save & Apply Personalization
          </button>
        </form>
      </div>
    </div>
  );
}
