import { useState } from 'react';
import './App.css';

function App() {
  const [gameState, setGameState] = useState('setup'); // setup, playing
  const [players, setPlayers] = useState([]);
  const [playerNames, setPlayerNames] = useState(['', '', '', '']);
  const [currentRound, setCurrentRound] = useState(1);
  const [roundPoints, setRoundPoints] = useState([0, 0, 0, 0]);
  const [notification, setNotification] = useState(null);

  // Handle nama pemain berubah
  const handleNameChange = (index, value) => {
    const newNames = [...playerNames];
    newNames[index] = value;
    setPlayerNames(newNames);
  };

  // Mulai permainan
  const startGame = () => {
    if (playerNames.some(name => name.trim() === '')) {
      alert('Semua pemain harus memiliki nama!');
      return;
    }
    const newPlayers = playerNames.map(name => ({
      name: name.trim(),
      totalPoints: 0,
      roundHistory: []
    }));
    setPlayers(newPlayers);
    setGameState('playing');
    setRoundPoints([0, 0, 0, 0]);
  };

  // Handle poin per pemain berubah
  const handlePointChange = (index, value) => {
    const newPoints = [...roundPoints];
    newPoints[index] = value === '' ? 0 : parseInt(value) || 0;
    setRoundPoints(newPoints);
  };

  // Selesai ronde
  const endRound = () => {
    // Update total poin
    const updatedPlayers = players.map((player, index) => ({
      ...player,
      totalPoints: player.totalPoints + roundPoints[index],
      roundHistory: [...player.roundHistory, roundPoints[index]]
    }));

    // Cek pemain yang "kebakar"
    let finalPlayers = updatedPlayers;
    
    // Hanya kebakar jika ada perubahan urutan (dari lebih tinggi menjadi lebih rendah)
    if (currentRound > 1) {
      // Urutkan pemain berdasarkan poin ronde sebelumnya
      const prevRoundTotals = players.map(p => p.totalPoints);
      const prevRoundData = players.map((p, i) => ({ ...p, idx: i }));
      const prevSorted = [...prevRoundData].sort((a, b) => b.totalPoints - a.totalPoints);
      
      // Urutkan pemain berdasarkan poin ronde sekarang
      const currSorted = [...updatedPlayers].sort((a, b) => b.totalPoints - a.totalPoints);
      
      const prevTop2 = prevSorted.slice(0, 2);
      const currTop2 = currSorted.slice(0, 2);
      
      // Cek jika top 2 berubah (ada yang dilewati)
      if (prevTop2.length === 2 && currTop2.length === 2) {
        const prevTopName = prevTop2[0].name;
        const currTopName = currTop2[0].name;
        
        // Jika top 1 berubah, pemain yang sebelumnya top dan sekarang top 2 kebakar
        if (prevTopName !== currTopName) {
          const overtakenPlayer = currSorted.slice(0, 2).find(p => p.name === prevTopName);
          
          if (overtakenPlayer && overtakenPlayer.totalPoints > 100 && currTop2[0].totalPoints > 100) {
            finalPlayers = updatedPlayers.map(player => {
              if (player.name === overtakenPlayer.name) {
                return {
                  ...player,
                  totalPoints: 0
                };
              }
              return player;
            });
            
            setNotification({
              message: `${overtakenPlayer.name} KEBAKAR! 🔥 Poin direset ke 0`,
              type: 'burning'
            });

            setTimeout(() => setNotification(null), 2000);
          }
        }
      }
    }

    setPlayers(finalPlayers);
    setRoundPoints([0, 0, 0, 0]);
    setCurrentRound(currentRound + 1);
  };

  // Reset poin pemain tapi tetap di game yang sama
  const resetPoints = () => {
    if (window.confirm('Apakah Anda yakin ingin mereset semua poin pemain ke 0?')) {
      const resetPlayers = players.map(player => ({
        ...player,
        totalPoints: 0,
        roundHistory: []
      }));
      setPlayers(resetPlayers);
      setRoundPoints([0, 0, 0, 0]);
      setCurrentRound(1);
      setNotification(null);
    }
  };

  // Reset permainan
  const resetGame = () => {
    setGameState('setup');
    setPlayerNames(['', '', '', '']);
    setPlayers([]);
    setCurrentRound(1);
    setRoundPoints([0, 0, 0, 0]);
    setNotification(null);
  };

  return (
    <div className="App">
      {gameState === 'setup' ? (
        <div className="setup-container">
          <h1>Hitung Cekih</h1>
          <p className="subtitle">Masukkan nama 4 pemain</p>
          
          <div className="player-inputs">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="player-input-group">
                <label>Pemain {index + 1}</label>
                <input
                  type="text"
                  placeholder={`Nama pemain ${index + 1}`}
                  value={playerNames[index]}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && startGame()}
                />
              </div>
            ))}
          </div>

          <button className="btn btn-primary" onClick={startGame}>
            Mulai Permainan
          </button>
        </div>
      ) : (
        <div className="game-container">
          <div className="game-header">
            <h1>Hitung Cekih</h1>
            <p className="round-indicator">Ronde {currentRound}</p>
          </div>

          {notification && (
            <div className={`notification notification-${notification.type}`}>
              {notification.message}
            </div>
          )}

          {/* Tampilan Poin Pemain */}
          <div className="players-scoreboard">
            <h2>Poin Pemain</h2>
            <div className="scores-grid">
              {players.map((player, index) => (
                <div
                  key={index}
                  className={`player-score ${
                    player.totalPoints > 100 ? 'burning' : ''
                  }`}
                >
                  <h3>{player.name}</h3>
                  <p className="total-points">{player.totalPoints}</p>
                  <p className="points-label">Total Poin</p>
                </div>
              ))}
            </div>
          </div>

          {/* Input Poin Ronde */}
          <div className="round-input-section">
            <h2>Masukkan Poin Ronde {currentRound}</h2>
            <div className="round-inputs">
              {players.map((player, index) => (
                <div key={index} className="round-input-group">
                  <label>{player.name}</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={roundPoints[index] === 0 ? '' : roundPoints[index]}
                    onChange={(e) => handlePointChange(index, e.target.value)}
                    min="0"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="action-buttons">
            <button className="btn btn-success" onClick={endRound}>
              Selesai Ronde
            </button>
            <button className="btn btn-reset" onClick={resetPoints}>
              Reset Poin
            </button>
            <button className="btn btn-danger" onClick={resetGame}>
              Mulai Ulang
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
