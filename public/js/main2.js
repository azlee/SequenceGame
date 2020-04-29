'use strict';

/****************************************************************************
* 
* Enumerations
* 
****************************************************************************/
var playerId;

var GameState = {};

const MoveType = {
  PLACE_TOKEN: "PLACE TOKEN",
  REMOVE_TOKEN: "REMOVE TOKEN",
  SHOW_CARDS_ON_BOARD: "SHOW CARDS ON BOARD"
}

const Team = {
  BLUE: "BLUE",
  GREEN: "GREEN",
  RED: "RED"
}

const SequenceType = {
  HORIZONTAL: "HORIZONTAL",
  VERTICAL: "VERTICAL",
  TOPLEFT_RIGHTDOWN: "TOPLEFT RIGHTDOWN",
  BOTTOMLEFT_RIGHTTOP: "BOTTOMLEFT RIGHTTOP"
}

const ColorChip = {
  BLUE: "/imgs/blue-chip.png",
  GREEN: "/imgs/green-chip.png",
  RED: "/imgs/red-chip.png"
}

const TeamBorderColor = {
  BLUE: "rgb(0, 184, 230)",
  GREEN: "rgb(51, 204, 51)",
  RED: "rgb(255, 71, 26)",
}

const ModalType = {
  GAME_LOBBY: "GAME LOBBY",
  CREATE_NEW_GAME_FORM: "CREATE NEW GAME FORM",
  JOIN_NEW_GAME: "JOIN NEW GAME",
  DISPLAY_WINNER: "DISPLAY WINNER",
  PLAYER_LEFT: "PLAYER LEFT"
}

const NUMBER_OF_PLAYERS = [2, 3, 4, 6, 8, 9, 12];

const WINNER_GIFS = ["/imgs/cardWinner.gif", "/imgs/cardWinner2.gif", "/imgs/cardWinner3.gif", "/imgs/cardWinner4.gif", "/imgs/cardWinner5.gif", "/imgs/cardWinner6.gif", "/imgs/cardWinner7.gif", "/imgs/cardWinner8.gif"];

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

// keep track of which cards in their hand the player has highlighted on the board
var highlightedCards = {
  // key, value where key is index of card in hand and value is true or false depending
  // on if the card is highlighted
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


function getRandomWinnerGif() {
  var index = getRandomInt(0, WINNER_GIFS.length - 1);
  return WINNER_GIFS[index];
}

/****************************************************************************
* 
* Sockets
* 
****************************************************************************/

var socket = io();
console.log(socket)

/**
 * Create a new game with first player with name
 * @param {str} name - name of first player
 */
function createGame(name, numPlayers) {
    socket.emit('createGame', { name: name.trim(), numPlayers: numPlayers });
    playerId = 0;
    socket.on('createGameSuccess', function(gameRoom) {
      var modal = document.getElementById('myModal');
      modal.style.display = "none";
      listenToRoomNotifications(gameRoom);
      addEventListenersToCardsInBoard();
      renderToggle();
    })
}

/**
* Allow player with name name to join room with roomCode
* @param {str} name 
* @param {str} roomCode 
*/
function joinGame(name, roomCode) {
  roomCode = roomCode.trim().toUpperCase();;
  socket.emit('joinGame', { name: name, room: roomCode });
  listenToRoomNotifications(roomCode)

  socket.on('joinGameFailure', function(errorMsg) {
      var errorDiv = document.getElementById('formPlaceholder');
      errorDiv.innerHTML = errorMsg;
  })
}


function listenToRoomNotifications(roomCode) {
  socket.on(roomCode, function(msg) {
    if (msg.state) {
      var prevGameState = Object.assign({}, GameState);
      GameState = msg.state;
      GameState.players = new Map(JSON.parse(msg.state.players));
      GameState.teams = new Map(JSON.parse(msg.state.teams));
      renderBoard(prevGameState);
    } if (msg.joinGameSuccess) {
        playerId = msg.playerId;
        var modal = document.getElementById('myModal');
        modal.style.display = "none";
        renderBoard();
        addEventListenersToCardsInBoard();
        renderToggle();
    }
  })
}

/**
 * Render the game lobby modal
 */
window.onload = function () {
  // render the game lobby join modal
  renderModal(ModalType.GAME_LOBBY);
};

/****************************************************************************
* 
* Render HTML DOM elements
* 
****************************************************************************/

/**
 * Render the board only if game state has changed
 */
function renderBoard(prevGameState) {
  if (playerId === undefined) {
    return;
  }
  if (prevGameState === undefined || Object.keys(prevGameState).length === 0) {
    renderCardsInHand();
    renderHeader();
    return;
  }
  var prevNumSequences = 0; 
  var cardsInHandChanged = prevGameState.players.get(playerId).cardsInHand != GameState.players.get(playerId).cardsInHand;
  var boardChanged = prevGameState.board != GameState.board;
  prevNumSequences += prevGameState.teams.get(Team.GREEN).sequences.size;
  if (prevGameState.teams.get(Team.RED)) {
    prevNumSequences += prevGameState.teams.get(Team.RED).sequences.size;
  }
  if (prevGameState.teams.get(Team.BLUE)) {
    prevNumSequences += prevGameState.teams.get(Team.BLUE).sequences.size;
  }
  var currNumSequences = 0;
  currNumSequences += GameState.teams.get(Team.GREEN).sequences.size;
  if (GameState.teams.get(Team.RED)) {
    currNumSequences += GameState.teams.get(Team.RED).sequences.size;
  }
  if (GameState.teams.get(Team.BLUE)) {
    currNumSequences += GameState.teams.get(Team.BLUE).sequences.size;
  }
  var sequencesChanged = prevNumSequences != currNumSequences;
  renderHeader();
  if (cardsInHandChanged) {
    renderCardsInHand(prevGameState.players.get(playerId).cardsInHand);
  }
  if (sequencesChanged) {
    renderSequences();
  }
  if (boardChanged) {
    renderTokens(prevGameState.board);
  }
  renderHighlightedCards();
  // check if any players left
  if (prevGameState.players.size > GameState.players.size) {
    var difference = Array.from(prevGameState.players.keys()).filter(x => !Array.from(GameState.players.keys()).includes(x));
    renderModal(ModalType.PLAYER_LEFT, prevGameState.players.get(difference[0]).name);
  }
}

/**
 * Render the player's cards
 */
function renderCardsInHand(prevCards) {
  var cardsDiv = document.getElementById("cards-in-hand");
  // TODO: only render the new playing card after player places a token
  var i = 0;
  var cards = GameState.players.get(playerId).cardsInHand;
  if (!prevCards || prevCards.length === 0) {
    for (var card of cards) {
      var cardDiv = createPlayingCard(card, i);
      cardDiv.id = 'card-' + i;
      i++;
      cardsDiv.appendChild(cardDiv);
    }
  } else {
    for (var i = 0; i < cards.length; i++) {
      if (prevCards[i] !== cards[i]) {
        var card = cards[i];
        var cardDiv = document.getElementById('card-' + i);
        var newCard = createPlayingCard(card, i);
        newCard.id = 'card-' + i;
        cardDiv.parentNode.replaceChild(newCard, cardDiv);
      }
    }
  }
}

function putBorderAroundSequence(sequence) {
  var borderColor = 'rgba(0, 0, 0, .9)';
  if (sequence.type === SequenceType.HORIZONTAL) {
    var cards = sequence.positions;
    // set left, top & bottom border for 1st element
    var leftCard = document.getElementById(cards[0].card);
    if (leftCard) {
      leftCard.style.boxShadow = 'inset .4rem .4rem .3rem ' + borderColor + ',inset 0 -.4rem .3rem ' + borderColor
      leftCard.style.webkitBoxShadow = 'inset .4rem .4rem .3rem ' + borderColor + ',inset 0 -.4rem .3rem ' + borderColor
    }
    for (var i = 1; i <= 3; i++) {
      var middleCard = document.getElementById(cards[i].card);
      middleCard.style.boxShadow = 'inset 0 .4rem .3rem ' + borderColor + ',inset 0 -.4rem .3rem ' + borderColor
      middleCard.style.webkitBoxShadow = 'inset 0 .4rem .3rem ' + borderColor + ',inset 0 -.4rem .3rem ' + borderColor
    }
    var rightCard = document.getElementById(cards[4].card);
    if (rightCard) {
      rightCard.style.boxShadow = 'inset -.4rem .4rem .3rem ' + borderColor + ',inset 0 -.4rem .3rem ' + borderColor
      rightCard.style.webkitBoxShadow = 'inset -.4rem .4rem .3rem ' + borderColor + ',inset 0 -.4rem .3rem ' + borderColor
    }
  } else if (sequence.type === SequenceType.VERTICAL) {
    var cards = sequence.positions;
    var topCard = document.getElementById(cards[0].card);
    if (topCard) {
      topCard.style.boxShadow = 'inset .4rem .4rem .3rem ' + borderColor + ',inset -.4rem 0 .3rem ' + borderColor
      topCard.style.webkitBoxShadow = 'inset .4rem .4rem .3rem ' + borderColor + ',inset -.4rem 0 .3rem ' + borderColor
    }
    for (var i = 1; i <= 3; i++) {
      var middleCard = document.getElementById(cards[i].card);
      middleCard.style.boxShadow = 'inset .4rem 0 .3rem ' + borderColor + ',inset -.4rem 0 .3rem ' + borderColor
      middleCard.style.webkitBoxShadow = 'inset .4rem 0 .3rem ' + borderColor + ',inset -.4rem 0 .3rem ' + borderColor
    }
    var bottomCard = document.getElementById(cards[4].card);
    if (bottomCard) {
      bottomCard.style.boxShadow = 'inset .4rem -.4rem .3rem ' + borderColor + ',inset -.4rem 0 .3rem ' + borderColor
      bottomCard.style.webkitBoxShadow = 'inset .4rem -.4rem .3rem ' + borderColor + ',inset -.4rem 0 .3rem ' + borderColor
    }
  } else { // diagonal sequence - put border on all sides
    for (var i = 0; i <= 4; i++) {
      var cards = sequence.positions;
      var card = document.getElementById(cards[i].card);
      if (card) {
        card.style.boxShadow = 'inset .4rem .4rem .3rem ' + borderColor + ', inset -.4rem -.4rem .3rem ' + borderColor;
        card.style.webkitBoxShadow = 'inset .4rem .4rem .3rem ' + borderColor + ', inset -.4rem -.4rem .3rem ' + borderColor;
      }
    }
  }
}

//TODO only re render tokens that have changed!!
function renderTokens(prevBoard) {
  for (var i = 0; i < 10; i++) {
    for (var j = 0; j < 10; j++) {
      var card = GameState.board[i][j];
      var prevCard = prevBoard[i][j];
      // if token, then render the token on the card
      if (card.token) {
        var id = card.card;
        var cardDiv = document.getElementById(id);
        cardDiv.src = ColorChip[card.token];
      } else if (prevCard.token != card.token) {
        var id = card.card;
        var cardDiv = document.getElementById(id);
        cardDiv.src = '/imgs/overlay.png';
      }
    }
  }
}

function renderHeader() {
  var header = document.getElementById('header');
  if (header === null) {
    header = document.createElement('div');
    header.id = "header";
  }
  header.innerHTML = '';
  var roomCode = document.createElement('div');
  roomCode.id = "roomCode";
  roomCode.innerHTML = 'Room ' + GameState.gameId;
  header.appendChild(roomCode);
  var turn = document.createElement('div');
  turn.id = "turn";
  turn.style.borderColor = TeamBorderColor[team];
  var currentPlayerTeam = GameState.players.get(GameState.currentPlayer).team;
  var numPlayersWaiting = GameState.numPlayers - GameState.players.size;
  var dotDiv = '<span class="dot" style="background-color:' + TeamBorderColor[currentPlayerTeam] + ';"></span>';
  var currentPlayer = GameState.currentPlayer === playerId ? ' Your turn' : " %s's turn".replace("%s", GameState.players.get(GameState.currentPlayer).name);
  currentPlayer = dotDiv + currentPlayer;
  turn.innerHTML = numPlayersWaiting > 0 ? "Waiting for %s players to join...".replace("%s", numPlayersWaiting) : currentPlayer;
  var teams = document.createElement('div');
  teams.id = 'teams';
  for (var team of GameState.teams.keys()) {
    var teamPlayers = GameState.teams.get(team).players;
    var teamText = '<span class="dot" style="background-color:' + TeamBorderColor[team] + '"></span>';
    teamText += ' ' + GameState.players.get(teamPlayers[0]).name;
    for (var i = 1; i < teamPlayers.length; i++) {
      teamText += ', ';
      teamText += GameState.players.get(teamPlayers[i]).name;
    }
    var teamColor = document.createElement('span');
    teamColor.innerHTML = teamText;
    teams.appendChild(teamColor);
    teams.appendChild(document.createElement('br'));
  }
  header.appendChild(turn);
  header.appendChild(teams);
  document.body.appendChild(header);
}

// TODO: only render new sequences
function renderSequences() {
  for (var color in Team) {
    var numSequences = 0;
    if (GameState.teams.get(color)) {
      for (var sequence of GameState.teams.get(color).sequences) {
        numSequences++;
        // get the ids of each sequence and set border around it
        putBorderAroundSequence(sequence);
        if (numSequences === GameState.numSequencesForWin) {
          renderModal(ModalType.DISPLAY_WINNER, color);
        }
      }
    }
  }
}

function createPlayingCard(cardType, i) {
  var card = document.createElement('img');
  var widthOfCard = 100 / GameState.numCardsPerPerson;
  card.className = "card-in-hand " + cardType;
  card.style = "width:" + widthOfCard + "%";
  card.src = "/imgs/" + cardType + ".png";
  card.addEventListener("click", function(event) {
    applyMove(MoveType.SHOW_CARDS_ON_BOARD, cardType, i);
  }, false);
  return card;
}

function addDropShadow(playingCard) {
  playingCard.style.filter = "drop-shadow(1.5rem 1.5rem 1rem gray)";
  playingCard.style.webkitFilter = "drop-shadow(1.5rem 1.5rem 1rem gray)";
}

function removeDropShadow(playingCard) {
  playingCard.style.filter = "";
  playingCard.style.webkitFilter = "";
}

function moveUp(card) {
  card.style.position = 'relative';
  card.style.top = '-1.5rem';
}

function moveDown(card) {
  card.style.position = '';
  card.style.top = '';
}

function addDropShadowToPlayingCard(card) {
  var playingCard = document.getElementsByClassName(card);
  for (var card of playingCard) {
    if (card.style.filter === "") {
      addDropShadow(card);
      moveUp(card);
    } else {
      removeDropShadow(card);
      moveDown(card);
      var toggle = document.getElementById('checkbox');
      toggle.checked = false;
    }
  }
}

function addDropShadowFilterToCardInBoard(card, teamColor) {
  if (card === null) { return; }
  var cardPos = CARD_POSITIONS[card.id];
  // don't highlight cards that already have tokens on them
  if (GameState.board[cardPos.x][cardPos.y].token != null) {
    return removeDropShadowFilter(card);
  }
  card.style.boxShadow = 'inset .4rem .4rem .3rem ' + teamColor + ', inset -.4rem -.4rem .3rem ' + teamColor;
  card.style.webkitBoxShadow = 'inset .4rem .4rem .3rem ' + teamColor + ', inset -.4rem -.4rem .3rem ' + teamColor;

  var filter = "drop-shadow(.5rem .5rem .5rem " + "gray" + ") drop-shadow(-.5rem -.5rem .5rem " + "gray" + ")";
  card.style.filter = filter;
  card.style.webkitFilter = filter;
}

function removeDropShadowFilter(card) {
  if (card === null) { return; }
  card.style.boxShadow = "";
  card.style.webkitBoxShadow = "";
  card.style.filter = "";
  card.style.webkitFilter = "";
}

function addEventListenersToCardsInBoard() {
  var board = document.getElementById('card-board');
  var nodeNum = 0;
  for (var i = 0; i < board.childNodes.length; i++) {
    var node = board.childNodes[i];
    if (node.nodeType === 1 && node.nodeName === 'IMG') {
      nodeNum++;
      node.addEventListener("click", function(event) {
        if (event.srcElement.className != "wildcard") {
          applyMove(MoveType.PLACE_TOKEN, event.srcElement.id);
        }
      }, false);
    }
  }
}

function placeTokenOnBoard(card, tokenColor) {
  var card = document.getElementById(card);
  var tokenChipSrc = ColorChip[tokenColor];
  // card.src = card.src.includes(tokenChipSrc) ? "/imgs/overlay.png" : tokenChipSrc;
  card.src = tokenChipSrc;
}

function checkIfPlayerHasCard(cardId) {
  var tokenCard = cardId.substring(0, cardId.length - 1);
  // check player's cards to see if they can play the token on the card id
  for (var card of GameState.players.get(playerId).cardsInHand) {
    if (card === tokenCard || card === 'JD' || card === 'JC') {
      return true;
    }
  }
  return false;
}

function checkIfCardOccupied(cardId) {
  var cardPosition = CARD_POSITIONS[cardId];
  var token = GameState.board[cardPosition.x][cardPosition.y].token;
  var team = GameState.players.get(playerId).team;
  var isOccupied = token != null && token != team;
  return isOccupied;
}

/**
 * Enable or disable button for joining or creating game if input is incorrect
 * ex. if input for name has numbers
 *     or if the room code isn't 4 characters
 */
function addDisableEnableButton() {
  $('#joinOrCreateGame').prop('disabled', true);
  var roomCodeButton = document.getElementById('roomCodeInput') !== null;

  function validateNextButton() {
    var isNameEntered = $('#nameInput').val().trim() !== '';
    var isNumericName = /^[a-zA-Z]*$/g.test($('#nameInput').val());
    var isRoomCodeEntered = !roomCodeButton || ($('#roomCodeInput').val().trim().length === 4);
    $('#joinOrCreateGame').prop('disabled', !isNameEntered || !isRoomCodeEntered || !isNumericName);
  }

  $('#nameInput').on('keyup', validateNextButton);
  if (roomCodeButton) {
      $('#roomCodeInput').on('keyup', validateNextButton);
  }
};

/**
 * Create form for joining of creating new game
 * @param {boolean} newGame - true if we are creating new game. false if joining existing game
 */
function createPlayForm(newGame) {
  var formDiv = document.createElement('form');
  var nameLabel = document.createElement('label');
  nameLabel.innerHTML = 'Name: ';
  var nameInput = document.createElement('input');
  nameInput.id = 'nameInput';
  nameInput.maxLength = "15" 
  nameInput.placeholder = "ENTER YOUR NAME";
  var imgDiv = document.createElement('img');
  imgDiv.src = "/imgs/honor_heart-14.png";
  formDiv.appendChild(imgDiv);
  formDiv.appendChild(document.createElement('br'));
  formDiv.appendChild(nameLabel);
  formDiv.appendChild(nameInput);
  formDiv.appendChild(document.createElement('br'));
  if (newGame) {
    // add select for number of players
    var numPlayersLabel = document.createElement('label');
    numPlayersLabel.innerHTML = 'Choose number of players: ';
    var numPlayersSelect = document.createElement('select');
    numPlayersSelect.id = 'numPlayers';
    for (var numPlayers of NUMBER_OF_PLAYERS) {
      var option = document.createElement('option');
      option.value = numPlayers;
      option.innerHTML = numPlayers;
      numPlayersSelect.appendChild(option);
    }
    formDiv.appendChild(numPlayersLabel);
    formDiv.appendChild(numPlayersSelect);
  }
  if (!newGame) {
      var codeLabel = document.createElement('label');
      codeLabel.innerHTML = 'Room code: ';
      var codeInput = document.createElement('input');
      codeInput.id = 'roomCodeInput';
      codeInput.maxLength = "4";
      codeInput.size = "22";
      codeInput.placeholder = "ENTER 4-LETTER CODE"
      formDiv.appendChild(codeLabel);
      formDiv.appendChild(codeInput);
  }
  formDiv.appendChild(document.createElement('br'));
  // error msg placeholder
  var msgPlaceholder = document.createElement('p');
  msgPlaceholder.id = 'formPlaceholder';
  msgPlaceholder.style = "color:#D8000C;font-size:1rem;padding-left:1rem;padding-right:1rem;"
  formDiv.appendChild(msgPlaceholder);
  var button = document.createElement('button');
  button.type = 'button'
  button.id = 'joinOrCreateGame';
  button.innerHTML = newGame ? 'CREATE GAME' :'JOIN GAME';
  button.disabled = true;
  if (newGame) {
      button.addEventListener("click", function(event) {
          createGame(document.getElementById('nameInput').value, document.getElementById('numPlayers').value);
      });
  } else {
      button.addEventListener("click", function(event) {
          joinGame(document.getElementById('nameInput').value, document.getElementById('roomCodeInput').value);
      }, false);
  }
  formDiv.append(button);
  return formDiv;
}

/**
 * Create the option form for either creating new game or joining existing game
 */
function createOptionForm() {
  var div = document.createElement('div');
  var createNewGameButton = document.createElement('button');
  var joinExistingButton = document.createElement('button');
  // add action to button
  createNewGameButton.addEventListener("click", function(event) {
      renderModal(ModalType.CREATE_NEW_GAME_FORM)
  }, false);
  joinExistingButton.addEventListener("click", function(event) {
      renderModal(ModalType.JOIN_NEW_GAME)
  }, false);
  createNewGameButton.innerHTML = 'CREATE NEW GAME';
  joinExistingButton.innerHTML = 'JOIN EXISTING GAME';
  var imgDiv = document.createElement('img');
  imgDiv.src = "/imgs/honor_heart-14.png";
  div.appendChild(imgDiv);
  div.appendChild(document.createElement('br'));
  div.appendChild(createNewGameButton);
  div.appendChild(document.createElement('br'));
  div.appendChild(joinExistingButton);
  div.style = "margin-bottom: 2rem;"
  return div;
}

function togglePlayingCards() {
  var toggle = document.getElementById('checkbox');
  var player = GameState.players.get(playerId);
  if (toggle.checked) {
    var i = 0;
    for (var card of player.cardsInHand) {
      highlightedCards[i] = true;
      i++
      var cardsDiv = document.getElementsByClassName(card);
      for (var cardDiv of cardsDiv) {
        moveUp(cardDiv);
        addDropShadow(cardDiv);
      }
      addDropShadowFilterToCardInBoard(document.getElementById(card + '1'), TeamBorderColor[player.team]);
      addDropShadowFilterToCardInBoard(document.getElementById(card + '2'), TeamBorderColor[player.team]);
    }
  } else {
    var i = 0;
    for (var card of GameState.players.get(playerId).cardsInHand) {
      highlightedCards[i] = false;
      i++
      var cardsDiv = document.getElementsByClassName(card);
      for (var cardDiv of cardsDiv) {
        moveDown(cardDiv);
        removeDropShadow(cardDiv);
      }
      removeDropShadowFilter(document.getElementById(card + '1'));
      removeDropShadowFilter(document.getElementById(card + '2'));
    }
  }
}

function renderToggle() {
  var toggle = document.getElementById('toggle');
  toggle.style.display = "block"
  var checkbox = document.getElementById("checkbox");
  checkbox.checked = false;
  checkbox.addEventListener( 'change', function() {
    togglePlayingCards();
  }, false);
}

function createWinnerModal(winningTeam) {
  var div = document.createElement('div');
  div.className = 'winner-modal';
  // create img
  var img = document.createElement('img');
  img.src = getRandomWinnerGif();
  div.appendChild(img);
  return div;
}

/**
 *  Render modal either for
 *  a) Game lobby
 *  b) Winning card
 *  c) displaying a player's winning card combos
 * @param modalType: type of modal to display
 */
function renderModal(modalType, winningTeam) {
  var modal = document.getElementById('myModal');
  var modalContent = document.getElementById('modal-content');
  modalContent.innerHTML = '<span class="close">&times;</span>';
  if (modalType === ModalType.GAME_LOBBY) {
    modalContent.innerHTML = '';
    var modalHeader = '<h4 style="font-size:1.5rem;font-weight:bold;center;letter-spacing:-1px">';
    modalHeader += 'Sequence Game';
    modalHeader += "</h4>";
    modalContent.innerHTML += modalHeader;
    modalContent.appendChild(createOptionForm());
  } else if (modalType === ModalType.JOIN_NEW_GAME || modalType === ModalType.CREATE_NEW_GAME_FORM) {
    modalContent.innerHTML = '';
    var newGame = modalType === ModalType.CREATE_NEW_GAME_FORM;
    var modalHeader = '<h4 style="font-size:1.5rem;font-weight:bold;center;letter-spacing:-1px">';
    modalHeader += (newGame ? 'Create new game' : 'Join existing game');
    modalHeader += "</h4>";
    modalContent.innerHTML += modalHeader;
    modalContent.appendChild(createPlayForm(newGame));
    addDisableEnableButton();
  } else if (modalType === ModalType.DISPLAY_WINNER) {
    modalContent.innerHTML + '';
    modalContent.style.border = "1rem solid " + TeamBorderColor[winningTeam];
    var modalHeader = '<h4 style="font-size:1.5rem;font-weight:bold;center;letter-spacing:-1px">';
    modalHeader += "Team " + winningTeam + " won!";
    modalHeader += "</h4>";
    // create list of winning players name
    var winnersList = document.createElement('h4');
    var winningPlayerIds = GameState.teams.get(winningTeam).players;
    for (var playerId of winningPlayerIds) {
      var playerName = GameState.players.get(playerId).name;
      winnersList.innerHTML += playerName + ", ";
    }
    winnersList.innerHTML = winnersList.innerHTML.substring(0, winnersList.innerHTML.length - 2);
    modalContent.innerHTML += modalHeader;
    modalContent.appendChild(winnersList);
    modalContent.appendChild(createWinnerModal(winningTeam));
  } else if (modalType === ModalType.PLAYER_LEFT) {
    modalContent.innerHTML + '';
    var modalHeader = '<h4 style="font-size:1.5rem;font-weight:bold;center;letter-spacing:-1px">';
    modalHeader += "Player " + winningTeam + " left";
    modalHeader += "</h4>";
    modalContent.innerHTML += modalHeader;
  }
  if (modalType === ModalType.JOIN_NEW_GAME || modalType === ModalType.GAME_LOBBY || modalType === ModalType.CREATE_NEW_GAME_FORM) {
      modal.style.display = "block";
      return;
  }
  var span = document.getElementsByClassName("close")[0];
  span.addEventListener("click", function(event) {
      modal.style.display = "none";
  }, false);
  window.onclick = function(event) {
      if (event.target == modal) {
          modal.style.display = "none";
      }
  }
  modal.style.display = "block";
}

function getOneEyedJack() {
  var cards = GameState.players.get(playerId).cardsInHand;
  for (var i = 0; i < cards.length; i++) {
    var card = cards[i];
    if (card === 'JH' || card === 'JS') {
      return i;
    }
  }
  return -1;
}

function renderHighlightedCards() {
  for (var i of Object.keys(highlightedCards)) {
    if (highlightedCards[i]) {
      var card = document.getElementById('card-' + i);
      // add style to card in hand
      addDropShadow(card);
      moveUp(card);
      // add style to card in board
      var player = GameState.players.get(playerId);
      var answerCards = player.cardsInHand;
      addDropShadowFilterToCardInBoard(document.getElementById(answerCards[i] + '1'), TeamBorderColor[player.team]);
      addDropShadowFilterToCardInBoard(document.getElementById(answerCards[i] + '2'), TeamBorderColor[player.team]);
    } else {
      var card = document.getElementById('card-' + i);
      removeDropShadow(card);
      moveDown(card);
      // remove style to card in board
      var answerCards = GameState.players.get(playerId).cardsInHand;
      removeDropShadowFilter(document.getElementById(answerCards[i] + '1'));
      removeDropShadowFilter(document.getElementById(answerCards[i] + '2'));
    }
  }
}

function getNumOfHighlightedCards() {
  var num = 0;
  for (var value of Object.values(highlightedCards)) {
    if (value) {
      num++;
    }
  }
  return num;
}

function applyMove(move, card, i) {
  var socketEmit = false;
  if (move === MoveType.SHOW_CARDS_ON_BOARD) {
    var toggle = document.getElementById('checkbox');
    var numCardsPerPerson = GameState.numCardsPerPerson;
    if (highlightedCards[i]) { toggle.checked = false; }
    highlightedCards[i] = highlightedCards[i] ? false : true;
    if (getNumOfHighlightedCards() === numCardsPerPerson) {
      toggle.checked = true;
    }
    renderHighlightedCards();
  } else if (move === MoveType.PLACE_TOKEN) {
    if (GameState.currentPlayer !== playerId || (GameState.players.size < GameState.numPlayers)) {
      return;
    }
    // TODO: FIX this so it checks num sequences per team
    // if (GameState.numSequencesForWin === GameState.numSequences) {
    //   return;
    // }
    // can only place token if it's the player's turn and if they have the card in their hand
    // and if the card is not occupied by another token
     var isOccupied = checkIfCardOccupied(card);
     var cardPosition = CARD_POSITIONS[card];
     if (isOccupied) { // player is trying to remove a token
      // check that player has a one eyed jack
      var oneEyedJackPosition = getOneEyedJack();
      if (oneEyedJackPosition === -1) { return; }
      // if card is part of sequence then invalid move
      if (GameState.board[cardPosition.x][cardPosition.y].partOfSequence) {
        return;
      }
      move = MoveType.REMOVE_TOKEN;
      socketEmit = true;
     } else if (checkIfPlayerHasCard(card)) {
      if (!GameState.board[cardPosition.x][cardPosition.y].token) {
        socketEmit = true;
        var cardType = card.substring(0, card.length - 1);
        var card1 = document.getElementById(cardType + '1');
        var card2 = document.getElementById(cardType + '2');
        card1.style.filter = "";
        card1.style.webkitFilter = "";
        card1.style.boxShadow = "";
        card1.style.webkitBoxShadow = "";
        card2.style.filter = "";
        card2.style.webkitFilter = "";
        card2.style.boxShadow = "";
        card2.style.webkitBoxShadow = "";
      }
    }
  }
  if (socketEmit) {
    socket.emit('move', {
      move: move,
      card: card,
      playerId: playerId,
      gameRoom: GameState.gameId
    });
  }
}
