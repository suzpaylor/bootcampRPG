///////////////////////////////////////////////////////////////////////////
// javaScript with lots of Googling - and zero violence in my game ////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
//Global variables

$(document).ready(function() {


let cheer = new Audio('assets/audio/cheer.mp3');
let lost = new Audio('assets/audio/lost.mp3');
let hop = new Audio('assets/audio/hop.mp3');
let clap = new Audio('assets/audio/clap.mp3');
let boing = new Audio('assets/audio/boing.mp3');
let nope = new Audio('assets/audio/nope.mp3');

//Array of Playable Characters
let characters = {
    'Monkichi': {
        name: 'Monkichi',
        health: 120,
        attack: 8,
        imageUrl: "assets/images/Monkichi.png",
        enemyAttackBack: 15
    }, 
    'BadtzMaru': {
        name: 'BadtzMaru',
        health: 100,
        attack: 14,
        imageUrl: "assets/images/BadtzMaru.png",
        enemyAttackBack: 5
    }, 
    'Kerropi': {
        name: 'Kerropi',
        health: 150,
        attack: 8,
        imageUrl: "assets/images/kerropi.png",
        enemyAttackBack: 20
    }, 
    'Chococat': {
        name: 'Chococat',
        health: 180,
        attack: 7,
        imageUrl: "assets/images/chococat.png",
        enemyAttackBack: 20
    }
};

var currSelectedCharacter;
var currDefender;
var combatants = [];
var indexofSelChar;
var attackResult;
var turnCounter = 1;
var killCount = 0;


var renderOne = function(character, renderArea, makeChar) {
    //character: obj, renderArea: class/id, makeChar: string
    var charDiv = $("<div class='character' data-name='" + character.name + "'>");
    var charName = $("<div class='character-name'>").text(character.name);
    var charImage = $("<img alt='image' class='character-image'>").attr("src", character.imageUrl);
    var charHealth = $("<div class='character-health'>").text(character.health);
    charDiv.append(charName).append(charImage).append(charHealth);
    $(renderArea).append(charDiv);
    //Capitalizes the first letter in characters name
    // $('.character').css('textTransform', 'capitalize');
    // conditional render
    if (makeChar == 'enemy') {
      $(charDiv).addClass('enemy');
    } else if (makeChar == 'defender') {
      currDefender = character;
      $(charDiv).addClass('target-enemy');
    }
  };

  // Create function to render game message to DOM
  var renderMessage = function(message) {
    var gameMesageSet = $("#gameMessage");
    var newMessage = $("<div>").text(message);
    gameMesageSet.append(newMessage);

    if (message == 'clearMessage') {
      gameMesageSet.text('');
    }
  };

  var renderCharacters = function(charObj, areaRender) {
    //render all characters
    if (areaRender == '#characters-section') {
      $(areaRender).empty();
      for (var key in charObj) {
        if (charObj.hasOwnProperty(key)) {
          renderOne(charObj[key], areaRender, '');
        }
      }
    }
    //render player character
    if (areaRender == '#selected-character') {
      $('#selected-character').prepend("Your Character");       
      renderOne(charObj, areaRender, '');
      $('#attack-button').css('visibility', 'visible');
    }
    //render the openants
    if (areaRender == '#available-to-attack-section') {
        $('#available-to-attack-section').prepend("Choose Your Next Opponent");      
      for (var i = 0; i < charObj.length; i++) {

        renderOne(charObj[i], areaRender, 'enemy');
      }
      //render one openant to the stage
      $(document).on('click', '.enemy', function() {
        //select someone to compete against
        name = ($(this).data('name'));
        //if you didn't pick someone
        if ($('#defender').children().length === 0) {
          renderCharacters(name, '#defender');
          $(this).hide();
          renderMessage("clearMessage");
        }
      });
    }
    //render competetor
    if (areaRender == '#defender') {
      $(areaRender).empty();
      for (var i = 0; i < combatants.length; i++) {
        //add openant to openant area
        if (combatants[i].name == charObj) {
          $('#defender').append("Your selected opponent")
          renderOne(combatants[i], areaRender, 'defender');
        }
      }
    }
    //re-render oponenat after competition event
    if (areaRender == 'playerDamage') {
      $('#defender').empty();
      $('#defender').append("Your selected opponent")
      renderOne(charObj, '#defender', 'defender');
      boing.play();
    }
    //re-render player character when attacked
    if (areaRender == 'enemyDamage') {
      $('#selected-character').empty();
      renderOne(charObj, '#selected-character', '');
    }
    //render defeated enemy
    if (areaRender == 'enemyDefeated') {
      $('#defender').empty();
      var gameStateMessage = "You have defeated " + charObj.name + ", you can choose to fight another oppenent.";
      renderMessage(gameStateMessage);
      hop.play();
    }
  };
  //this is to render all characters for user to choose their computer
  renderCharacters(characters, '#characters-section');
  $(document).on('click', '.character', function() {
    name = $(this).data('name');
    //if no player char has been selected
    if (!currSelectedCharacter) {
      currSelectedCharacter = characters[name];
      for (var key in characters) {
        if (key != name) {
          combatants.push(characters[key]);
        }
      }
      $("#characters-section").hide();
      renderCharacters(currSelectedCharacter, '#selected-character');
      //this is to render all characters for user to choose fight against
      renderCharacters(combatants, '#available-to-attack-section');
    }
  });

  // ----------------------------------------------------------------
  // Create functions to enable actions between objects.
  $("#attack-button").on("click", function() {
    //if defernder area has oponant
    if ($('#defender').children().length !== 0) {
      //defender state change
      var attackMessage = "You won against " + currDefender.name + " for " + (currSelectedCharacter.attack * turnCounter) + " points!";
      renderMessage("clearMessage");
      //combat
      currDefender.health = currDefender.health - (currSelectedCharacter.attack * turnCounter);

      //win condition
      if (currDefender.health > 0) {
        //enemy not dead keep playing
        renderCharacters(currDefender, 'playerDamage');
        //player state change
        var counterAttackMessage = currDefender.name + " took away " + currDefender.enemyAttackBack + " points.";
        renderMessage(attackMessage);
        renderMessage(counterAttackMessage);

        currSelectedCharacter.health = currSelectedCharacter.health - currDefender.enemyAttackBack;
        renderCharacters(currSelectedCharacter, 'enemyDamage');
        if (currSelectedCharacter.health <= 0) {
          renderMessage("clearMessage");
          restartGame("You have been defeated...GAME OVER!!!");
          lost.play();
          $("#attack-button").unbind("click");
        }
      } else {
        renderCharacters(currDefender, 'enemyDefeated');
        killCount++;
        if (killCount >= 3) {
          renderMessage("clearMessage");
          restartGame("You Won!!!! GAME OVER!!!");
          clap.play();
          setTimeout(function() {
          cheer.play();
          }, 2000);

        }
      }
      turnCounter++;
    } else {
      renderMessage("clearMessage");
      renderMessage("Please click on an oppenent");
      nope.play();
    }
  });

//Restarts the game - renders a reset button
  var restartGame = function(inputEndGame) {
    //When 'Restart' button is clicked, reload the page.
    var restart = $('<button class="btn">Restart</button>').click(function() {
      location.reload();
    });
    var gameState = $("<div>").text(inputEndGame);
    $("#gameMessage").append(gameState);
    $("#gameMessage").append(restart);
  };

});