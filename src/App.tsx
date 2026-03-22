import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CalendarDays,
  ChevronLeft,
  Crown,
  MapPin,
  Shield,
  Sparkles,
  Star,
  Swords,
  Trophy,
  Users,
  WandSparkles,
} from 'lucide-react';
import { schedule, teams, type Match, type Player, type Team } from './data';

type Screen = 'home' | 'team' | 'builder' | 'dashboard' | 'schedule' | 'match' | 'compare' | 'fantasy';
type SavedXI = { playing11: Player[]; impactPlayer: Player | null };

const festivalGradients = [
  'from-fuchsia-500/30 via-orange-400/20 to-cyan-400/30',
  'from-yellow-400/25 via-pink-500/20 to-violet-500/30',
  'from-emerald-400/20 via-sky-500/20 to-rose-500/25',
];

function formatMatchDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [playing11, setPlaying11] = useState<Player[]>([]);
  const [impactPlayer, setImpactPlayer] = useState<Player | null>(null);
  const [savedXIs, setSavedXIs] = useState<Record<string, SavedXI>>({});
  const [fantasyXI, setFantasyXI] = useState<Record<string, Player[]>>({});

  const teamMap = useMemo(() => Object.fromEntries(teams.map((team) => [team.id, team])), []);

  const persistXI = (teamId: string, nextXI: Player[], nextImpact: Player | null) => {
    setSavedXIs((prev) => ({ ...prev, [teamId]: { playing11: nextXI, impactPlayer: nextImpact } }));
  };

  const openTeam = (team: Team) => {
    setSelectedTeam(team);
    const saved = savedXIs[team.id];
    setPlaying11(saved?.playing11 ?? []);
    setImpactPlayer(saved?.impactPlayer ?? null);
    setScreen('team');
  };

  const togglePlayer = (player: Player) => {
    if (!selectedTeam) return;

    const inXI = playing11.some((item) => item.id === player.id);
    const isImpact = impactPlayer?.id === player.id;
    let nextXI = playing11;
    let nextImpact = impactPlayer;

    if (inXI) nextXI = playing11.filter((item) => item.id !== player.id);
    else if (isImpact) nextImpact = null;
    else if (playing11.length < 11) nextXI = [...playing11, player];
    else if (!impactPlayer) nextImpact = player;

    setPlaying11(nextXI);
    setImpactPlayer(nextImpact);
    persistXI(selectedTeam.id, nextXI, nextImpact);
  };

  const toggleFantasyPlayer = (matchId: string, player: Player) => {
    const current = fantasyXI[matchId] ?? [];
    const exists = current.some((item) => item.id === player.id);
    if (exists) {
      setFantasyXI((prev) => ({ ...prev, [matchId]: current.filter((item) => item.id !== player.id) }));
      return;
    }
    if (current.length >= 11) return;
    setFantasyXI((prev) => ({ ...prev, [matchId]: [...current, player] }));
  };

  const playerStatus = (player: Player) => {
    if (playing11.some((item) => item.id === player.id)) return 'Playing XI';
    if (impactPlayer?.id === player.id) return 'Impact';
    return 'Available';
  };

  const openMatch = (match: Match) => {
    setSelectedMatch(match);
    setScreen('match');
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#090014] text-white">
      <div className="festival-bg pointer-events-none fixed inset-0 opacity-90" />
      <div className="festival-noise pointer-events-none fixed inset-0 opacity-20" />
      <AnimatePresence mode="wait">
        {screen === 'home' && (
          <motion.main
            key="home"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 md:px-8 md:py-10"
          >
            <section className="festival-panel overflow-hidden rounded-[2rem] border border-white/15 px-5 py-6 shadow-2xl sm:px-7 sm:py-8 lg:px-10 lg:py-10">
              <div className="hero-grid grid gap-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-center">
                <div className="min-w-0">
                  <div className="festival-chip mb-4 inline-flex items-center gap-2">
                    <WandSparkles className="h-4 w-4" /> IPL 2026 • Multicolour Burst
                  </div>
                  <h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                    Build a <span className="festival-text">celebration-ready</span> IPL experience.
                  </h1>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:text-base md:text-lg">
                    A brighter, cleaner IPL 2026 experience with focused schedule browsing, richer match hubs,
                    smoother transitions, and builder flows that feel polished across desktop and mobile.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <button onClick={() => setScreen('schedule')} className="festival-button-primary">
                      <CalendarDays className="h-5 w-5" /> View IPL 2026 Schedule
                    </button>
                    <button onClick={() => teams[0] && openTeam(teams[0])} className="festival-button-secondary">
                      <Shield className="h-5 w-5" /> Start with Team Builder
                    </button>
                  </div>
                  <div className="mt-7 grid gap-3 sm:grid-cols-3">
                    {[
                      ['Festival skin', 'Multicolour gradients, glass cards, and sharper spacing.'],
                      ['Match hubs', 'Detailed venue, captain, and trend panels live inside each fixture.'],
                      ['Cleaner builder', 'Portraits, slots, and actions are tighter and more readable.'],
                    ].map(([title, copy]) => (
                      <div key={title} className="mini-stat-card">
                        <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/45">Spotlight</p>
                        <h2 className="mt-2 text-lg font-black">{title}</h2>
                        <p className="mt-2 text-sm leading-6 text-white/70">{copy}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-1">
                  {[
                    ['20 Fixtures', 'Schedule page now shows only date, day, and the matchup.'],
                    ['Match Hubs', 'Venue, captains, trends, and squad actions moved into match pages.'],
                    ['Auto-fit Portraits', 'Player and captain imagery now stay neatly framed and aligned.'],
                  ].map(([title, copy], index) => (
                    <div key={title} className={`festival-card feature-card bg-gradient-to-br ${festivalGradients[index]}`}>
                      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-xl font-black">{title}</h2>
                      <p className="mt-2 text-sm leading-6 text-white/75">{copy}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-6 grid gap-4 lg:grid-cols-3">
              {schedule.slice(0, 3).map((match) => {
                const home = teamMap[match.team1];
                const away = teamMap[match.team2];
                if (!home || !away) return null;
                return (
                  <button key={match.id} onClick={() => openMatch(match)} className="festival-card fixture-preview text-left hover:-translate-y-1 transition">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/45">Match {match.matchNumber}</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img src={home.logoUrl} alt={home.shortName} className="h-10 w-10 object-contain" />
                        <span className="font-black">{home.shortName}</span>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/45">vs</span>
                      <div className="flex items-center gap-3">
                        <span className="font-black">{away.shortName}</span>
                        <img src={away.logoUrl} alt={away.shortName} className="h-10 w-10 object-contain" />
                      </div>
                    </div>
                    <p className="mt-4 text-lg font-black text-amber-300">{match.dateLabel}</p>
                    <p className="text-sm text-white/65">{match.day} • {match.city}</p>
                  </button>
                );
              })}
            </section>

            <section className="mt-10">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/55">Franchises</p>
                  <h2 className="text-2xl font-black sm:text-3xl md:text-4xl">Choose your squad and shape the XI.</h2>
                </div>
                <button onClick={() => setScreen('schedule')} className="festival-button-secondary hidden sm:inline-flex">
                  <Trophy className="h-5 w-5" /> Match Centre
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {teams.map((team) => (
                  <motion.button
                    key={team.id}
                    whileHover={{ y: -8, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openTeam(team)}
                    className={`team-card team-card-compact bg-gradient-to-br ${team.gradient}`}
                  >
                    <div className="team-card-overlay" />
                    <img src={team.logoUrl} alt={team.name} className="relative z-10 h-14 w-14 object-contain sm:h-16 sm:w-16" />
                    <div className="relative z-10 mt-5">
                      <h3 className="text-2xl font-black sm:text-3xl">{team.shortName}</h3>
                      <p className="mt-2 text-sm font-medium leading-6 text-white/85">{team.name}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </section>
          </motion.main>
        )}

        {screen === 'team' && selectedTeam && (
          <motion.main key="team" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative min-h-screen px-6 py-8 md:px-10">
            <div className={`absolute inset-0 bg-gradient-to-br ${selectedTeam.gradient} opacity-25`} />
            <div className="relative mx-auto max-w-7xl">
              <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <button onClick={() => setScreen('home')} className="festival-button-secondary">
                  <ChevronLeft className="h-5 w-5" /> Back Home
                </button>
                <div className="flex items-center gap-4 rounded-full border border-white/15 bg-black/30 px-5 py-3 backdrop-blur-xl">
                  <img src={selectedTeam.logoUrl} alt={selectedTeam.name} className="h-12 w-12 object-contain" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/55">Squad 2026</p>
                    <h2 className="text-2xl font-black">{selectedTeam.name}</h2>
                  </div>
                </div>
                <button onClick={() => setScreen('builder')} className="festival-button-primary">
                  <Users className="h-5 w-5" /> Build Playing XI
                </button>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                {selectedTeam.players.map((player) => (
                  <article key={player.id} className="festival-card player-tile">
                    <div className="player-portrait-wrap mb-4">
                      <img src={player.imageUrl} alt={player.name} className="player-portrait" loading="lazy" />
                    </div>
                    <h3 className="text-lg font-black leading-tight">{player.name}</h3>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.25em] text-white/55">{player.role}</p>
                  </article>
                ))}
              </div>
            </div>
          </motion.main>
        )}

        {screen === 'builder' && selectedTeam && (
          <motion.main key="builder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative min-h-screen px-6 py-8 md:px-10">
            <div className={`absolute inset-0 bg-gradient-to-br ${selectedTeam.gradient} opacity-25`} />
            <div className="relative mx-auto grid max-w-7xl gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <section className="festival-panel p-6">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <button onClick={() => setScreen('team')} className="festival-button-secondary">
                    <ChevronLeft className="h-5 w-5" /> Back Squad
                  </button>
                  <button disabled={playing11.length < 11} onClick={() => setScreen('dashboard')} className="festival-button-primary disabled:cursor-not-allowed disabled:opacity-50">
                    <Trophy className="h-5 w-5" /> View Dashboard
                  </button>
                </div>
                <div className="mb-5 flex items-center gap-4">
                  <img src={selectedTeam.logoUrl} alt={selectedTeam.shortName} className="h-14 w-14 object-contain" />
                  <div>
                    <h2 className="text-3xl font-black">{selectedTeam.shortName} XI Builder</h2>
                    <p className="text-white/65">{playing11.length}/11 selected • {impactPlayer ? 'Impact locked' : 'Pick 1 impact after XI'}</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {Array.from({ length: 11 }).map((_, index) => {
                    const player = playing11[index];
                    return (
                      <div key={index} className="slot-card">
                        {player ? (
                          <>
                            <div className="slot-avatar"><img src={player.imageUrl} alt={player.name} className="slot-avatar-image" /></div>
                            <div>
                              <p className="font-bold">{player.name}</p>
                              <p className="text-xs uppercase tracking-[0.25em] text-white/55">{player.role}</p>
                            </div>
                          </>
                        ) : (
                          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/35">Open position {index + 1}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 rounded-3xl border border-dashed border-white/15 bg-black/20 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/50">Impact Player</p>
                  {impactPlayer ? (
                    <div className="mt-3 flex items-center gap-3">
                      <div className="slot-avatar"><img src={impactPlayer.imageUrl} alt={impactPlayer.name} className="slot-avatar-image" /></div>
                      <div>
                        <p className="font-bold">{impactPlayer.name}</p>
                        <p className="text-xs uppercase tracking-[0.25em] text-white/55">{impactPlayer.role}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-white/60">Fill all 11 spots first, then add a game-changing substitute.</p>
                  )}
                </div>
              </section>

              <section className="festival-panel p-6">
                <h3 className="mb-5 text-2xl font-black">Available Squad</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {selectedTeam.players.map((player) => {
                    const status = playerStatus(player);
                    return (
                      <button key={player.id} onClick={() => togglePlayer(player)} className="festival-card text-left transition hover:-translate-y-1">
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div className="player-portrait-wrap small">
                            <img src={player.imageUrl} alt={player.name} className="player-portrait" loading="lazy" />
                          </div>
                          <span className={`status-pill ${status === 'Playing XI' ? 'active' : status === 'Impact' ? 'impact' : ''}`}>{status}</span>
                        </div>
                        <p className="font-black leading-tight">{player.name}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.25em] text-white/55">{player.role}</p>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
          </motion.main>
        )}

        {screen === 'dashboard' && selectedTeam && (
          <motion.main key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative min-h-screen px-6 py-8 md:px-10">
            <div className="relative mx-auto max-w-6xl">
              <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <button onClick={() => setScreen('builder')} className="festival-button-secondary">
                  <ChevronLeft className="h-5 w-5" /> Back Builder
                </button>
                <button onClick={() => setScreen('schedule')} className="festival-button-primary">
                  <CalendarDays className="h-5 w-5" /> Open Match Schedule
                </button>
              </div>
              <section className="festival-panel p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-4">
                  <img src={selectedTeam.logoUrl} alt={selectedTeam.shortName} className="h-16 w-16 object-contain" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/50">Match-ready XI</p>
                    <h2 className="text-4xl font-black">{selectedTeam.name}</h2>
                  </div>
                </div>
                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  {playing11.map((player, index) => (
                    <div key={player.id} className="slot-card min-h-[96px]">
                      <div className="slot-avatar"><img src={player.imageUrl} alt={player.name} className="slot-avatar-image" /></div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/40">Player {index + 1}</p>
                        <p className="font-black">{player.name}</p>
                        <p className="text-xs uppercase tracking-[0.25em] text-white/55">{player.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {impactPlayer && (
                  <div className="mt-6 rounded-3xl border border-amber-300/25 bg-amber-400/10 p-5">
                    <div className="flex items-center gap-4">
                      <div className="slot-avatar"><img src={impactPlayer.imageUrl} alt={impactPlayer.name} className="slot-avatar-image" /></div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-200/80">Impact Player</p>
                        <p className="text-xl font-black">{impactPlayer.name}</p>
                        <p className="text-sm text-white/70">Ready to shift momentum when the match cracks open.</p>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </motion.main>
        )}

        {screen === 'schedule' && (
          <motion.main key="schedule" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} className="relative mx-auto max-w-6xl px-6 py-8 md:px-10">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <button onClick={() => setScreen('home')} className="festival-button-secondary">
                <ChevronLeft className="h-5 w-5" /> Back Home
              </button>
              <div>
                <p className="text-center text-xs font-bold uppercase tracking-[0.35em] text-white/50">Tournament Schedule</p>
                <h2 className="text-center text-4xl font-black md:text-5xl">IPL 2026 Fixtures</h2>
              </div>
              <div className="hidden w-[132px] md:block" />
            </div>
            <div className="space-y-4">
              {schedule.map((match) => {
                const home = teamMap[match.team1];
                const away = teamMap[match.team2];
                if (!home || !away) return null;
                return (
                  <button key={match.id} onClick={() => openMatch(match)} className="festival-panel fixture-row w-full text-left transition hover:-translate-y-1">
                    <div className="flex flex-wrap items-center gap-4 md:gap-6">
                      <div className="min-w-[132px]">
                        <p className="text-lg font-black text-amber-300">{match.dateLabel}</p>
                        <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/50">{match.day}</p>
                      </div>
                      <div className="flex flex-1 items-center justify-between gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={home.logoUrl} alt={home.shortName} className="h-11 w-11 object-contain" />
                          <span className="text-lg font-black">{home.shortName}</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/70">
                          <Swords className="h-4 w-4" />
                          <span className="text-sm font-bold uppercase tracking-[0.35em]">vs</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-black">{away.shortName}</span>
                          <img src={away.logoUrl} alt={away.shortName} className="h-11 w-11 object-contain" />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.main>
        )}

        {screen === 'match' && selectedMatch && (() => {
          const home = teamMap[selectedMatch.team1];
          const away = teamMap[selectedMatch.team2];
          if (!home || !away) return null;
          const captain1 = home.players.find((player) => player.name === selectedMatch.captain1);
          const captain2 = away.players.find((player) => player.name === selectedMatch.captain2);
          return (
            <motion.main key="match" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative min-h-screen px-6 py-8 md:px-10">
              <div className="absolute inset-0 flex">
                <div className={`flex-1 bg-gradient-to-br ${home.gradient} opacity-20`} />
                <div className={`flex-1 bg-gradient-to-bl ${away.gradient} opacity-20`} />
              </div>
              <div className="relative mx-auto max-w-7xl">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                  <button onClick={() => setScreen('schedule')} className="festival-button-secondary">
                    <ChevronLeft className="h-5 w-5" /> Back Schedule
                  </button>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => setScreen('compare')} className="festival-button-secondary">
                      <Users className="h-5 w-5" /> Compare XI
                    </button>
                    <button onClick={() => setScreen('fantasy')} className="festival-button-primary">
                      <Star className="h-5 w-5" /> Fantasy XI
                    </button>
                  </div>
                </div>

                <section className="festival-panel overflow-hidden p-6 md:p-8">
                  <div className="grid gap-6 xl:grid-cols-[1fr_auto_1fr] xl:items-center">
                    {[
                      { team: home, captain: captain1, name: selectedMatch.captain1 },
                      { team: away, captain: captain2, name: selectedMatch.captain2 },
                    ].map(({ team, captain, name }, index) => (
                      <div key={team.id} className={`captain-panel ${index === 1 ? 'xl:text-right' : ''}`}>
                        <div className={`inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2`}>
                          <img src={team.logoUrl} alt={team.shortName} className="h-9 w-9 object-contain" />
                          <span className="text-xl font-black">{team.name}</span>
                        </div>
                        <div className={`mt-5 flex items-end gap-4 ${index === 1 ? 'xl:flex-row-reverse' : ''}`}>
                          <div className="captain-frame">
                            {captain ? <img src={captain.imageUrl} alt={captain.name} className="captain-image" /> : <Crown className="h-14 w-14 text-white/60" />}
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/50">Captain</p>
                            <h3 className="text-2xl font-black">{name}</h3>
                            <p className="text-sm text-white/70">Pressure handler for {team.shortName}.</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-white/10 bg-black/40 text-center shadow-2xl backdrop-blur-xl">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.35em] text-white/45">Match {selectedMatch.matchNumber}</p>
                        <p className="text-3xl font-black">VS</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-4 md:grid-cols-4">
                    <div className="festival-card"><p className="stat-label">Date</p><p className="stat-value">{formatMatchDate(selectedMatch.date)}</p><p className="text-white/55">{selectedMatch.day}</p></div>
                    <div className="festival-card"><p className="stat-label">Venue</p><p className="stat-value text-2xl">{selectedMatch.venue}</p><p className="text-white/55">Host city: {selectedMatch.city}</p></div>
                    <div className="festival-card"><p className="stat-label">Avg 1st Inns</p><p className="stat-value">{selectedMatch.avgFirstInningsScore}</p><p className="text-white/55">Typical scoreboard pulse.</p></div>
                    <div className="festival-card"><p className="stat-label">Bat First Wins</p><p className="stat-value">{selectedMatch.batFirstWins}%</p><p className="text-white/55">Based on listed venue trend.</p></div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="festival-card">
                      <p className="stat-label">Match Story</p>
                      <p className="mt-2 text-white/75">{selectedMatch.storyline}</p>
                    </div>
                    <div className="festival-card">
                      <p className="stat-label">Ground Snapshot</p>
                      <ul className="mt-3 space-y-2 text-white/75">
                        <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-amber-300" /> {selectedMatch.venue}</li>
                        <li>Total venue matches tracked: {selectedMatch.totalMatches}</li>
                        <li>Recommended approach: {selectedMatch.recommendedStrategy}</li>
                      </ul>
                    </div>
                  </div>
                </section>
              </div>
            </motion.main>
          );
        })()}

        {screen === 'compare' && selectedMatch && (() => {
          const home = teamMap[selectedMatch.team1];
          const away = teamMap[selectedMatch.team2];
          if (!home || !away) return null;
          const left = savedXIs[home.id];
          const right = savedXIs[away.id];
          const renderSide = (team: Team, data?: SavedXI) => (
            <section className={`festival-panel p-6 bg-gradient-to-br ${team.gradient}`}>
              <div className="mb-5 flex items-center gap-4">
                <img src={team.logoUrl} alt={team.shortName} className="h-14 w-14 object-contain" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/50">Saved Combination</p>
                  <h3 className="text-3xl font-black">{team.shortName}</h3>
                </div>
              </div>
              {data?.playing11.length === 11 ? (
                <div className="space-y-3">
                  {data.playing11.map((player, index) => (
                    <div key={player.id} className="slot-card min-h-[88px] bg-black/20">
                      <div className="slot-avatar"><img src={player.imageUrl} alt={player.name} className="slot-avatar-image" /></div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/40">#{index + 1}</p>
                        <p className="font-black">{player.name}</p>
                        <p className="text-xs uppercase tracking-[0.25em] text-white/55">{player.role}</p>
                      </div>
                    </div>
                  ))}
                  {data.impactPlayer && (
                    <div className="rounded-3xl border border-amber-300/25 bg-amber-500/10 p-4 text-sm text-white/80">
                      <span className="font-black text-amber-200">Impact:</span> {data.impactPlayer.name}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-white/20 bg-black/20 p-6 text-white/70">
                  Build and save a complete XI for {team.name} to compare it here.
                </div>
              )}
            </section>
          );
          return (
            <motion.main key="compare" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative min-h-screen px-6 py-8 md:px-10">
              <div className="relative mx-auto max-w-7xl">
                <div className="mb-8 flex items-center justify-between gap-4">
                  <button onClick={() => setScreen('match')} className="festival-button-secondary"><ChevronLeft className="h-5 w-5" /> Back Match</button>
                  <h2 className="text-3xl font-black">Playing XI Face-off</h2>
                  <div className="hidden w-[132px] md:block" />
                </div>
                <div className="grid gap-6 xl:grid-cols-2">
                  {renderSide(home, left)}
                  {renderSide(away, right)}
                </div>
              </div>
            </motion.main>
          );
        })()}

        {screen === 'fantasy' && selectedMatch && (() => {
          const home = teamMap[selectedMatch.team1];
          const away = teamMap[selectedMatch.team2];
          if (!home || !away) return null;
          const picked = fantasyXI[selectedMatch.id] ?? [];
          const allPlayers = [...home.players, ...away.players];
          return (
            <motion.main key="fantasy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative min-h-screen px-6 py-8 md:px-10">
              <div className="relative mx-auto max-w-7xl grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <section className="festival-panel p-6">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <button onClick={() => setScreen('match')} className="festival-button-secondary"><ChevronLeft className="h-5 w-5" /> Back Match</button>
                    <div className="rounded-full border border-white/15 bg-black/20 px-4 py-2 text-sm font-bold text-white/75">{picked.length}/11 selected</div>
                  </div>
                  <h2 className="text-3xl font-black">Fantasy XI</h2>
                  <p className="mt-2 text-white/70">Mix stars from both squads and craft your ideal festival-night combination.</p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {Array.from({ length: 11 }).map((_, index) => {
                      const player = picked[index];
                      return (
                        <div key={index} className="slot-card min-h-[88px]">
                          {player ? (
                            <>
                              <div className="slot-avatar"><img src={player.imageUrl} alt={player.name} className="slot-avatar-image" /></div>
                              <div>
                                <p className="font-black">{player.name}</p>
                                <p className="text-xs uppercase tracking-[0.25em] text-white/55">{player.role}</p>
                              </div>
                            </>
                          ) : (
                            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/35">Select fantasy slot {index + 1}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
                <section className="festival-panel p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <img src={home.logoUrl} alt={home.shortName} className="h-11 w-11 object-contain" />
                    <span className="text-sm font-bold uppercase tracking-[0.3em] text-white/50">Available Players</span>
                    <img src={away.logoUrl} alt={away.shortName} className="h-11 w-11 object-contain" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {allPlayers.map((player) => {
                      const active = picked.some((item) => item.id === player.id);
                      return (
                        <button key={player.id} onClick={() => toggleFantasyPlayer(selectedMatch.id, player)} className={`festival-card text-left ${active ? 'ring-2 ring-emerald-400/70' : ''}`}>
                          <div className="mb-4 flex items-start justify-between gap-3">
                            <div className="player-portrait-wrap small"><img src={player.imageUrl} alt={player.name} className="player-portrait" loading="lazy" /></div>
                            <span className={`status-pill ${active ? 'active' : ''}`}>{active ? 'Selected' : 'Pick'}</span>
                          </div>
                          <p className="font-black leading-tight">{player.name}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-white/55">{player.role}</p>
                        </button>
                      );
                    })}
                  </div>
                </section>
              </div>
            </motion.main>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

export default App;
