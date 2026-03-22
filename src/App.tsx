import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { teams, Team, Player, schedule, Match } from './data';
import { ChevronLeft, Users, Shield, Zap, Check, X, Trophy, Calendar, MapPin, Info } from 'lucide-react';

type Screen = 'home' | 'squad' | 'builder' | 'dashboard' | 'schedule' | 'match_details' | 'compare_xi' | 'fantasy_xi';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [playing11, setPlaying11] = useState<Player[]>([]);
  const [impactPlayer, setImpactPlayer] = useState<Player | null>(null);
  const [savedXIs, setSavedXIs] = useState<Record<string, { playing11: Player[], impactPlayer: Player | null }>>({});
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [fantasyXI, setFantasyXI] = useState<Record<string, Player[]>>({});

  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
    if (savedXIs[team.id]) {
      setPlaying11(savedXIs[team.id].playing11);
      setImpactPlayer(savedXIs[team.id].impactPlayer);
    } else {
      setPlaying11([]);
      setImpactPlayer(null);
    }
    setCurrentScreen('squad');
  };

  const saveCurrentXI = (newPlaying11: Player[], newImpactPlayer: Player | null) => {
    if (selectedTeam) {
      setSavedXIs(prev => ({
        ...prev,
        [selectedTeam.id]: { playing11: newPlaying11, impactPlayer: newImpactPlayer }
      }));
    }
  };

  const handlePlayerToggle = (player: Player) => {
    const isPlaying11 = playing11.some(p => p.id === player.id);
    const isImpact = impactPlayer?.id === player.id;

    let newPlaying11 = [...playing11];
    let newImpactPlayer = impactPlayer;

    if (isPlaying11) {
      newPlaying11 = playing11.filter(p => p.id !== player.id);
    } else if (isImpact) {
      newImpactPlayer = null;
    } else {
      if (playing11.length < 11) {
        newPlaying11 = [...playing11, player];
      } else if (!impactPlayer) {
        newImpactPlayer = player;
      }
    }

    setPlaying11(newPlaying11);
    setImpactPlayer(newImpactPlayer);
    saveCurrentXI(newPlaying11, newImpactPlayer);
  };

  const getPlayerStatus = (player: Player) => {
    if (playing11.some(p => p.id === player.id)) return 'Playing 11';
    if (impactPlayer?.id === player.id) return 'Impact Player';
    return null;
  };

  const handleFantasyPlayerToggle = (matchId: string, player: Player) => {
    const currentXI = fantasyXI[matchId] || [];
    const isSelected = currentXI.some(p => p.id === player.id);

    if (isSelected) {
      setFantasyXI(prev => ({
        ...prev,
        [matchId]: currentXI.filter(p => p.id !== player.id)
      }));
    } else {
      if (currentXI.length < 11) {
        setFantasyXI(prev => ({
          ...prev,
          [matchId]: [...currentXI, player]
        }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-900 text-slate-100 font-sans selection:bg-emerald-500/30">
      <AnimatePresence mode="wait">
        {currentScreen === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-6xl mx-auto p-8"
          >
            <div className="text-center mb-16 mt-12">
              <h1 className="text-6xl font-black tracking-tighter mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-sm">
                IPL SQUAD BUILDER
              </h1>
              <p className="text-blue-200 text-lg max-w-2xl mx-auto font-medium mb-8">
                Select your favorite franchise, build your ultimate playing 11, and choose your game-changing impact player.
              </p>
              <button
                onClick={() => setCurrentScreen('schedule')}
                className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white font-bold inline-flex items-center gap-2 backdrop-blur-md border border-white/20 shadow-xl"
              >
                <Calendar className="w-5 h-5" /> View Tournament Schedule
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teams.map((team) => (
                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  key={team.id}
                  onClick={() => handleTeamSelect(team)}
                  className={`relative overflow-hidden rounded-3xl p-8 text-left transition-all duration-300 group border border-white/10 shadow-2xl bg-gradient-to-br ${team.gradient}`}
                >
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300" />
                  <div className="relative z-10">
                    <img src={team.logoUrl} alt={team.shortName} className="w-16 h-16 object-contain mb-4 drop-shadow-xl" />
                    <h2 className="text-4xl font-black mb-2 tracking-tight text-white drop-shadow-md">{team.shortName}</h2>
                    <p className="text-white/90 font-bold text-lg drop-shadow-sm">{team.name}</p>
                  </div>
                  {/* Decorative circle */}
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {currentScreen === 'squad' && selectedTeam && (
          <motion.div
            key="squad"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className={`min-h-screen bg-gradient-to-br ${selectedTeam.gradient} p-8 flex flex-col overflow-y-auto custom-scrollbar relative`}
          >
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10 flex flex-col flex-1">
              <header className="flex items-center justify-between mb-12 max-w-7xl mx-auto w-full">
              <button
                onClick={() => setCurrentScreen('home')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white font-bold flex items-center gap-2 backdrop-blur-md border border-white/10"
              >
                <ChevronLeft className="w-5 h-5" /> Back to Teams
              </button>
              <div className="flex items-center gap-6">
                <img src={selectedTeam.logoUrl} alt={selectedTeam.shortName} className="w-20 h-20 object-contain drop-shadow-2xl" />
                <div className="text-left">
                  <h2 className="text-5xl font-black tracking-tight text-white drop-shadow-lg uppercase">{selectedTeam.name}</h2>
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r ${selectedTeam.gradient} shadow-lg text-sm font-bold text-white uppercase tracking-wider mt-2`}>
                    Full Squad 2026
                  </div>
                </div>
              </div>
              <button
                onClick={() => setCurrentScreen('builder')}
                className={`px-8 py-3.5 rounded-full font-black transition-all flex items-center gap-3 shadow-2xl bg-gradient-to-r ${selectedTeam.gradient} text-white hover:scale-105 border border-white/20 text-lg`}
              >
                Playing XI <ChevronLeft className="w-6 h-6 rotate-180" />
              </button>
            </header>

            <div className="flex-1 max-w-7xl mx-auto w-full pb-12">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {selectedTeam.players.map(player => (
                  <motion.div 
                    whileHover={{ y: -5, scale: 1.02 }}
                    key={player.id} 
                    className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col items-center text-center shadow-xl hover:bg-white/10 transition-all group"
                  >
                    <div className={`relative w-28 h-28 mb-4 flex items-end justify-center`}>
                      <div className={`absolute inset-0 rounded-full p-1 bg-gradient-to-br ${selectedTeam.gradient} shadow-lg group-hover:shadow-2xl transition-all`}>
                        <div className="w-full h-full rounded-full bg-black/40" />
                      </div>
                      <img src={player.imageUrl} alt={player.name} className="w-28 h-32 object-contain object-bottom relative z-10" />
                    </div>
                    <h3 className="text-lg font-black text-white leading-tight mb-1">{player.name}</h3>
                    <span className="text-xs font-bold uppercase tracking-wider text-white/60">{player.role}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            </div>
          </motion.div>
        )}

        {currentScreen === 'builder' && selectedTeam && (
          <motion.div
            key="builder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`h-screen flex flex-col overflow-hidden bg-gradient-to-br ${selectedTeam.gradient}`}
          >
            <header className={`flex-none bg-black/30 backdrop-blur-md border-b border-white/10 p-4 flex items-center justify-between z-20 shadow-lg`}>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentScreen('squad')}
                  className="p-2 hover:bg-black/20 rounded-full transition-colors text-white"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div>
                  <h2 className="text-2xl font-black flex items-center gap-2 text-white drop-shadow-sm">
                    {selectedTeam.name}
                  </h2>
                  <p className="text-sm font-medium text-white/80">
                    {playing11.length}/11 Selected • {impactPlayer ? '1' : '0'}/1 Impact Player
                  </p>
                </div>
              </div>
              <button
                disabled={playing11.length < 11}
                onClick={() => setCurrentScreen('dashboard')}
                className={`px-6 py-2.5 rounded-full font-bold transition-all flex items-center gap-2 shadow-lg ${
                  playing11.length === 11
                    ? 'bg-white text-blue-900 hover:bg-blue-50 hover:scale-105'
                    : 'bg-black/20 text-white/50 cursor-not-allowed'
                }`}
              >
                View Dashboard <Trophy className="w-5 h-5" />
              </button>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
              <div className="absolute inset-0 bg-black/40" />
              {/* Left Board - The Pitch */}
              <div className="flex-1 relative p-6 overflow-y-auto custom-scrollbar z-10">
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                  <img src={selectedTeam.logoUrl} alt={selectedTeam.name} className="w-[500px] h-[500px] object-contain" />
                </div>
                <div className="max-w-4xl mx-auto relative z-10">
                  <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-emerald-400 uppercase tracking-wider">
                    <Shield className="w-6 h-6" /> Playing 11
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {Array.from({ length: 11 }).map((_, i) => {
                      const player = playing11[i];
                      return (
                        <div
                          key={`slot-${i}`}
                          className={`rounded-2xl border p-4 flex flex-col justify-center min-h-[110px] transition-all ${
                            player 
                              ? 'bg-white/10 border-white/20 shadow-xl backdrop-blur-md' 
                              : 'bg-black/20 border-white/10 border-dashed text-white/40'
                          }`}
                        >
                          {player ? (
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-12 flex items-end justify-center shrink-0">
                                <div className="absolute inset-0 bg-black/40 border-2 border-white/20 rounded-full shadow-md" />
                                <img src={player.imageUrl} alt={player.name} className="w-12 h-14 object-contain object-bottom relative z-10" />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                  <span className="font-bold text-white leading-tight">{player.name}</span>
                                  <button 
                                    onClick={() => handlePlayerToggle(player)}
                                    className="text-white/50 hover:text-red-400 transition-colors -mt-1 -mr-1 p-1"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/30 text-white/80 w-fit">
                                  {player.role}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center text-sm font-bold uppercase tracking-wider">Slot {i + 1}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-yellow-400 uppercase tracking-wider">
                    <Zap className="w-6 h-6" /> Impact Player
                  </h3>
                  <div className="max-w-sm">
                    <div
                      className={`rounded-2xl border p-4 flex flex-col justify-center min-h-[110px] transition-all ${
                        impactPlayer 
                          ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.2)] backdrop-blur-md' 
                          : 'bg-black/20 border-white/10 border-dashed text-white/40'
                      }`}
                    >
                      {impactPlayer ? (
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 flex items-end justify-center shrink-0">
                            <div className="absolute inset-0 bg-black/40 border-2 border-yellow-400/50 rounded-full shadow-md" />
                            <img src={impactPlayer.imageUrl} alt={impactPlayer.name} className="w-12 h-14 object-contain object-bottom relative z-10" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-bold text-white leading-tight">{impactPlayer.name}</span>
                              <button 
                                onClick={() => handlePlayerToggle(impactPlayer)}
                                className="text-white/50 hover:text-red-400 transition-colors -mt-1 -mr-1 p-1"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 w-fit">
                              {impactPlayer.role}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-sm font-bold uppercase tracking-wider">Impact Player Slot</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Sidebar - Squad List */}
              <div className="w-[400px] bg-black/60 backdrop-blur-xl border-l border-white/10 flex flex-col z-10 shadow-2xl">
                <div className="p-5 border-b border-white/10 bg-black/20 sticky top-0">
                  <h3 className="font-black text-lg flex items-center gap-2 text-white uppercase tracking-wider">
                    <Users className="w-5 h-5 text-blue-400" /> Squad Roster
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {selectedTeam.players.map((player) => {
                    const status = getPlayerStatus(player);
                    const isSelected = !!status;
                    const isDisabled = !isSelected && playing11.length === 11 && impactPlayer !== null;

                    return (
                      <button
                        key={player.id}
                        disabled={isDisabled}
                        onClick={() => handlePlayerToggle(player)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 group ${
                          isSelected
                            ? status === 'Playing 11'
                              ? `bg-white/20 border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.2)]`
                              : 'bg-yellow-500/20 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.15)]'
                            : isDisabled
                            ? 'bg-black/20 border-white/5 opacity-40 cursor-not-allowed'
                            : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                        }`}
                      >
                        <div className="relative w-10 h-10 flex items-end justify-center shrink-0">
                          <div className="absolute inset-0 bg-black/40 border border-white/20 rounded-full" />
                          <img src={player.imageUrl} alt={player.name} className="w-10 h-12 object-contain object-bottom relative z-10" />
                        </div>
                        <div className="flex-1">
                          <div className={`font-bold ${isSelected ? 'text-white' : 'text-blue-100'}`}>
                            {player.name}
                          </div>
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-300/70 mt-0.5">{player.role}</div>
                        </div>
                        {isSelected && (
                          <div className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${
                            status === 'Playing 11' ? 'bg-white text-black shadow-md' : 'bg-yellow-500 text-blue-950 shadow-md'
                          }`}>
                            {status === 'Playing 11' ? <Check className="w-3 h-3" /> : 'IP'}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {currentScreen === 'dashboard' && selectedTeam && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className={`min-h-screen bg-gradient-to-br ${selectedTeam.gradient} p-8 flex flex-col relative`}
          >
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10 flex flex-col flex-1">
              <header className="flex items-center justify-between mb-8">
                <button
                  onClick={() => setCurrentScreen('builder')}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white font-bold flex items-center gap-2 backdrop-blur-md border border-white/10"
                >
                  <ChevronLeft className="w-5 h-5" /> Edit Squad
                </button>
                <div className="text-center">
                  <h2 className="text-4xl font-black tracking-tight text-white mb-2 drop-shadow-lg uppercase">{selectedTeam.name}</h2>
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md shadow-lg text-sm font-bold text-white uppercase tracking-wider border border-white/10`}>
                    Matchday Squad
                  </div>
                </div>
                <div className="w-[140px]" /> {/* Spacer for centering */}
              </header>

              <div className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Pitch View */}
              <div className="lg:col-span-2 border-4 border-white/20 rounded-[3rem] p-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[700px] shadow-2xl bg-black/20 backdrop-blur-sm">
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                  <img src={selectedTeam.logoUrl} alt={selectedTeam.name} className="w-[500px] h-[500px] object-contain" />
                </div>
                {/* Field markings */}
                <div className="absolute inset-4 border-[3px] border-white/20 rounded-[2.5rem]" />
                <div className="absolute inset-x-1/4 top-[20%] bottom-[20%] border-[3px] border-white/10 rounded-[4rem]" />
                <div className="absolute left-1/2 top-[25%] bottom-[25%] w-20 -ml-10 border-[3px] border-white/30 bg-white/5" />
                
                <div className="relative z-10 w-full h-full flex flex-col justify-between py-8">
                  {/* Top order */}
                  <div className="flex justify-center gap-16">
                    {playing11.slice(0, 2).map(p => <PlayerNode key={p.id} player={p} />)}
                  </div>
                  {/* Upper Middle */}
                  <div className="flex justify-center gap-24">
                    {playing11.slice(2, 5).map(p => <PlayerNode key={p.id} player={p} />)}
                  </div>
                  {/* Lower Middle */}
                  <div className="flex justify-center gap-24">
                    {playing11.slice(5, 8).map(p => <PlayerNode key={p.id} player={p} />)}
                  </div>
                  {/* Tail */}
                  <div className="flex justify-center gap-16">
                    {playing11.slice(8, 11).map(p => <PlayerNode key={p.id} player={p} />)}
                  </div>
                </div>
              </div>

              {/* Sidebar Stats & Impact */}
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                  <h3 className="text-2xl font-black mb-6 flex items-center gap-2 text-yellow-400 uppercase tracking-wider">
                    <Zap className="w-6 h-6" /> Impact Player
                  </h3>
                  {impactPlayer ? (
                    <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-6 text-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl" />
                      <div className="relative w-24 h-24 mx-auto mb-4 flex items-end justify-center">
                        <div className="absolute inset-0 bg-black/40 border-4 border-yellow-400 rounded-full shadow-xl" />
                        <img src={impactPlayer.imageUrl} alt={impactPlayer.name} className="w-24 h-28 object-contain object-bottom relative z-10" />
                      </div>
                      <h4 className="text-2xl font-black text-white mb-1 relative z-10">{impactPlayer.name}</h4>
                      <span className="text-xs font-bold uppercase tracking-wider text-yellow-300 relative z-10">{impactPlayer.role}</span>
                    </div>
                  ) : (
                    <div className="text-white/50 text-center py-8 font-bold uppercase tracking-wider">No impact player selected</div>
                  )}
                </div>

                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                  <h3 className="text-2xl font-black mb-6 text-white uppercase tracking-wider">Team Balance</h3>
                  <div className="space-y-5">
                    <BalanceBar 
                      label="Batsmen" 
                      count={playing11.filter(p => p.role === 'Batsman').length} 
                      color="bg-blue-400" 
                    />
                    <BalanceBar 
                      label="Bowlers" 
                      count={playing11.filter(p => p.role === 'Bowler').length} 
                      color="bg-red-400" 
                    />
                    <BalanceBar 
                      label="All-rounders" 
                      count={playing11.filter(p => p.role === 'All-rounder').length} 
                      color="bg-purple-400" 
                    />
                    <BalanceBar 
                      label="Wicket-keepers" 
                      count={playing11.filter(p => p.role === 'Wicket-keeper').length} 
                      color="bg-yellow-400" 
                    />
                  </div>
                </div>
              </div>
            </div>
            </div>
          </motion.div>
        )}

        {currentScreen === 'schedule' && (
          <motion.div
            key="schedule"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-900 p-8 flex flex-col overflow-y-auto custom-scrollbar"
          >
            <header className="flex items-center justify-between mb-12 max-w-5xl mx-auto w-full">
              <button
                onClick={() => setCurrentScreen('home')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white font-bold flex items-center gap-2 backdrop-blur-md border border-white/10"
              >
                <ChevronLeft className="w-5 h-5" /> Back to Home
              </button>
              <h2 className="text-4xl font-black tracking-tight text-white drop-shadow-lg uppercase flex items-center gap-3">
                <Calendar className="w-8 h-8 text-yellow-400" /> Tournament Schedule
              </h2>
              <div className="w-[140px]" /> {/* Spacer */}
            </header>

            <div className="max-w-5xl mx-auto w-full space-y-6 pb-12">
              {schedule.map((match) => {
                const team1 = teams.find(t => t.id === match.team1);
                const team2 = teams.find(t => t.id === match.team2);
                if (!team1 || !team2) return null;

                return (
                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      setSelectedMatch(match);
                      setCurrentScreen('match_details');
                    }}
                    key={match.id} 
                    className="w-full text-left bg-white/10 hover:bg-white/15 transition-colors backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden cursor-pointer"
                  >
                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-yellow-400 to-orange-500" />
                    
                    {/* Date & Venue */}
                    <div className="flex flex-col items-center md:items-start min-w-[200px]">
                      <div className="text-yellow-400 font-black text-xl mb-1">{new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      <div className="flex items-center gap-1.5 text-white/70 text-sm font-medium">
                        <MapPin className="w-4 h-4" /> {match.venue}
                      </div>
                    </div>

                    {/* Teams */}
                    <div className="flex-1 flex items-center justify-center gap-6 w-full">
                      <div className="flex flex-col items-center gap-2 flex-1">
                        <img src={team1.logoUrl} alt={team1.shortName} className="w-20 h-20 object-contain drop-shadow-xl" />
                        <span className="font-black text-xl text-white tracking-wide">{team1.shortName}</span>
                        <span className="text-xs text-white/60 font-bold uppercase tracking-wider bg-black/30 px-2 py-1 rounded-md">Capt: {match.captain1}</span>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center px-4">
                        <div className="text-2xl font-black text-white/40 italic mb-1">VS</div>
                      </div>

                      <div className="flex flex-col items-center gap-2 flex-1">
                        <img src={team2.logoUrl} alt={team2.shortName} className="w-20 h-20 object-contain drop-shadow-xl" />
                        <span className="font-black text-xl text-white tracking-wide">{team2.shortName}</span>
                        <span className="text-xs text-white/60 font-bold uppercase tracking-wider bg-black/30 px-2 py-1 rounded-md">Capt: {match.captain2}</span>
                      </div>
                    </div>

                    {/* Match Stats */}
                    <div className="min-w-[220px] bg-black/20 rounded-2xl p-4 border border-white/5 flex flex-col gap-3">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-[10px] text-white/60 uppercase tracking-wider font-bold">Avg 1st Innings</div>
                          <div className="text-lg font-black text-white">{match.avgFirstInningsScore} Runs</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Trophy className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-[10px] text-white/60 uppercase tracking-wider font-bold">Bat First Wins</div>
                          <div className="text-lg font-black text-white">{match.batFirstWins} <span className="text-sm text-white/50 font-medium">/ {match.totalMatches}</span></div>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
        {currentScreen === 'match_details' && selectedMatch && (
          <motion.div
            key="match_details"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col overflow-hidden bg-slate-900"
          >
            {(() => {
              const team1 = teams.find(t => t.id === selectedMatch.team1);
              const team2 = teams.find(t => t.id === selectedMatch.team2);
              if (!team1 || !team2) return null;

              const captain1Player = team1.players.find(p => p.name === selectedMatch.captain1);
              const captain2Player = team2.players.find(p => p.name === selectedMatch.captain2);

              return (
                <>
                  <header className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center">
                    <button
                      onClick={() => setCurrentScreen('schedule')}
                      className="px-4 py-2 bg-black/40 hover:bg-black/60 rounded-full transition-colors text-white font-bold flex items-center gap-2 backdrop-blur-md border border-white/10"
                    >
                      <ChevronLeft className="w-5 h-5" /> Back to Schedule
                    </button>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setCurrentScreen('compare_xi')}
                        className="px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white font-bold flex items-center gap-2 backdrop-blur-md border border-white/20 shadow-xl"
                      >
                        <Users className="w-5 h-5" /> Compare Playing XI
                      </button>
                      <button
                        onClick={() => setCurrentScreen('fantasy_xi')}
                        className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-105 rounded-full transition-transform text-white font-bold flex items-center gap-2 shadow-xl border border-white/20"
                      >
                        <Trophy className="w-5 h-5" /> Fantasy XI
                      </button>
                    </div>
                  </header>

                  <div className="flex-1 flex flex-col md:flex-row relative">
                    {/* VS Badge */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center">
                      <div className="w-24 h-24 bg-black/80 backdrop-blur-xl rounded-full flex items-center justify-center border-4 border-white/10 shadow-2xl">
                        <span className="text-4xl font-black text-white italic">VS</span>
                      </div>
                      <div className="mt-6 bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-center shadow-2xl">
                        <div className="text-yellow-400 font-black text-xl mb-1">
                          {new Date(selectedMatch.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="flex items-center justify-center gap-1.5 text-white/80 text-sm font-medium">
                          <MapPin className="w-4 h-4" /> {selectedMatch.venue}
                        </div>
                      </div>
                    </div>

                    {/* Team 1 Side */}
                    <div className={`flex-1 relative overflow-hidden flex flex-col items-center justify-center p-8 bg-gradient-to-br ${team1.gradient}`}>
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                        <img src={team1.logoUrl} alt={team1.name} className="w-[800px] h-[800px] object-contain -ml-40" />
                      </div>
                      
                      <div className="relative z-20 flex flex-col items-center text-center mt-12">
                        <img src={team1.logoUrl} alt={team1.shortName} className="w-32 h-32 object-contain drop-shadow-2xl mb-6" />
                        <h2 className="text-5xl font-black text-white drop-shadow-lg uppercase tracking-tight mb-2">{team1.name}</h2>
                        
                        {captain1Player && (
                          <div className="mt-12 flex flex-col items-center">
                            <div className="relative w-48 h-48 flex items-end justify-center">
                              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl" />
                              <div className="absolute inset-0 bg-black/40 border-4 border-white/30 rounded-full shadow-2xl" />
                              <img src={captain1Player.imageUrl} alt={captain1Player.name} className="w-48 h-56 object-contain object-bottom relative z-10" />
                            </div>
                            <div className="mt-4 bg-black/40 backdrop-blur-md px-6 py-2 rounded-xl border border-white/10">
                              <div className="text-2xl font-black text-white">{captain1Player.name}</div>
                              <div className="text-xs text-white/70 uppercase tracking-widest font-bold">Captain</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Team 2 Side */}
                    <div className={`flex-1 relative overflow-hidden flex flex-col items-center justify-center p-8 bg-gradient-to-bl ${team2.gradient}`}>
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                        <img src={team2.logoUrl} alt={team2.name} className="w-[800px] h-[800px] object-contain ml-40" />
                      </div>
                      
                      <div className="relative z-20 flex flex-col items-center text-center mt-12">
                        <img src={team2.logoUrl} alt={team2.shortName} className="w-32 h-32 object-contain drop-shadow-2xl mb-6" />
                        <h2 className="text-5xl font-black text-white drop-shadow-lg uppercase tracking-tight mb-2">{team2.name}</h2>
                        
                        {captain2Player && (
                          <div className="mt-12 flex flex-col items-center">
                            <div className="relative w-48 h-48 flex items-end justify-center">
                              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl" />
                              <div className="absolute inset-0 bg-black/40 border-4 border-white/30 rounded-full shadow-2xl" />
                              <img src={captain2Player.imageUrl} alt={captain2Player.name} className="w-48 h-56 object-contain object-bottom relative z-10" />
                            </div>
                            <div className="mt-4 bg-black/40 backdrop-blur-md px-6 py-2 rounded-xl border border-white/10">
                              <div className="text-2xl font-black text-white">{captain2Player.name}</div>
                              <div className="text-xs text-white/70 uppercase tracking-widest font-bold">Captain</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Stats Bar */}
                  <div className="absolute bottom-0 left-0 right-0 z-40 bg-black/60 backdrop-blur-xl border-t border-white/10 p-6">
                    <div className="max-w-4xl mx-auto flex justify-around items-center">
                      <div className="text-center">
                        <div className="text-white/60 text-xs uppercase tracking-widest font-bold mb-1">Avg 1st Innings Score</div>
                        <div className="text-3xl font-black text-white">{selectedMatch.avgFirstInningsScore}</div>
                      </div>
                      <div className="w-px h-12 bg-white/10" />
                      <div className="text-center">
                        <div className="text-white/60 text-xs uppercase tracking-widest font-bold mb-1">Bat First Wins</div>
                        <div className="text-3xl font-black text-white">{selectedMatch.batFirstWins} <span className="text-lg text-white/40">/ {selectedMatch.totalMatches}</span></div>
                      </div>
                      <div className="w-px h-12 bg-white/10" />
                      <div className="text-center">
                        <div className="text-white/60 text-xs uppercase tracking-widest font-bold mb-1">Win Percentage (Bat 1st)</div>
                        <div className="text-3xl font-black text-yellow-400">{Math.round((selectedMatch.batFirstWins / selectedMatch.totalMatches) * 100)}%</div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </motion.div>
        )}
        {currentScreen === 'compare_xi' && selectedMatch && (
          <motion.div
            key="compare_xi"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col overflow-hidden bg-slate-900"
          >
            {(() => {
              const team1 = teams.find(t => t.id === selectedMatch.team1);
              const team2 = teams.find(t => t.id === selectedMatch.team2);
              if (!team1 || !team2) return null;

              const team1XI = savedXIs[team1.id];
              const team2XI = savedXIs[team2.id];

              return (
                <>
                  <header className="flex-none bg-black/40 backdrop-blur-md border-b border-white/10 p-6 flex items-center justify-between z-50">
                    <button
                      onClick={() => setCurrentScreen('match_details')}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white font-bold flex items-center gap-2 backdrop-blur-md border border-white/10"
                    >
                      <ChevronLeft className="w-5 h-5" /> Back to Match
                    </button>
                    <h2 className="text-3xl font-black text-white uppercase tracking-wider flex items-center gap-4">
                      <img src={team1.logoUrl} alt={team1.shortName} className="w-10 h-10 object-contain" />
                      Compare Playing XI
                      <img src={team2.logoUrl} alt={team2.shortName} className="w-10 h-10 object-contain" />
                    </h2>
                    <div className="w-[140px]" />
                  </header>

                  <div className="flex-1 flex flex-col md:flex-row relative">
                    {/* VS Divider */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 z-30 hidden md:block" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 hidden md:flex w-16 h-16 bg-black/80 backdrop-blur-xl rounded-full items-center justify-center border-2 border-white/10 shadow-2xl">
                      <span className="text-xl font-black text-white italic">VS</span>
                    </div>

                    {/* Team 1 Side */}
                    <div className={`flex-1 relative overflow-y-auto custom-scrollbar p-8 bg-gradient-to-br ${team1.gradient}`}>
                      <div className="absolute inset-0 bg-black/40" />
                      <div className="relative z-20 max-w-md mx-auto">
                        <div className="flex items-center gap-4 mb-8">
                          <img src={team1.logoUrl} alt={team1.shortName} className="w-16 h-16 object-contain drop-shadow-xl" />
                          <h3 className="text-3xl font-black text-white drop-shadow-md uppercase">{team1.name}</h3>
                        </div>

                        {team1XI && team1XI.playing11.length === 11 ? (
                          <div className="space-y-4">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
                              <h4 className="text-emerald-400 font-black uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5" /> Playing 11
                              </h4>
                              <div className="space-y-2">
                                {team1XI.playing11.map((player, idx) => (
                                  <div key={player.id} className="flex items-center gap-3 bg-black/20 p-2 rounded-xl border border-white/5">
                                    <div className="w-6 text-center text-white/40 font-bold text-sm">{idx + 1}</div>
                                    <div className="relative w-10 h-10 flex items-end justify-center shrink-0">
                                      <div className="absolute inset-0 bg-black/40 border border-white/20 rounded-full" />
                                      <img src={player.imageUrl} alt={player.name} className="w-10 h-12 object-contain object-bottom relative z-10" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-bold text-white text-sm">{player.name}</div>
                                      <div className="text-[10px] text-white/60 uppercase tracking-wider font-bold">{player.role}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {team1XI.impactPlayer && (
                              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-md rounded-2xl p-6 border border-yellow-500/30 shadow-xl">
                                <h4 className="text-yellow-400 font-black uppercase tracking-wider mb-4 flex items-center gap-2">
                                  <Zap className="w-5 h-5" /> Impact Player
                               </h4>
                                <div className="flex items-center gap-3 bg-black/20 p-2 rounded-xl border border-yellow-500/20">
                                  <div className="relative w-12 h-12 flex items-end justify-center shrink-0">
                                    <div className="absolute inset-0 bg-black/40 border-2 border-yellow-400/50 rounded-full" />
                                    <img src={team1XI.impactPlayer.imageUrl} alt={team1XI.impactPlayer.name} className="w-12 h-14 object-contain object-bottom relative z-10" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-white">{team1XI.impactPlayer.name}</div>
                                    <div className="text-[10px] text-yellow-300 uppercase tracking-wider font-bold">{team1XI.impactPlayer.role}</div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-black/40 backdrop-blur-md rounded-3xl p-8 text-center border border-white/10">
                            <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
                            <h4 className="text-xl font-bold text-white mb-2">No Squad Saved</h4>
                            <p className="text-white/60 mb-6">Build a playing 11 for {team1.shortName} to compare.</p>
                            <button
                              onClick={() => {
                                handleTeamSelect(team1);
                                setCurrentScreen('builder');
                              }}
                              className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors"
                            >
                              Build Squad
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Team 2 Side */}
                    <div className={`flex-1 relative overflow-y-auto custom-scrollbar p-8 bg-gradient-to-bl ${team2.gradient}`}>
                      <div className="absolute inset-0 bg-black/40" />
                      <div className="relative z-20 max-w-md mx-auto">
                        <div className="flex items-center gap-4 mb-8 justify-end">
                          <h3 className="text-3xl font-black text-white drop-shadow-md uppercase text-right">{team2.name}</h3>
                          <img src={team2.logoUrl} alt={team2.shortName} className="w-16 h-16 object-contain drop-shadow-xl" />
                        </div>

                        {team2XI && team2XI.playing11.length === 11 ? (
                          <div className="space-y-4">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
                              <h4 className="text-emerald-400 font-black uppercase tracking-wider mb-4 flex items-center gap-2 justify-end">
                                Playing 11 <Shield className="w-5 h-5" />
                              </h4>
                              <div className="space-y-2">
                                {team2XI.playing11.map((player, idx) => (
                                  <div key={player.id} className="flex items-center gap-3 bg-black/20 p-2 rounded-xl border border-white/5 flex-row-reverse text-right">
                                    <div className="w-6 text-center text-white/40 font-bold text-sm">{idx + 1}</div>
                                    <div className="relative w-10 h-10 flex items-end justify-center shrink-0">
                                      <div className="absolute inset-0 bg-black/40 border border-white/20 rounded-full" />
                                      <img src={player.imageUrl} alt={player.name} className="w-10 h-12 object-contain object-bottom relative z-10" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-bold text-white text-sm">{player.name}</div>
                                      <div className="text-[10px] text-white/60 uppercase tracking-wider font-bold">{player.role}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {team2XI.impactPlayer && (
                              <div className="bg-gradient-to-l from-yellow-500/20 to-orange-500/20 backdrop-blur-md rounded-2xl p-6 border border-yellow-500/30 shadow-xl">
                                <h4 className="text-yellow-400 font-black uppercase tracking-wider mb-4 flex items-center gap-2 justify-end">
                                  Impact Player <Zap className="w-5 h-5" />
                               </h4>
                                <div className="flex items-center gap-3 bg-black/20 p-2 rounded-xl border border-yellow-500/20 flex-row-reverse text-right">
                                  <div className="relative w-12 h-12 flex items-end justify-center shrink-0">
                                    <div className="absolute inset-0 bg-black/40 border-2 border-yellow-400/50 rounded-full" />
                                    <img src={team2XI.impactPlayer.imageUrl} alt={team2XI.impactPlayer.name} className="w-12 h-14 object-contain object-bottom relative z-10" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-white">{team2XI.impactPlayer.name}</div>
                                    <div className="text-[10px] text-yellow-300 uppercase tracking-wider font-bold">{team2XI.impactPlayer.role}</div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-black/40 backdrop-blur-md rounded-3xl p-8 text-center border border-white/10">
                            <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
                            <h4 className="text-xl font-bold text-white mb-2">No Squad Saved</h4>
                            <p className="text-white/60 mb-6">Build a playing 11 for {team2.shortName} to compare.</p>
                            <button
                              onClick={() => {
                                handleTeamSelect(team2);
                                setCurrentScreen('builder');
                              }}
                              className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors"
                            >
                              Build Squad
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </motion.div>
        )}
        {currentScreen === 'fantasy_xi' && selectedMatch && (
          <motion.div
            key="fantasy_xi"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col overflow-hidden bg-slate-900 relative"
          >
            {(() => {
              const team1 = teams.find(t => t.id === selectedMatch.team1);
              const team2 = teams.find(t => t.id === selectedMatch.team2);
              if (!team1 || !team2) return null;

              const currentXI = fantasyXI[selectedMatch.id] || [];
              const allPlayers = [...team1.players, ...team2.players];

              return (
                <>
                  <div className="absolute inset-0 flex">
                    <div className={`flex-1 bg-gradient-to-br ${team1.gradient} opacity-30`} />
                    <div className={`flex-1 bg-gradient-to-bl ${team2.gradient} opacity-30`} />
                  </div>
                  <div className="absolute inset-0 bg-black/40" />
                  
                  <header className="flex-none bg-black/40 backdrop-blur-md border-b border-white/10 p-4 flex items-center justify-between z-50">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setCurrentScreen('match_details')}
                        className="p-2 hover:bg-black/20 rounded-full transition-colors text-white"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <div>
                        <h2 className="text-2xl font-black flex items-center gap-2 text-white drop-shadow-sm">
                          Fantasy XI
                        </h2>
                        <p className="text-sm font-medium text-white/80">
                          {currentXI.length}/11 Selected
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-white/10">
                        <img src={team1.logoUrl} alt={team1.shortName} className="w-6 h-6 object-contain" />
                        <span className="text-white font-bold">{currentXI.filter(p => team1.players.some(t1p => t1p.id === p.id)).length}</span>
                        <span className="text-white/40 mx-2">|</span>
                        <span className="text-white font-bold">{currentXI.filter(p => team2.players.some(t2p => t2p.id === p.id)).length}</span>
                        <img src={team2.logoUrl} alt={team2.shortName} className="w-6 h-6 object-contain" />
                      </div>
                    </div>
                  </header>

                  <div className="flex-1 flex overflow-hidden relative z-10">
                    {/* Left Board - The Pitch */}
                    <div className="flex-1 relative p-6 overflow-y-auto custom-scrollbar">
                      <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/40 to-teal-900/40 opacity-50" />
                      
                      <div className="max-w-4xl mx-auto relative z-10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                          {Array.from({ length: 11 }).map((_, i) => {
                            const player = currentXI[i];
                            return (
                              <div
                                key={`slot-${i}`}
                                className={`rounded-2xl border p-4 flex flex-col justify-center min-h-[110px] transition-all ${
                                  player 
                                    ? 'bg-white/10 border-white/20 shadow-xl backdrop-blur-md' 
                                    : 'bg-black/20 border-white/10 border-dashed text-white/40'
                                }`}
                              >
                                {player ? (
                                  <div className="flex items-center gap-3">
                                    <div className="relative w-12 h-12 flex items-end justify-center shrink-0">
                                      <div className="absolute inset-0 bg-black/40 border-2 border-white/20 rounded-full shadow-md" />
                                      <img src={player.imageUrl} alt={player.name} className="w-12 h-14 object-contain object-bottom relative z-10" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-white leading-tight">{player.name}</span>
                                        <button 
                                          onClick={() => handleFantasyPlayerToggle(selectedMatch.id, player)}
                                          className="text-white/50 hover:text-red-400 transition-colors -mt-1 -mr-1 p-1"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/30 text-white/80 w-fit">
                                          {player.role}
                                        </span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/60 w-fit">
                                          {team1.players.some(p => p.id === player.id) ? team1.shortName : team2.shortName}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center text-sm font-bold uppercase tracking-wider">Slot {i + 1}</div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Right Sidebar - Players List */}
                    <div className="w-[400px] bg-black/60 backdrop-blur-xl border-l border-white/10 flex flex-col z-10 shadow-2xl">
                      <div className="p-5 border-b border-white/10 bg-black/20 sticky top-0 flex gap-2">
                        <div className="flex-1 text-center py-2 bg-white/10 rounded-lg font-bold text-white text-sm">
                          {team1.shortName}
                        </div>
                        <div className="flex-1 text-center py-2 bg-white/10 rounded-lg font-bold text-white text-sm">
                          {team2.shortName}
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {allPlayers.map((player) => {
                          const isSelected = currentXI.some(p => p.id === player.id);
                          const isDisabled = !isSelected && currentXI.length === 11;
                          const isTeam1 = team1.players.some(p => p.id === player.id);

                          return (
                            <button
                              key={player.id}
                              disabled={isDisabled}
                              onClick={() => handleFantasyPlayerToggle(selectedMatch.id, player)}
                              className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 group ${
                                isSelected
                                  ? 'bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                                  : isDisabled
                                  ? 'bg-black/20 border-white/5 opacity-40 cursor-not-allowed'
                                  : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                              }`}
                            >
                              <div className="relative w-10 h-10 flex items-end justify-center shrink-0">
                                <div className="absolute inset-0 bg-black/40 border border-white/20 rounded-full" />
                                <img src={player.imageUrl} alt={player.name} className="w-10 h-12 object-contain object-bottom relative z-10" />
                              </div>
                              <div className="flex-1">
                                <div className={`font-bold flex items-center gap-2 ${isSelected ? 'text-white' : 'text-blue-100'}`}>
                                  {player.name}
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded-sm ${isTeam1 ? team1.color : team2.color} text-white`}>
                                    {isTeam1 ? team1.shortName : team2.shortName}
                                  </span>
                                </div>
                                <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-300/70 mt-0.5">{player.role}</div>
                              </div>
                              {isSelected && (
                                <div className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-emerald-500 text-white shadow-md">
                                  <Check className="w-3 h-3" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PlayerNode: React.FC<{ player: Player }> = ({ player }) => {
  return (
    <div className="flex flex-col items-center group cursor-pointer">
      <div className="relative w-16 h-16 flex items-end justify-center">
        <div className="absolute inset-0 bg-white/20 rounded-full blur-md group-hover:bg-white/40 transition-all" />
        <div className="absolute inset-0 bg-black/40 border-4 border-white rounded-full shadow-xl" />
        <img 
          src={player.imageUrl} 
          alt={player.name} 
          className="w-16 h-20 object-contain object-bottom relative z-10 group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      <div className="bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-lg border border-white/20 text-center mt-3 shadow-xl">
        <div className="text-sm font-black text-white whitespace-nowrap">{player.name}</div>
        <div className="text-[9px] text-white/70 uppercase tracking-widest font-bold mt-0.5">{player.role}</div>
      </div>
    </div>
  );
};

const BalanceBar: React.FC<{ label: string; count: number; color: string }> = ({ label, count, color }) => {
  const percentage = (count / 11) * 100;
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-white/80 font-bold uppercase tracking-wider text-xs">{label}</span>
        <span className="font-black text-white">{count}</span>
      </div>
      <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-white/10 shadow-inner">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`h-full ${color} shadow-[0_0_10px_currentColor]`} 
        />
      </div>
    </div>
  );
}
