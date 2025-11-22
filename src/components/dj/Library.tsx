import React from 'react';
import { useDJ, Track } from '../../context/DJContext';
import { Music, Search, Folder, Disc, ListMusic } from 'lucide-react';

export const Library: React.FC = () => {
  const { library, isSpotifyConnected, connectSpotify, loadTrack } = useDJ();

  return (
    <div className="flex h-[300px] bg-[#111] border-t border-white/10 text-white mt-2">
      {/* Sidebar */}
      <div className="w-48 bg-[#0a0a0a] border-r border-white/5 flex flex-col">
         <div className="p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Sources</div>
         
         <button className="flex items-center gap-3 px-4 py-2 bg-primary/10 text-primary border-l-2 border-primary">
            <Music className="w-4 h-4" />
            <span className="font-medium text-sm">Spotify</span>
         </button>
         <button className="flex items-center gap-3 px-4 py-2 text-muted-foreground hover:text-white hover:bg-white/5 transition-colors">
            <Folder className="w-4 h-4" />
            <span className="font-medium text-sm">Local Music</span>
         </button>
         <button className="flex items-center gap-3 px-4 py-2 text-muted-foreground hover:text-white hover:bg-white/5 transition-colors">
            <Disc className="w-4 h-4" />
            <span className="font-medium text-sm">Sampler</span>
         </button>
         <button className="flex items-center gap-3 px-4 py-2 text-muted-foreground hover:text-white hover:bg-white/5 transition-colors">
            <ListMusic className="w-4 h-4" />
            <span className="font-medium text-sm">Playlists</span>
         </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-[#111]">
        {/* Toolbar */}
        <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search Spotify..." 
              className="bg-transparent border-none text-sm w-full focus:outline-none text-white placeholder:text-muted-foreground/50"
            />
        </div>

        {/* Track List */}
        <div className="flex-1 overflow-y-auto">
           {!isSpotifyConnected ? (
             <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
                <div className="w-16 h-16 bg-[#1db954] rounded-full flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(29,185,84,0.3)]">
                    <Music className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-bold">Connect to Spotify</h3>
                <p className="text-muted-foreground text-center max-w-md text-sm">
                   Access your playlists, liked songs, and discover new music directly within MixMaster Pro.
                   <br/><span className="text-xs opacity-50 mt-2 block">(Simulation Mode)</span>
                </p>
                <button 
                  onClick={connectSpotify}
                  className="bg-[#1db954] hover:bg-[#1ed760] text-black font-bold py-2 px-8 rounded-full transition-all transform active:scale-95"
                >
                   Login with Spotify
                </button>
             </div>
           ) : (
             <table className="w-full text-sm text-left">
                <thead className="text-muted-foreground bg-black/20 sticky top-0">
                   <tr>
                      <th className="p-3 font-medium w-12">#</th>
                      <th className="p-3 font-medium">Title</th>
                      <th className="p-3 font-medium">Artist</th>
                      <th className="p-3 font-medium w-20">BPM</th>
                      <th className="p-3 font-medium w-20">Key</th>
                      <th className="p-3 font-medium w-20">Time</th>
                      <th className="p-3 font-medium w-32 text-right">Load</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                   {library.map((track, idx) => (
                     <tr key={track.id} className="hover:bg-white/5 group">
                        <td className="p-3 text-muted-foreground">{idx + 1}</td>
                        <td className="p-3 font-medium text-white flex items-center gap-3">
                           <img src={track.cover} alt="" className="w-8 h-8 rounded bg-zinc-800 object-cover" />
                           {track.title}
                        </td>
                        <td className="p-3 text-muted-foreground">{track.artist}</td>
                        <td className="p-3 text-white font-mono">{track.bpm}</td>
                        <td className="p-3 text-white font-mono">{track.key}</td>
                        <td className="p-3 text-muted-foreground font-mono">
                          {Math.floor(track.duration / 60)}:{Math.floor(track.duration % 60).toString().padStart(2, '0')}
                        </td>
                        <td className="p-3 text-right">
                           <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => loadTrack('A', track)}
                                className="px-2 py-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded text-xs font-bold hover:bg-cyan-500 hover:text-black"
                              >
                                 DECK A
                              </button>
                              <button 
                                onClick={() => loadTrack('B', track)}
                                className="px-2 py-1 bg-rose-500/20 text-rose-500 border border-rose-500/50 rounded text-xs font-bold hover:bg-rose-500 hover:text-black"
                              >
                                 DECK B
                              </button>
                           </div>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
           )}
        </div>
      </div>
    </div>
  );
};
