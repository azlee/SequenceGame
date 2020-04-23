var express = require('express');
var app = express();
app.use(express.static('./public'));
var http = require('http').Server(app);
var port = 8080;

var io = require('socket.io')(http);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/default.html');
});

/****************************************************************************
* 
* Utility functions
* 
****************************************************************************/

/**
* Randomly shuffle an array
* https://stackoverflow.com/a/2450976/1293256
* @param  {Array} array The array to shuffle
* @return {String}      The first item in the shuffled array
*/
function shuffle(array) {

  var currentIndex = array.length;
  var temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
  }
  return array;
};

/**
 * Generate a random room code of 4 uppercase letters
 */
function generateRoomCode() {
  var len = 4;
  var arr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var code = '';
  for (var i = len; i > 0; i--) {
      code += arr[Math.floor(Math.random() * arr.length)];
  }
  if (GAME_LOBBIES.get(code)) {
      return generateRoomCode();
  }
  return code;
}

/**
 * Get the number of cards per player for the number of players
 * @param {num} numPlayers
 * @return {num} number of cards
 */
function getNumberOfCardsForPlayers(numPlayers) {
  const cardCountMap = {
    2 : 7,
    3 : 6,
    4 : 6,
    6 : 5,
    8 : 4,
    9 : 4,
    10 : 3,
    12 : 3,
  };
  if (numPlayers in cardCountMap) {
    return cardCountMap[numPlayers]
  } else {
    throw WRONG_NUMBER_PLAYERS_ERROR.replace("%s", numPlayers);
  }
}

/**
 * Get the number of sequences needed for a win
 * @param {str} numPlayers 
 * @param {str} numTeams 
 */
function getNumberOfSequencesForWin(numPlayers, numTeams) {
  if (numPlayers === 2 || numTeams === 2) {
    return 2;
  } else if (numPlayers === 3 || numTeams === 3) {
    return 1;
  }
}

/****************************************************************************
* 
* Constants
* 
****************************************************************************/

/* Map of all the game lobbies - key is room code and value is the lobby itself */
var GAME_LOBBIES = new Map();

var BOARD_WIDTH = 10;

var TeamColor = {
  RED: "RED",
  GREEN: "GREEN",
  BLUE: "BLUE"
};

var SequenceType = {
  HORIZONTAL: "HORIZONTAL",
  VERTICAL: "VERTICAL",
  TOPLEFT_RIGHTDOWN: "TOPLEFT RIGHTDOWN",
  BOTTOMLEFT_RIGHTTOP: "BOTTOMLEFT RIGHTTOP"
}

var SEQUENCE_LENGTH = 5;

var CARDS_IN_DECK = ['JC', 'JC', 'JD', 'JD', 'JH', 'JH', 'JS', 'JS', '2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', '6S', '5C', '4C', '3C', '2C', 'AH', 'KH', 'QH', '10H', '10S', '7C', 'AS', '2D', '3D', '4D', '5D', '6D', '7D', '9H', 'QS', '8C', 'KS', '6C', '5C', '4C', '3C', '2C', '8D', '8H', 'KS', '9C', 'QS', '7C', '6H', '5H', '4H', 'AH', '9D', '7H', 'AS', '10C', '10S', '8C', '7H', '2H', '3H', 'KH', '10D', '6H', '2D', 'QC', '9S', '9C', '8H', '9H', '10H', 'QH', 'QD', '5H', '2D', 'KC', '8S', '10C', 'QC', 'KC', 'AC', 'AD', 'KD', '4H', '4D', 'AC', '7S', '6S', '5S', '4S', '3S', '2S', '2H', '3H', '5D', 'AD', 'KD', 'QD', '10D', '9D', '8D', '7D', '6D'];
// var CARDS_BOARD_ARRAY = [['W', '2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', 'W'], 
//                          ['6S', '5C', '4C', '3C', '2C', 'AH', 'KH', 'QH', '10H', '10S'], 
//                          ['7C', 'AS', '2D', '3D', '4D', '5D', '6D', '7D', '9H', 'QS'], 
//                          ['8C', 'KS', '6C', '5C', '4C', '3C', '2C', '8D', '8H', 'KS'], 
//                          ['9C', 'QS', '7C', '6H', '5H', '4H', 'AH', '9D', '7H', 'AS'], 
//                          ['10C', '10S', '8C', '7H', '2H', '3H', 'KH', '10D', '6H', '2D'], 
//                          ['QC', '9S', '9C', '8H', '9H', '10H', 'QH', 'QD', '5H', '3D'], 
//                          ['KC', '8S', '10C', 'QC', 'KC', 'AC', 'AD', 'KD', '4H', '4D'], 
//                          ['AC', '7S', '6S', '5S', '4S', '3S', '2S', '2H', '3H', '5D'], 
//                          ['W', 'AD', 'KD', 'QD', '10D', '9D', '8D', '7D', '6D', 'W']];
var CARDS_BOARD_ARRAY = [['W', '2S1', '3S1', '4S1', '5S1', '6S1', '7S1', '8S1', '9S1', 'W'], 
                         ['6S1', '5C1', '4C1', '3C1', '2C1', 'AH1', 'KH1', 'QH1', '10H1', '10S1'], 
                         ['7C1', 'AS1', '2D1', '3D1', '4D1', '5D1', '6D1', '7D1', '9H1', 'QS1'], 
                         ['8C1', 'KS1', '6C2', '5C2', '4C2', '3C2', '2C2', '8D1', '8H1', 'KS2'], 
                         ['9C1', 'QS2', '7C2', '6H1', '5H1', '4H1', 'AH2', '9D1', '7H1', 'AS2'], 
                         ['10C1', '10S2', '8C2', '7H2', '2H1', '3H1', 'KH2', '10D1', '6H2', '2D2'], 
                         ['QC1', '9S2', '9C2', '8H2', '9H2', '10H2', 'QH2', 'QD1', '5H2', '3D2'], 
                         ['KC1', '8S2', '10C2', 'QC2', 'KC2', 'AC1', 'AD1', 'KD1', '4H2', '4D2'], 
                         ['AC2', '7S2', '6S2', '5S2', '4S2', '3S2', '2S2', '2H2', '3H2', '5D2'], 
                         ['W', 'AD2', 'KD2', 'QD2', '10D2', '9D2', '8D2', '7D2', '6D2', 'W']];
var WRONG_NUMBER_PLAYERS_ERROR = "%s players is not supported.";
var NUM_CARDS_PER_PLAYER = 7;

const MoveType = {
  PLACE_TOKEN: "PLACE TOKEN",
  SHOW_CARDS_ON_BOARD: "SHOW CARDS ON BOARD"
}

// Map of the cards and their position in GameState.board
var CARD_POSITIONS = {
  '2S1': {x: 1, y: 0},
  '3S1': {x: 2, y: 0},
  '4S1': {x: 3, y: 0},
  '5S1': {x: 4, y: 0},
  '6S1': {x: 5, y: 0},
  '7S1': {x: 6, y: 0},
  '8S1': {x: 7, y: 0},
  '9S1': {x: 8, y: 0},

  '6C1': {x: 0, y: 1},
  '5C1': {x: 1, y: 1},
  '4C1': {x: 2, y: 1},
  '3C1': {x: 3, y: 1},
  '2C1': {x: 4, y: 1},
  'AH1': {x: 5, y: 1},
  'KH1': {x: 6, y: 1},
  'QH1': {x: 7, y: 1},
  '10H1': {x: 8, y: 1},
  '10S1': {x: 9, y: 1},

  '7C1': {x: 0, y: 2},
  'AS1': {x: 1, y: 2},
  '2D1': {x: 2, y: 2},
  '3D1': {x: 3, y: 2},
  '4D1': {x: 4, y: 2},
  '5D1': {x: 5, y: 2},
  '6D1': {x: 6, y: 2},
  '7D1': {x: 7, y: 2},
  '9H1': {x: 8, y: 2},
  'QS1': {x: 9, y: 2},

  '8C1': {x: 0, y: 3},
  'KS1': {x: 1, y: 3},
  '6C2': {x: 2, y: 3},
  '5C2': {x: 3, y: 3},
  '4C2': {x: 4, y: 3},
  '3C2': {x: 5, y: 3},
  '2C2': {x: 6, y: 3},
  '8D1': {x: 7, y: 3},
  '8H1': {x: 8, y: 3},
  'KS2': {x: 9, y: 3},

  '9C1': {x: 0, y: 4},
  'QS2': {x: 1, y: 4},
  '7C2': {x: 2, y: 4},
  '6H1': {x: 3, y: 4},
  '5H1': {x: 4, y: 4},
  '4H1': {x: 5, y: 4},
  'AH2': {x: 6, y: 4},
  '9D1': {x: 7, y: 4},
  '7H1': {x: 8, y: 4},
  'AS2': {x: 9, y: 4},

  '10C1': {x: 0, y: 5},
  '10S2': {x: 1, y: 5},
  '8C2': {x: 2, y: 5},
  '7H2': {x: 3, y: 5},
  '2H1': {x: 4, y: 5},
  '3H1': {x: 5, y: 5},
  'KH2': {x: 6, y: 5},
  '10D1': {x: 7, y: 5},
  '6H2': {x: 8, y: 5},
  '2D2': {x: 9, y: 5},

  'QC1': {x: 0, y: 6},
  '9S2': {x: 1, y: 6},
  '9C2': {x: 2, y: 6},
  '8H2': {x: 3, y: 6},
  '9H2': {x: 4, y: 6},
  '10H2': {x: 5, y: 6},
  'QH2': {x: 6, y: 6},
  'QD1': {x: 7, y: 6},
  '5H2': {x: 8, y: 6},
  '3D2': {x: 9, y: 6},

  'KC1': {x: 0, y: 7},
  '8S2': {x: 1, y: 7},
  '10C2': {x: 2, y: 7},
  'QC2': {x: 3, y: 7},
  'KC2': {x: 4, y: 7},
  'AC1': {x: 5, y: 7},
  'AD1': {x: 6, y: 7},
  'KD1': {x: 7, y: 7},
  '4H2': {x: 8, y: 7},
  '4D2': {x: 9, y: 7},

  'AC2': {x: 0, y: 8},
  '7S2': {x: 1, y: 8},
  '6S2': {x: 2, y: 8},
  '5S2': {x: 3, y: 8},
  '4S2': {x: 4, y: 8},
  '3S2': {x: 5, y: 8},
  '2S2': {x: 6, y: 8},
  '2H2': {x: 7, y: 8},
  '3H2': {x: 8, y: 8},
  '5D2': {x: 9, y: 8},

  'AD2': {x: 1, y: 9},
  'KD2': {x: 2, y: 9},
  'QD2': {x: 3, y: 9},
  '10D2': {x: 4, y: 9},
  '9D2': {x: 5, y: 9},
  '8D2': {x: 6, y: 9},
  '7D2': {x: 7, y: 9},
  '6D2': {x: 8, y: 9}
}

/****************************************************************************
* 
* Game state accessors & creators
* 
****************************************************************************/

/**
 * Initialize card board
 */
function initializeCardBoard() {
  var cardBoard = [];
  for (var i = 0; i < BOARD_WIDTH; i++) {
    var row = [];
    for (var j = 0; j < BOARD_WIDTH; j++) {
      row.push({ 
        card: CARDS_BOARD_ARRAY[j][i],
        token: null,
        partOfSequence: false,
      });
    }
    cardBoard.push(row);
  }
  return cardBoard;
}

/**
 * Initialize game state
 * @param {str} gameRoomId 
 */
function initializeGameState(gameRoomId) {
  var GameState = {
    cardDeck: shuffle(CARDS_IN_DECK),
    discardCards: [],
    currentPlayer: 0,
    gameId: gameRoomId,
    board: initializeCardBoard(),
    numCardsPerPerson: NUM_CARDS_PER_PLAYER,
    players: new Map(),
    teams: new Map(), // key will be RED, GREEN or BLUE 
    // value will contain sequences (array of positions of each sequence, players array)
  }
  return GameState;
}

/**
 * Shuffle discard cards into deck
 * @param {*} gameRoom 
 */
function reuseDiscardCards(gameRoom) {
  var GameState = GAME_LOBBIES.get(gameRoom);
  GameState.cardDeck = shuffle(GameState.discardCards);
  GameState.discardCards = [];
}

/**
 * Get a card from top of cards deck
 * @param {str} gameRoom 
 */
function getCard(gameRoom) {
  var card = GAME_LOBBIES.get(gameRoom).cardDeck.pop();
  return card;
}

/**
 * Create a new player and add to the game room
 * @param {str} gameRoom 
 * @param {str}} id 
 * @param {str} name 
 * @param {str} numCards 
 * @param {str} team 
 */
function createPlayer(gameRoom, id, name, numCards, team) {
  var player = {
    id: id,
    name: name,
    team: team,
    cardsInHand: []
  };
  for (var i = 0; i < numCards; i++) {
    player.cardsInHand.push(getCard(gameRoom));
  }
  GAME_LOBBIES.get(gameRoom).players.set(id, player);
  return id;
}

/**
 * Initialize a new game with one player
 */
function initializeNewGame(playerName) {
  var gameRoomId = generateRoomCode();
  var gameState = initializeGameState(gameRoomId);
  GAME_LOBBIES.set(gameRoomId, gameState);
  var playerId = createPlayer(gameRoomId, 0, playerName, NUM_CARDS_PER_PLAYER, TeamColor.GREEN);
  // add new team
  GAME_LOBBIES.get(gameRoomId).teams.set(TeamColor.GREEN, {
    sequences: [],
    players: [playerId]
  });
  return gameRoomId;
}

/**
 * Check if there's a sequence(s) involving the token.
 * If so, return the sequence(s).
 * return array of sequences where a sequence looks like
 * {
 *  type: SequenceType
 *  positions: [
 *    { x: 0, y, 0},
 *    { x: 1, y, 0},
 *    { x: 2, y, 0},
 *    { x: 3, y, 0},
 *    { x: 4, y, 0},
 *  ]
 * }
 */
function getSequenceWithToken(gameRoom, color, tokenX, tokenY) {
  console.log(tokenX + ', ' + tokenY + '\n');
  var GameState = GAME_LOBBIES.get(gameRoom);
  console.log('board is ')
  console.log(GameState.board)
  var x1 = tokenX - 9;
  var x2 = tokenX + 9;
  var y1 = tokenY - 9;
  var y2 = tokenY + 9;
  var sequences = [];
  var sequenceSoFar = [];
   // check top left to down right diagonal
  for (var i = x1, j = y1; i <= x2, j <= y2; i++, j++) {
    if (i > 9 || i < 0 || j < 0 || j > 9) {
      continue;
    }
    var card = GameState.board[i][j];
    var cardColor = card.token;
    console.log('card is ')
    console.log(card)
    if (cardColor === color || card.card === 'W') {
      sequenceSoFar.push({ x: i, y: j, card: card.card });
      if (sequenceSoFar.length === SEQUENCE_LENGTH) {
        sequences.push({ 
          type: SequenceType.TOPLEFT_RIGHTDOWN,
          positions: sequenceSoFar
        });
        sequenceSoFar = [];
      }
    } else {
      sequenceSoFar = [];
    }
  }
  // check bottom left to top right diagonal
  sequenceSoFar = [];
  for (var i = x1, j = y2; i <= x2, j >= y1; i++, j--) {
    if (i > 9 || i < 0 || j < 0 || j > 9) {
      continue;
    }
    var card = GameState.board[i][j];
    var cardColor = card.token;
    if (cardColor === color || card.card === 'W') {
      sequenceSoFar.push({ x: i, y: j, card: card.card });
      if (sequenceSoFar.length === SEQUENCE_LENGTH) {
        sequences.push({ 
          type: SequenceType.BOTTOMLEFT_RIGHTTOP,
          positions: sequenceSoFar
        });
        sequenceSoFar = [];
      }
    } else {
      sequenceSoFar = [];
    }
  }
  // check horizontal sequence left to right
  sequenceSoFar = [];
  for (var i = x1, j = tokenY; i <= x2; i++) {
    if (i > 9 || i < 0 || j < 0 || j > 9) {
      continue;
    }
    var card = GameState.board[i][j];
    var cardColor = card.token;
    if (cardColor === color || card.card === 'W') {
      sequenceSoFar.push({ x: i, y: j, card: card.card });
      if (sequenceSoFar.length === SEQUENCE_LENGTH) {
        sequences.push({ 
          type: SequenceType.HORIZONTAL,
          positions: sequenceSoFar
        });
        sequenceSoFar = [];
      }
    } else {
      sequenceSoFar = [];
    }
  }
  // check vertical sequence top down
  sequenceSoFar = [];
  for (var i = tokenX, j = y1; j <= y2; j++) {
    if (i > 9 || i < 0 || j < 0 || j > 9) {
      continue;
    }
    var card = GameState.board[i][j];
    var cardColor = card.token;
    if (cardColor === color || card.card === 'W') {
      sequenceSoFar.push({ x: i, y: j, card: card.card });
      if (sequenceSoFar.length === SEQUENCE_LENGTH) {
        sequences.push({ 
          type: SequenceType.VERTICAL,
          positions: sequenceSoFar
        });
        sequenceSoFar = [];
      }
    } else {
      sequenceSoFar = [];
    }
  }
  console.log('end get sequence with token');
  return sequences;
}

/**
 * Check if two sequences are equal
 * @param {*} sequence1 
 * @param {*} sequence2 
 */
function isSequenceEqual(sequence1, sequence2) {
  for (var i = 0; i < SEQUENCE_LENGTH; i++) {
    var position1 = sequence1[i];
    var position2 = sequence2[i];
    if (position1.x !== position2.x || position1.y !== position2.y) {
      return false;
    }
  }
  return true;
}

function checkOverlap(sequence1, sequence2) {
  for (var i = 0; i < SEQUENCE_LENGTH; i++) {
    for (var j = 0; j < SEQUENCE_LENGTH; j++) {
      var cell1 = sequence1.positions[i];
      var cell2 = sequence2.positions[j];
      if (cell1.x === cell2.x && cell1.y === cell2.y) {
        return true;
      }
    }
  }
  return false;
}

function addSequenceToTeam(gameRoom, team, sequence) {
  var GameState = GAME_LOBBIES.get(gameRoom);
  var teamSequences = GameState.teams.get(team).sequences;
  for (var teamSequence of teamSequences) {
    if (!isSequenceEqual(teamSequence.positions, sequence.positions)) {
      // check if there's any overlap before adding sequence
      if (teamSequence.type === sequence.type) {
        if (checkOverlap(teamSequence, sequence)) {
          continue;
        }
      }
      console.log('pushing sequence')
      console.log(sequence);
      teamSequences.push(sequence);
    }
  }
  if (teamSequences.length === 0) {
    teamSequences.push(sequence);
  }
}

/**
 * Place token on card and check for sequences.
 * Add sequence to team.
 * @param {*} gameRoom 
 * @param {*} playerId 
 * @param {*} card 
 */
function placeTokenOnCard(gameRoom, playerId, card) {
  var GameState = GAME_LOBBIES.get(gameRoom);
  // get position of card & update card to have player's token on it
  var position = CARD_POSITIONS[card];
  var colorToken = GameState.players.get(playerId).team;
  GameState.board[position.x][position.y].token = colorToken;
  var sequences = getSequenceWithToken(gameRoom, colorToken, position.x, position.y);
  if (sequences.length > 0) {
    // set the sequence to part of a sequence
    for (var sequence of sequences) {
      console.log('sequence is ')
      console.log(sequence);
      // add sequence to team
      addSequenceToTeam(gameRoom, colorToken, sequence);
    }
  }
}

/**
 * Apply move by updating game state and send socket notification that
 * game state has been updated
 * @param {*} move 
 * @param {*} gameRoom 
 * @param {*} playerId 
 * @param {*} card 
 */
function applyMove(move, gameRoom, playerId, card) {
  console.log('apply move ' + move + ' card ' + card);
  if (move === MoveType.PLACE_TOKEN) {
    placeTokenOnCard(gameRoom, playerId, card);
  }
  sendStateUpdate(gameRoom);
}


/****************************************************************************
* 
* Sockets
* 
****************************************************************************/

io.on('connection', function(socket) {
  console.log('\n');
  console.log('new connection ' + socket.id);

  socket.on('createGame', function(msg) {
    console.log('create new game with msg');
    console.log(msg);
    var gameRoomId = initializeNewGame(msg.name);
    io.to(socket.id).emit('createGameSuccess', gameRoomId);
    sendStateUpdate(gameRoomId)
  });
  socket.on('message', function(msg) {
    console.log('msg us ')
    console.log(msg)
  });

  socket.on('move', function(params) {
    applyMove(params.move, params.gameRoom, params.playerId, params.card);
  });
})

function sendStateUpdate(gameRoomId) {
  var gameRoom = GAME_LOBBIES.get(gameRoomId);
  if (gameRoom) {
    // transform map to string  to send
    var players = new Map(gameRoom.players);
    var teams = new Map(gameRoom.teams);
    gameRoom.players = JSON.stringify(Array.from(players));
    gameRoom.teams = JSON.stringify(Array.from(teams));
    io.sockets.emit(gameRoomId, { state: gameRoom });
    gameRoom.players = players;
    gameRoom.teams = teams;
  }
}

http.listen(port, function() {
  console.log('listening on *:' + port);
  console.log('cards is ' + CARDS_IN_DECK.length);
  var cardsCount = 0;
  for (var arr of CARDS_BOARD_ARRAY) {
    cardsCount += arr.length;
  }
  console.log(cardsCount);
});