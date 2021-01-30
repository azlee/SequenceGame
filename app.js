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
 * @param {str} numTeams 
 */
function getNumberOfSequencesForWin(numTeams) {
  if (numTeams === 2) {
    return 2;
  } else if (numTeams === 3) {
    return 1;
  }
}

/**
 * Get the number of occurences of element in arr
 * @param {*} element 
 * @param {*}} arr 
 */
function numElementInArr(element, arr) {
  var occurences = 0;
  for (var elem of arr) {
      if (element === elem) {
          occurences++;
      }
  }
  return occurences;
}

/****************************************************************************
* 
* Constants
* 
****************************************************************************/

/* Map of all the game lobbies - key is room code and value is the lobby itself */
var GAME_LOBBIES = new Map();

/* Map of all the connected sockets */
var SOCKETS_MAP = new Map();

const BOARD_WIDTH = 10;

const TeamColor = {
  RED: "RED",
  GREEN: "GREEN",
  BLUE: "BLUE"
};

const COLORS = ["GREEN", "BLUE", "RED"]

const SequenceType = {
  HORIZONTAL: "HORIZONTAL",
  VERTICAL: "VERTICAL",
  TOPLEFT_RIGHTDOWN: "TOPLEFT RIGHTDOWN",
  BOTTOMLEFT_RIGHTTOP: "BOTTOMLEFT RIGHTTOP"
}

const SEQUENCE_LENGTH = 5;

const CARDS_IN_DECK = [
'JC', 'JC', 'JD', 'JD', 'JH', 'JH', 
'JS', 'JS', '2S', '3S', '4S', '5S', 
'6S', '7S', '8S', '9S', '6C', '5C', 
'4C', '3C', '2C', 'AH', 'KH', 'QH', 
'10H', '10S', '7C', 'AS', '2D', '3D', 
'4D', '5D', '6D', '7D', '9H', 'QS', 
'8C', 'KS', '6C', '5C', '4C', '3C', 
'2C', '8D', '8H', 'KS', '9C', 'QS', 
'7C', '6H', '5H', '4H', 'AH', '9D', 
'7H', 'AS', '10C', '10S', '8C', '7H', 
'2H', '3H', 'KH', '10D', '6H', '2D', 
'QC', '9S', '9C', '8H', '9H', '10H', 
'QH', 'QD', '5H', '3D', 'KC', '8S', 
'10C', 'QC', 'KC', 'AC', 'AD', 'KD', 
'4H', '4D', 'AC', '7S', '6S', '5S', 
'4S', '3S', '2S', '2H', '3H', '5D', 
'AD', 'KD', 'QD', '10D', '9D', '8D', 
'7D', '6D'];
const CARDS_BOARD_ARRAY = [['W', '2S1', '3S1', '4S1', '5S1', '6S1', '7S1', '8S1', '9S1', 'W'], 
                         ['6C1', '5C1', '4C1', '3C1', '2C1', 'AH1', 'KH1', 'QH1', '10H1', '10S1'], 
                         ['7C1', 'AS1', '2D1', '3D1', '4D1', '5D1', '6D1', '7D1', '9H1', 'QS1'], 
                         ['8C1', 'KS1', '6C2', '5C2', '4C2', '3C2', '2C2', '8D1', '8H1', 'KS2'], 
                         ['9C1', 'QS2', '7C2', '6H1', '5H1', '4H1', 'AH2', '9D1', '7H1', 'AS2'], 
                         ['10C1', '10S2', '8C2', '7H2', '2H1', '3H1', 'KH2', '10D1', '6H2', '2D2'], 
                         ['QC1', '9S2', '9C2', '8H2', '9H2', '10H2', 'QH2', 'QD1', '5H2', '3D2'], 
                         ['KC1', '8S2', '10C2', 'QC2', 'KC2', 'AC1', 'AD1', 'KD1', '4H2', '4D2'], 
                         ['AC2', '7S2', '6S2', '5S2', '4S2', '3S2', '2S2', '2H2', '3H2', '5D2'], 
                         ['W', 'AD2', 'KD2', 'QD2', '10D2', '9D2', '8D2', '7D2', '6D2', 'W']];
const WRONG_NUMBER_PLAYERS_ERROR = "%s players is not supported.";

const MoveType = {
  PLACE_TOKEN: "PLACE TOKEN",
  REMOVE_TOKEN: "REMOVE TOKEN",
  SHOW_CARDS_ON_BOARD: "SHOW CARDS ON BOARD"
}

// Map of the cards and their position in GameState.board
const CARD_POSITIONS = {
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

const INVALID_ROOM_CODE_ERROR = "Invalid room code";
const MAX_PLAYERS_ERROR = "Invalid room code";
const PLAYER_WITH_SAME_NAME_ERROR = "Player with name '%s' is already in game. Choose different name";

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
function initializeGameState(gameRoomId, numPlayers) {
  var numTeams = getNumberOfTeamsForPlayers(numPlayers);
  var numSequencesForWin = getNumberOfSequencesForWin(numTeams);
  var GameState = {
    cardDeck: shuffle(CARDS_IN_DECK.slice()),
    deadCards: [],
    discardCards: [],
    currentPlayer: 0,
    gameId: gameRoomId,
    board: initializeCardBoard(),
    numCardsPerPerson: getNumberOfCardsForPlayers(numPlayers),
    numPlayers: numPlayers,
    numTeams: numTeams,
    numSequences: 0,
    numSequencesForWin: numSequencesForWin,
    players: new Map(),
    teams: new Map(), // key will be RED, GREEN or BLUE 
    // value will contain sequences (array of positions of each sequence, players array)
  }
  return GameState;
}

function getNumberOfTeamsForPlayers(numPlayers) {
  if (numPlayers % 2 === 0) {
    return 2;
  } else if (numPlayers % 3 === 0) {
    return 3;
  }
  throw "%s Players not supported.".replace("%s", numPlayers);
}

function assignTeamColor(gameRoom, playerId) {
  var numPlayers = GAME_LOBBIES.get(gameRoom).numPlayers;
  var numTeams = getNumberOfTeamsForPlayers(numPlayers);
  var teamColorNum = playerId % numTeams;
  var teamColor = COLORS[teamColorNum];
  console.log('team color is ' + teamColor);
  return teamColor;
}

function isDeadCard(gameRoom, card) {
  var GameState = GAME_LOBBIES.get(gameRoom);
  for (var deadCard of GameState.deadCards) {
    if (deadCard === card) {
      return true;
    }
  }
  return false;
}

/**
 * Get a card from top of cards deck
 * @param {str} gameRoom 
 */
function getCard(gameRoom) {
  var card = GAME_LOBBIES.get(gameRoom).cardDeck.pop();
  console.log('popped off card ' + card);
  if (isDeadCard(gameRoom, card)) {
    console.log('recursing since card ' + card + ' is a dead card');
    return getCard(gameRoom);
  }
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
function createPlayer(gameRoom, id, name) {
  var team = assignTeamColor(gameRoom, id);
  if (!GAME_LOBBIES.get(gameRoom).teams.get(team)) {
    GAME_LOBBIES.get(gameRoom).teams.set(team, {
      sequences: [],
      players: [id],
    });
  } else {
    GAME_LOBBIES.get(gameRoom).teams.get(team).players.push(id);
  }
  var numCardsPerPerson = getNumberOfCardsForPlayers(GAME_LOBBIES.get(gameRoom).numPlayers);
  var player = {
    id: id,
    name: name,
    team: team,
    cardsInHand: []
  };
  for (var i = 0; i < numCardsPerPerson; i++) {
    player.cardsInHand.push(getCard(gameRoom));
  }
  GAME_LOBBIES.get(gameRoom).players.set(id, player);
  console.log('Created player ' + player.name + ' on team ' + player.team + ' with cards: ' + player.cardsInHand);
  return player;
}

/**
 * Initialize a new game with one player
 */
function initializeNewGame(playerName, numPlayers, socketId) {
  var gameRoomId = generateRoomCode();
  var gameState = initializeGameState(gameRoomId, numPlayers);
  GAME_LOBBIES.set(gameRoomId, gameState);
  var player = createPlayer(gameRoomId, 0, playerName);
  // add new team
  GAME_LOBBIES.get(gameRoomId).teams.set(TeamColor.GREEN, {
    sequences: [],
    players: [player.id]
  });
  // add socket id, player to game lobby
  addPlayerSocketIdToGameLobby(socketId, gameRoomId, player.id);
  GAME_LOBBIES.get(gameRoomId).playerNames = [];
  GAME_LOBBIES.get(gameRoomId).playerNames.push(playerName);
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

/**
 * Check for overlap between two sequences
 * @param {*} sequence1 
 * @param {*} sequence2 
 */
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

/**
 * Add sequence to the team's sequences
 * @param {*} gameRoom 
 * @param {*} team 
 * @param {*} sequence 
 */
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
      GameState.numSequences++;
      teamSequences.push(sequence);
      for (var pos of sequence.positions) {
        GameState.board[pos.x][pos.y].partOfSequence = true;
      }
    }
  }
  if (teamSequences.length === 0) {
    teamSequences.push(sequence);
    for (var pos of sequence.positions) {
      GameState.board[pos.x][pos.y].partOfSequence = true;
    }
    GameState.numSequences++;
  }
}

/**
 * Get position of card in the player's hand
 * If they don't have the card but a two eyed jack then return that
 * Else return -1
 * @param {*} gameRoom 
 * @param {*} playerId 
 * @param {*} cardId 
 */
function getPositionOfCardInHand(gameRoom, playerId, cardId) {
  var tokenCard = cardId.substring(0, cardId.length - 1);
  // check player's cards to see if they can play the token on the card id
  var cardsInHand = GAME_LOBBIES.get(gameRoom).players.get(playerId).cardsInHand;
  var wildCard = -1;
  for (var i = 0; i < cardsInHand.length; i++) {
    var card = cardsInHand[i];
    if (card === tokenCard) {
      return i;
    } else if (card === 'JD' || card === 'JC') {
      wildCard = i;
    }
  }
  return wildCard;
}

/**
 * Check for dead cards in the board. If any player has dead cards then replace
 * @param {*} gameRoom 
 * @param {*} card 
 */
function checkDeadCards(gameRoom, card) {
  var GameState = GAME_LOBBIES.get(gameRoom);
  // when a new token is placed, check if the card is now 'dead'
  // and if so check if any players have that 'dead' card and if so, replace it
  var cardClass = card.substring(0, card.length - 1);
  var cardPosition1 = CARD_POSITIONS[cardClass + '1'];
  var cardPosition2 = CARD_POSITIONS[cardClass + '2'];
  if (GameState.board[cardPosition1.x][cardPosition1.y].token != null && GameState.board[cardPosition2.x][cardPosition2.y].token != null) {
    // card is dead
    GameState.deadCards.push(cardClass);
    // check if any players have the dead card if so remove
    for (var [id, player] of GameState.players) {
      for (var i = 0; i < player.cardsInHand.length; i++) {
        var card = player.cardsInHand[i];
        if (card === cardClass) {
          player.cardsInHand[i] = getCard(gameRoom);;
        }
      }
    }
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
  // check that the player has the card in their hand before placing token
  var positionCard = getPositionOfCardInHand(gameRoom, playerId, card);
  if (positionCard === -1) {
    console.log('player does not have card');
    throw "Player does not have the card in their hand";
  }
  // get position of card on board & update card to have player's token on it
  var position = CARD_POSITIONS[card];
  var colorToken = GameState.players.get(playerId).team;
  GameState.board[position.x][position.y].token = colorToken;

  // replace card in player's hand
  GameState.players.get(playerId).cardsInHand[positionCard] = getCard(gameRoom);

  // check for dead cards
  checkDeadCards(gameRoom, card);

  // check for sequences
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
 * Update the next player's turn
 * @param {*} gameRoom 
 */
function updateNextPlayer(gameRoom) {
  var game = GAME_LOBBIES.get(gameRoom);
  var currentPlayer = game.currentPlayer;
  var length = game.players.size;
  var nextPlayer = currentPlayer >= length - 1 ? 0 : currentPlayer + 1;
  GAME_LOBBIES.get(gameRoom).currentPlayer = nextPlayer;
}

/**
 * Check if the card is occupied by a different team's token
 * @param {*} gameRoom 
 * @param {*} playerId 
 * @param {*} cardId 
 */
function checkIfCardOccupied(gameRoom, playerId, cardId) {
  var GameState = GAME_LOBBIES.get(gameRoom);
  var cardPosition = CARD_POSITIONS[cardId];
  var token = GameState.board[cardPosition.x][cardPosition.y].token;
  var team = GameState.players.get(playerId).team;
  console.log('team is ' + team + ' and token is ' + token);
  var isOccupied = token != null && token != team;
  return isOccupied;
}

/**
 * Get first position of one eyed jack in player's hand
 * If they don't have one then return -1
 * @param {*} gameRoom 
 * @param {*} playerId 
 */
function getOneEyedJack(gameRoom, playerId) {
  var GameState = GAME_LOBBIES.get(gameRoom);
  var cards = GameState.players.get(playerId).cardsInHand;
  for (var i = 0; i < cards.length; i++) {
    var card = cards[i];
    if (card === 'JH' || card === 'JS') {
      return i;
    }
  }
  return -1;
}

/**
 * Remove token from board
 * @param {*} gameRoom 
 * @param {*} playerId 
 * @param {*} card 
 */
function removeToken(gameRoom, playerId, card) {
  var GameState = GAME_LOBBIES.get(gameRoom);
  var positionOneEyeJack = getOneEyedJack(gameRoom, playerId);
  var isOccupied = checkIfCardOccupied(gameRoom, playerId, card);
  if (!isOccupied) {
    var err = 'For gameRoom ' + gameRoom + ', playerId: ' + playerId + ', card ' + card + ' is not occupied or is occupied by the same team';
    throw err;
  }
  if (positionOneEyeJack === -1) {
    var err = 'Player ' + playerId + ' in game room ' + gameRoom + ' does not have a one eyed jack';
    throw err;
  }
  // get position of card and remove the token on it
  var position = CARD_POSITIONS[card];
  var isPartOfSequence = GameState.board[position.x][position.y].partOfSequence;
  if (isPartOfSequence) {
    var err = 'Token is part of sequence';
  }
  GameState.board[position.x][position.y].token = null;

  // check if in dead cards - if so, remove it and add back to card deck
  for (var i = 0; i < GameState.deadCards.length; i++) {
    if (GameState.deadCards[i] === card.substring(0, card.length - 1)) {
      GameState.deadCards.splice(i, 1);
      GameState.cardDeck.push(card.substring(0, card.length - 1))
      // shuffle deck
      GameState.cardDeck = shuffle(GameState.cardDeck);
    }
  }

  // remove the one eyed jack from the player's hand
  GameState.players.get(playerId).cardsInHand[positionOneEyeJack] = getCard(gameRoom);
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
    try {
      placeTokenOnCard(gameRoom, playerId, card);
      updateNextPlayer(gameRoom);
      sendStateUpdate(gameRoom);
    } catch (err) {
      console.log(err);
    }
  } else if (move === MoveType.REMOVE_TOKEN) {
    try {
      removeToken(gameRoom, playerId, card);
      updateNextPlayer(gameRoom);
      sendStateUpdate(gameRoom);
    } catch (err) {
      console.log(err);
    }
  }
}

/**
 * Create new player and add to game lobby
 * @param {*} name 
 * @param {*} gameRoomId 
 */
function addPlayerGameLobby(name, gameRoomId) {
  console.log('gameRoom is ' + gameRoomId)
  var gameRoom = GAME_LOBBIES.get(gameRoomId);
  if (!gameRoom) {
    throw INVALID_ROOM_CODE_ERROR;
  }
  var playerIds = Array.from(gameRoom.players.keys());
  var lastPlayer = gameRoom.players.get(playerIds[playerIds.length - 1]);
  var playerId = lastPlayer.id + 1;
  var numSameName = numElementInArr(name, gameRoom.playerNames);
  if (numSameName > 0) {
    throw PLAYER_WITH_SAME_NAME_ERROR.replace("%s", name);
  }
  var player = createPlayer(gameRoomId, playerId, name);
  if (playerIds.length >= gameRoom.numPlayers) {
    throw MAX_PLAYERS_ERROR;
  }
  GAME_LOBBIES.get(gameRoomId).players.set(playerId, player);
  GAME_LOBBIES.get(gameRoomId).playerNames.push(name);
  sendStateUpdate(gameRoomId);
  return playerId;
}

/**
 * Remove player from game
 * @param {*} gameRoomId 
 * @param {*} playerId 
 */
function removePlayerFromGame(gameRoomId, playerId) {
  var gameRoom = GAME_LOBBIES.get(gameRoomId);
  if (!gameRoom || gameRoom.players.size === 0) { return; }
  var player = gameRoom.players.get(playerId);
  if (!player) { return; }
  // transfer player's cards to card decks
  gameRoom.cardDeck = gameRoom.cardDeck.concat(player.cardsInHand);
  // remove player from names
  for (var i = 0; i < gameRoom.teams.get(player.team).players.length; i++) {
    var teamPlayer = gameRoom.teams.get(player.team).players[i]
    if (teamPlayer === playerId) {
      // delete player
      gameRoom.teams.get(player.team).players.splice(i, 1);
    }
  }
  console.log(GAME_LOBBIES.get(gameRoomId).teams.get(player.team));
  // delete player from game
  gameRoom.players.delete(playerId);
  // delete player from teams
  var playerNames = gameRoom.playerNames;
  playerNames.splice(playerNames.indexOf(player.name), 1);

  // delete team if player was only one in it
  if (gameRoom.teams.get(player.team).players.length === 0) {
    gameRoom.teams.delete(player.team);
  }

  // update current player 
  if (gameRoom.currentPlayer === playerId) {
    updateNextPlayer(gameRoomId);
  }

  // of no more players then delete the game room
  if (gameRoom.players.size === 0) {
    GAME_LOBBIES.delete(gameRoomId);
  }
}

/****************************************************************************
* 
* Sockets
* 
****************************************************************************/

/**
 * Add a socketId, playerId, game room code key value pair to game lobby
 * We need this so we can remove players from their game room when socket disconnects
 * @param {str} socketId 
 * @param {str} gameRoomId 
 * @param {str} playerId 
 */
function addPlayerSocketIdToGameLobby(socketId, gameRoomId, playerId) {
  SOCKETS_MAP.set(socketId, { playerId: playerId, gameRoomId: gameRoomId });
}


io.on('connection', function(socket) {
  console.log('\n');
  console.log('new connection ' + socket.id);
  // This console log only seems to work for connection on your local network.
  //console.log('IP address: ' + socket.request.headers.referer);

  socket.on('disconnect', function() {
    // on disconnect, remove the player from the game
    // and send notification to other players that player has left
    var gamePlayer = SOCKETS_MAP.get(socket.id);
    if (gamePlayer) {
      // remove player from game
      console.log('Player in gameRoom ' + gamePlayer.gameRoomId + ' and id ' + gamePlayer.playerId + ' is leaving game');
      removePlayerFromGame(gamePlayer.gameRoomId, gamePlayer.playerId);
      SOCKETS_MAP.delete(socket.id);
      sendStateUpdate(gamePlayer.gameRoomId);
    }
  })

  socket.on('createGame', function(msg) {
    console.log('create new game with msg');
    console.log(msg);
    var gameRoomId = initializeNewGame(msg.name, msg.numPlayers, socket.id);
    io.to(socket.id).emit('createGameSuccess', gameRoomId);
    sendStateUpdate(gameRoomId)
  });
  socket.on('joinGame', function(msg) {
    console.log('player ' + msg.name + ' trying to join room ' + msg.room);
    console.log('join game')
    console.log(msg)
    try {
      var playerId = addPlayerGameLobby(msg.name, msg.room);
      // add socket to game lobby
      addPlayerSocketIdToGameLobby(socket.id, msg.room, playerId);
      // add socket to game lobby
      io.to(socket.id).emit(msg.room, { joinGameSuccess: true, playerId: playerId });
      sendStateUpdate(msg.room);
    } catch (err) {
      // console.log('join game failure ' + err);
      io.to(socket.id).emit('joinGameFailure', err);
    }

  });

  socket.on('move', function(params) {
    applyMove(params.move, params.gameRoom, params.playerId, params.card);
  });
})

function sendStateUpdate(gameRoomId) {
  var gameRoom = GAME_LOBBIES.get(gameRoomId);
  // console.log('GAME_LOBBIES is ')
  // console.log(GAME_LOBBIES)
  // console.log('sockets is ')
  // console.log(SOCKETS_MAP)
  if (gameRoom) {
    // console.log('game room is ')
    // console.log(gameRoom)
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