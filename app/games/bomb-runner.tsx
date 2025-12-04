
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ARENA_SIZE = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT * 0.6) - 40;
const PLAYER_SIZE = 20;
const BOMB_SIZE = 15;
const BLOCK_SIZE = 30;
const GAME_DURATION = 120;

interface Player {
  id: string;
  x: number;
  y: number;
  blocksDestroyed: number;
  damageDealt: number;
  color: string;
  alive: boolean;
}

interface Bomb {
  id: string;
  x: number;
  y: number;
  ownerId: string;
  timeToExplode: number;
}

interface Block {
  x: number;
  y: number;
  destroyed: boolean;
}

interface GameState {
  players: Player[];
  bombs: Bomb[];
  blocks: Block[];
  timeLeft: number;
  gameStarted: boolean;
}

export default function BombRunnerGame() {
  const router = useRouter();
  const { user } = useAuth();
  const { sessionId } = useLocalSearchParams();
  const [players, setPlayers] = useState<Player[]>([]);
  const [bombs, setBombs] = useState<Bomb[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [myPlayerId, setMyPlayerId] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [playersReady, setPlayersReady] = useState<Set<string>>(new Set());
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    initializeGame();
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (timeLeft <= 0 && !gameOver && gameStarted) {
      endGame();
    }
  }, [timeLeft, gameStarted]);

  const initializeGame = async () => {
    try {
      const { data: participants, error } = await supabase
        .from('game_participants')
        .select('*')
        .eq('session_id', sessionId);

      if (error) throw error;

      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
      const initialPlayers: Player[] = participants.map((p, index) => ({
        id: p.user_id,
        x: (index + 1) * (ARENA_SIZE / (participants.length + 1)),
        y: ARENA_SIZE / 2,
        blocksDestroyed: 0,
        damageDealt: 0,
        color: colors[index % colors.length],
        alive: true,
      }));

      setPlayers(initialPlayers);
      setMyPlayerId(user?.id || '');

      // Initialize blocks (same seed for all players)
      const initialBlocks: Block[] = [];
      const gridSize = Math.floor(ARENA_SIZE / BLOCK_SIZE);
      
      // Use session ID as seed for consistent block generation
      const seed = parseInt(sessionId?.toString().slice(0, 8) || '0', 16);
      let random = seed;
      const seededRandom = () => {
        random = (random * 9301 + 49297) % 233280;
        return random / 233280;
      };

      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          if (seededRandom() > 0.3) {
            initialBlocks.push({
              x: i * BLOCK_SIZE,
              y: j * BLOCK_SIZE,
              destroyed: false,
            });
          }
        }
      }
      setBlocks(initialBlocks);

      // Set up real-time channel
      await setupRealtimeChannel(initialPlayers, initialBlocks);

      // Mark player as ready
      await broadcastPlayerReady();

    } catch (error) {
      console.error('Error initializing game:', error);
      Alert.alert('Error', 'No se pudo inicializar el juego');
    }
  };

  const setupRealtimeChannel = async (initialPlayers: Player[], initialBlocks: Block[]) => {
    if (channelRef.current?.state === 'subscribed') {
      console.log('Already subscribed to game channel');
      return;
    }

    const channel = supabase.channel(`game:${sessionId}:state`, {
      config: {
        broadcast: { self: false, ack: true },
        presence: { key: user?.id },
        private: false,
      },
    });

    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'player_ready' }, (payload: any) => {
        console.log('Player ready:', payload);
        setPlayersReady(prev => new Set([...prev, payload.playerId]));
      })
      .on('broadcast', { event: 'game_start' }, (payload: any) => {
        console.log('Game starting!');
        setGameStarted(true);
        startGameLoop();
      })
      .on('broadcast', { event: 'player_moved' }, (payload: any) => {
        if (payload.playerId !== myPlayerId) {
          setPlayers(prevPlayers =>
            prevPlayers.map(p =>
              p.id === payload.playerId
                ? { ...p, x: payload.x, y: payload.y }
                : p
            )
          );
        }
      })
      .on('broadcast', { event: 'bomb_placed' }, (payload: any) => {
        setBombs(prev => [...prev, payload.bomb]);
      })
      .on('broadcast', { event: 'bomb_exploded' }, (payload: any) => {
        handleBombExplosion(payload);
      })
      .on('broadcast', { event: 'player_died' }, (payload: any) => {
        setPlayers(prevPlayers =>
          prevPlayers.map(p =>
            p.id === payload.playerId ? { ...p, alive: false } : p
          )
        );
      })
      .subscribe(async (status, err) => {
        console.log('Game channel subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Connected to game channel');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Game channel error:', err);
        }
      });
  };

  const broadcastPlayerReady = async () => {
    if (!channelRef.current) return;

    await channelRef.current.send({
      type: 'broadcast',
      event: 'player_ready',
      payload: { playerId: myPlayerId },
    });
  };

  const startGameLoop = () => {
    if (gameLoopRef.current) return;

    gameLoopRef.current = setInterval(() => {
      updateGame();
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
  };

  // Check if all players are ready and start game
  useEffect(() => {
    const checkAllPlayersReady = async () => {
      if (playersReady.size === players.length && players.length > 0 && !gameStarted) {
        // Only the first player starts the game
        const sortedPlayers = [...players].sort((a, b) => a.id.localeCompare(b.id));
        if (sortedPlayers[0].id === myPlayerId) {
          console.log('All players ready! Starting game...');
          await channelRef.current?.send({
            type: 'broadcast',
            event: 'game_start',
            payload: { timestamp: Date.now() },
          });
          setGameStarted(true);
          startGameLoop();
        }
      }
    };

    checkAllPlayersReady();
  }, [playersReady, players, gameStarted, myPlayerId]);

  const updateGame = () => {
    setBombs(prevBombs => {
      const updated = prevBombs.map(b => ({
        ...b,
        timeToExplode: b.timeToExplode - 1,
      }));

      // Explode bombs
      const exploding = updated.filter(b => b.timeToExplode <= 0);
      exploding.forEach(bomb => {
        explodeBomb(bomb);
      });

      return updated.filter(b => b.timeToExplode > 0);
    });
  };

  const explodeBomb = async (bomb: Bomb) => {
    const explosionRange = 60;

    // Calculate affected players and blocks
    const affectedPlayers: string[] = [];
    const affectedBlocks: { x: number; y: number }[] = [];

    players.forEach(player => {
      if (!player.alive) return;

      const dx = player.x - bomb.x;
      const dy = player.y - bomb.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < explosionRange) {
        affectedPlayers.push(player.id);
      }
    });

    blocks.forEach(block => {
      if (block.destroyed) return;

      const dx = block.x - bomb.x;
      const dy = block.y - bomb.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < explosionRange) {
        affectedBlocks.push({ x: block.x, y: block.y });
      }
    });

    // Broadcast explosion
    await channelRef.current?.send({
      type: 'broadcast',
      event: 'bomb_exploded',
      payload: {
        bombId: bomb.id,
        ownerId: bomb.ownerId,
        affectedPlayers,
        affectedBlocks,
      },
    });

    // Apply local changes
    handleBombExplosion({
      ownerId: bomb.ownerId,
      affectedPlayers,
      affectedBlocks,
    });
  };

  const handleBombExplosion = (payload: any) => {
    const { ownerId, affectedPlayers, affectedBlocks } = payload;

    // Update players
    setPlayers(prevPlayers =>
      prevPlayers.map(player => {
        if (affectedPlayers.includes(player.id) && player.alive) {
          return { ...player, alive: false };
        }
        if (player.id === ownerId) {
          return {
            ...player,
            blocksDestroyed: player.blocksDestroyed + affectedBlocks.length,
            damageDealt: player.damageDealt + (affectedBlocks.length * 10),
          };
        }
        return player;
      })
    );

    // Update blocks
    setBlocks(prevBlocks =>
      prevBlocks.map(block => {
        const isAffected = affectedBlocks.some(
          ab => ab.x === block.x && ab.y === block.y
        );
        return isAffected ? { ...block, destroyed: true } : block;
      })
    );
  };

  const checkCollision = (newX: number, newY: number): boolean => {
    // Check arena boundaries
    if (
      newX < PLAYER_SIZE / 2 ||
      newX > ARENA_SIZE - PLAYER_SIZE / 2 ||
      newY < PLAYER_SIZE / 2 ||
      newY > ARENA_SIZE - PLAYER_SIZE / 2
    ) {
      return true;
    }

    // Check collision with blocks
    for (const block of blocks) {
      if (block.destroyed) continue;

      const playerLeft = newX - PLAYER_SIZE / 2;
      const playerRight = newX + PLAYER_SIZE / 2;
      const playerTop = newY - PLAYER_SIZE / 2;
      const playerBottom = newY + PLAYER_SIZE / 2;

      const blockLeft = block.x;
      const blockRight = block.x + BLOCK_SIZE;
      const blockTop = block.y;
      const blockBottom = block.y + BLOCK_SIZE;

      // Check if player overlaps with block
      if (
        playerRight > blockLeft &&
        playerLeft < blockRight &&
        playerBottom > blockTop &&
        playerTop < blockBottom
      ) {
        return true;
      }
    }

    return false;
  };

  const movePlayer = async (direction: 'up' | 'down' | 'left' | 'right') => {
    if (!gameStarted) return;

    const myPlayer = players.find(p => p.id === myPlayerId);
    if (!myPlayer || !myPlayer.alive) return;

    const speed = 10;
    let newX = myPlayer.x;
    let newY = myPlayer.y;

    switch (direction) {
      case 'up':
        newY = myPlayer.y - speed;
        break;
      case 'down':
        newY = myPlayer.y + speed;
        break;
      case 'left':
        newX = myPlayer.x - speed;
        break;
      case 'right':
        newX = myPlayer.x + speed;
        break;
    }

    // Check for collisions
    if (checkCollision(newX, newY)) {
      console.log('Collision detected! Cannot move.');
      return;
    }

    // Update local state
    setPlayers(prevPlayers =>
      prevPlayers.map(player =>
        player.id === myPlayerId ? { ...player, x: newX, y: newY } : player
      )
    );

    // Broadcast movement
    await channelRef.current?.send({
      type: 'broadcast',
      event: 'player_moved',
      payload: {
        playerId: myPlayerId,
        x: newX,
        y: newY,
      },
    });
  };

  const placeBomb = async () => {
    if (!gameStarted) return;

    const myPlayer = players.find(p => p.id === myPlayerId);
    if (!myPlayer || !myPlayer.alive) return;

    const newBomb: Bomb = {
      id: `${Date.now()}-${Math.random()}`,
      x: myPlayer.x,
      y: myPlayer.y,
      ownerId: myPlayerId,
      timeToExplode: 3,
    };

    // Update local state
    setBombs(prev => [...prev, newBomb]);

    // Broadcast bomb placement
    await channelRef.current?.send({
      type: 'broadcast',
      event: 'bomb_placed',
      payload: { bomb: newBomb },
    });
  };

  const endGame = async () => {
    setGameOver(true);
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);

    try {
      const alivePlayers = players.filter(p => p.alive);
      let winner: Player;

      if (alivePlayers.length === 1) {
        winner = alivePlayers[0];
      } else if (alivePlayers.length === 0) {
        winner = players.reduce((prev, current) => {
          if (current.blocksDestroyed !== prev.blocksDestroyed) {
            return current.blocksDestroyed > prev.blocksDestroyed ? current : prev;
          }
          return current.damageDealt > prev.damageDealt ? current : prev;
        });
      } else {
        winner = alivePlayers.reduce((prev, current) => {
          if (current.blocksDestroyed !== prev.blocksDestroyed) {
            return current.blocksDestroyed > prev.blocksDestroyed ? current : prev;
          }
          const centerX = ARENA_SIZE / 2;
          const centerY = ARENA_SIZE / 2;
          const prevDist = Math.sqrt(Math.pow(prev.x - centerX, 2) + Math.pow(prev.y - centerY, 2));
          const currDist = Math.sqrt(Math.pow(current.x - centerX, 2) + Math.pow(current.y - centerY, 2));
          return currDist < prevDist ? current : prev;
        });
      }

      await supabase
        .from('game_sessions')
        .update({
          status: 'completed',
          winner_user_id: winner.id,
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      for (const player of players) {
        const centerX = ARENA_SIZE / 2;
        const centerY = ARENA_SIZE / 2;
        const distanceFromCenter = Math.sqrt(
          Math.pow(player.x - centerX, 2) + Math.pow(player.y - centerY, 2)
        );

        const rank = players
          .sort((a, b) => {
            if (a.alive !== b.alive) return a.alive ? -1 : 1;
            if (b.blocksDestroyed !== a.blocksDestroyed) return b.blocksDestroyed - a.blocksDestroyed;
            const aDist = Math.sqrt(Math.pow(a.x - centerX, 2) + Math.pow(a.y - centerY, 2));
            const bDist = Math.sqrt(Math.pow(b.x - centerX, 2) + Math.pow(b.y - centerY, 2));
            return aDist - bDist;
          })
          .findIndex(p => p.id === player.id) + 1;

        await supabase
          .from('game_participants')
          .update({
            blocks_destroyed: player.blocksDestroyed,
            distance_from_center: distanceFromCenter,
            rank: rank
          })
          .eq('session_id', sessionId)
          .eq('user_id', player.id);
      }

      const { data: session } = await supabase
        .from('game_sessions')
        .select('prize_amount')
        .eq('id', sessionId)
        .single();

      if (session) {
        await supabase.rpc('add_mxi_from_challenges', {
          p_user_id: winner.id,
          p_amount: session.prize_amount
        });
      }

      Alert.alert(
        'Juego Terminado',
        winner.id === myPlayerId
          ? `¡Ganaste! ${session?.prize_amount.toFixed(2)} MXI`
          : 'Mejor suerte la próxima vez',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)/tournaments') }]
      );

    } catch (error) {
      console.error('Error ending game:', error);
    }
  };

  const myPlayer = players.find(p => p.id === myPlayerId);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.statsContainer}>
          <Text style={styles.statText}>Tiempo: {timeLeft}s</Text>
          {myPlayer && (
            <>
              <Text style={styles.statText}>Bloques: {myPlayer.blocksDestroyed}</Text>
              <Text style={styles.statText}>Vivo: {myPlayer.alive ? 'Sí' : 'No'}</Text>
            </>
          )}
        </View>
        {!gameStarted && (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingText}>
              Esperando jugadores... ({playersReady.size}/{players.length})
            </Text>
          </View>
        )}
      </View>

      <View style={styles.arenaContainer}>
        <View style={[styles.arena, { width: ARENA_SIZE, height: ARENA_SIZE }]}>
          {blocks.map((block, index) => (
            <React.Fragment key={`block-${index}`}>
              {!block.destroyed && (
                <View
                  style={[
                    styles.block,
                    {
                      left: block.x,
                      top: block.y,
                    }
                  ]}
                />
              )}
            </React.Fragment>
          ))}

          {bombs.map(bomb => (
            <View
              key={bomb.id}
              style={[
                styles.bomb,
                {
                  left: bomb.x - BOMB_SIZE / 2,
                  top: bomb.y - BOMB_SIZE / 2,
                }
              ]}
            >
              <Text style={styles.bombTimer}>{bomb.timeToExplode}</Text>
            </View>
          ))}

          {players.map(player => (
            <React.Fragment key={player.id}>
              {player.alive && (
                <View
                  style={[
                    styles.player,
                    {
                      left: player.x - PLAYER_SIZE / 2,
                      top: player.y - PLAYER_SIZE / 2,
                      backgroundColor: player.color,
                    }
                  ]}
                >
                  {player.id === myPlayerId && (
                    <View style={styles.playerIndicator} />
                  )}
                </View>
              )}
            </React.Fragment>
          ))}
        </View>
      </View>

      {myPlayer && myPlayer.alive && gameStarted && !gameOver && (
        <View style={styles.controls}>
          <View style={styles.dpadContainer}>
            <TouchableOpacity
              style={[styles.dpadButton, styles.dpadUp]}
              onPress={() => movePlayer('up')}
            >
              <IconSymbol
                ios_icon_name="chevron.up"
                android_material_icon_name="keyboard_arrow_up"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
            <View style={styles.dpadMiddle}>
              <TouchableOpacity
                style={[styles.dpadButton, styles.dpadLeft]}
                onPress={() => movePlayer('left')}
              >
                <IconSymbol
                  ios_icon_name="chevron.left"
                  android_material_icon_name="keyboard_arrow_left"
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dpadButton, styles.dpadRight]}
                onPress={() => movePlayer('right')}
              >
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="keyboard_arrow_right"
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.dpadButton, styles.dpadDown]}
              onPress={() => movePlayer('down')}
            >
              <IconSymbol
                ios_icon_name="chevron.down"
                android_material_icon_name="keyboard_arrow_down"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.bombButton} onPress={placeBomb}>
            <IconSymbol
              ios_icon_name="flame.fill"
              android_material_icon_name="whatshot"
              size={32}
              color={colors.background}
            />
            <Text style={styles.bombButtonText}>BOMBA</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  waitingContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  waitingText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  arenaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  arena: {
    backgroundColor: '#1a1a2e',
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: 8,
    position: 'relative',
  },
  player: {
    position: 'absolute',
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    borderRadius: PLAYER_SIZE / 2,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  bomb: {
    position: 'absolute',
    width: BOMB_SIZE,
    height: BOMB_SIZE,
    borderRadius: BOMB_SIZE / 2,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bombTimer: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  block: {
    position: 'absolute',
    width: BLOCK_SIZE,
    height: BLOCK_SIZE,
    backgroundColor: '#8B4513',
    borderWidth: 1,
    borderColor: '#654321',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  dpadContainer: {
    width: 140,
    height: 140,
  },
  dpadButton: {
    width: 50,
    height: 50,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dpadUp: {
    alignSelf: 'center',
    marginBottom: 5,
  },
  dpadMiddle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  dpadLeft: {},
  dpadRight: {},
  dpadDown: {
    alignSelf: 'center',
  },
  bombButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  bombButtonText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.background,
  },
});
