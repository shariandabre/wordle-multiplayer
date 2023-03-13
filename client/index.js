const sock = io();
sock.on("loser", function (word) {
  Notify({
    title: `You lost the round! The word was ${word}`,
    type: "danger",
    position: "top center",
    duration: 2000,
  });
});

function joinRoom(){
  const codeInput = document.getElementById("code").value;


  sock.emit("code",codeInput)

  window.location.href = "/";
}

document.addEventListener("DOMContentLoaded", () => {
  sock.on("msg", (text) =>
    Notify({
      title: text,
      position: "top center",
      duration: 2000,
    })
  );
  sock.on("word", (word, words) => {
    console.log(word);

    function getTileColor(letter, index) {
      const iscorrectLetter = word.includes(letter);
      buttons = document.getElementsByTagName("button");

      if (!iscorrectLetter) {
        for (i = 0; i < 28; i++) {
          if (
            document
              .getElementsByTagName("button")
              [i].getAttribute("data-key") === letter
          )
            document.getElementsByTagName("button")[i].style.background =
              "rgb(58, 58, 60)";
        }
        return "rgb(58, 58, 60)";
      }

      const letterInThatPosition = word.charAt(index);
      const isCorrectPosition = letter === letterInThatPosition;

      if (isCorrectPosition) {
        for (i = 0; i < 28; i++) {
          if (
            document
              .getElementsByTagName("button")
              [i].getAttribute("data-key") === letter
          )
            document.getElementsByTagName("button")[i].style.background =
              "rgb(83, 141, 78)";
        }
        return "rgb(83, 141, 78)";
      }
      for (i = 0; i < 28; i++) {
        if (
          document
            .getElementsByTagName("button")
            [i].getAttribute("data-key") === letter
        )
          document.getElementsByTagName("button")[i].style.background =
            "rgb(181, 159, 59)";
      }
      return "rgb(181, 159, 59)";
    }

    function getEnemyTileColor(letter, index) {
      const iscorrectLetter = word.includes(letter);

      if (!iscorrectLetter) {
        return "rgb(58, 58, 60)";
      }

      const letterInThatPosition = word.charAt(index);
      const isCorrectPosition = letter === letterInThatPosition;

      if (isCorrectPosition) {
        return "rgb(83, 141, 78)";
      }

      return "rgb(181, 159, 59)";
    }
    sock.on("currentWordArr", function (currentWordArr) {
      gameState.Enemyword = currentWordArr;
      const firstLetterId = 100 * 5;
      const interval = 200;
      currentWordArr.forEach((letter, index) => {
        setTimeout(() => {
          const tileColor = getEnemyTileColor(letter, index);
          const letterId = firstLetterId + index;
          const letterEl = document.getElementById(letterId);
          letterEl.style = `background-color:${tileColor};border-color:${tileColor}`;
        }, interval * index);
      });
      saveGameState();
    });
    sock.on("correct", function (count) {
      if(count <=6){
      gameState.Enemycount = count;
      document.getElementById("correct").innerText = count ;
      saveGameState();
    }
    });
    function EnemyGuess() {
      if (gameState.Enemycount !== undefined) {
        document.getElementById("correct").innerText = gameState.Enemycount;
      }
      if (
        gameState.Enemyword !== undefined &&
        gameState.Enemyword.length === 5
      ) {
        const firstLetterId = 100 * 5;
        const interval = 200;
        gameState.Enemyword.forEach((letter, index) => {
          setTimeout(() => {
            const tileColor = getEnemyTileColor(letter, index);
            const letterId = firstLetterId + index;
            const letterEl = document.getElementById(letterId);
            letterEl.style = `background-color:${tileColor};border-color:${tileColor}`;
          }, interval * index);
        });
      }
    }
    function resetEnemyGuess() {
      document.getElementById("correct").innerText = 0;
      if (
        gameState.Enemyword !== undefined &&
        gameState.Enemyword.length === 5
      ) {
      const firstLetterId = 100 * 5;
      const interval = 200;
      gameState.Enemyword.forEach((letter, index) => {
        setTimeout(() => {
          const letterId = firstLetterId + index;
          const letterEl = document.getElementById(letterId);
          letterEl.style = `background-color:#111;border-color:#3a3a3c`;
        }, interval * index);
      });
      return
    }
    }
    function resettiles() {
      for (i = 0; i <= gameState.guessedWords.length; i++) {
        const firstLetterId = i * 5 + 1;
        const interval = 200;
        if (
          gameState.guessedWords[i] !== undefined &&
          gameState.guessedWords[i].length === 5
        ) {
          gameState.guessedWords[i].forEach((letter, index) => {
            setTimeout(() => {
              const letterId = firstLetterId + index;
              const letterEl = document.getElementById(letterId);
              letterEl.classList.remove("animate__flipInX");
              letterEl.classList.add("animate__fadeIn");
              letterEl.innerText = "";
              letterEl.setAttribute("data-empty", true);
              letterEl.style = `background-color:#111;border-color:#3a3a3c`;
            }, interval * index);
          });
        }
      }
      setTimeout(() => {
        for (i = 0; i < 28; i++) {
          document.getElementsByTagName("button")[i].style.background =
            "#818384";
        }
      }, 1000);
      resetEnemyGuess();
      return true
    }

    function savetiles() {
      for (i = 0; i <= gameState.guessedWords.length; i++) {
        const firstLetterId = i * 5 + 1;
        const interval = 200;
        if (
          gameState.guessedWords[i] !== undefined &&
          gameState.guessedWords[i].length === 5
        ) {
          gameState.guessedWords[i].forEach((letter, index) => {
            setTimeout(() => {
              const tileColor = getTileColor(letter, index);
              const letterId = firstLetterId + index;
              const letterEl = document.getElementById(letterId);
              letterEl.innerText = letter;
              letterEl.classList.add("animate__flipInX");
              letterEl.setAttribute("data-empty", false);
              letterEl.style = `background-color:${tileColor};border-color:${tileColor}`;
            }, interval * index);
          });
        }
        if (gameState.guessedWords[i] !== undefined) {
          gameState.guessedWords[i].forEach((letter, index) => {
            setTimeout(() => {
              const letterId = firstLetterId + index;
              const letterEl = document.getElementById(letterId);
              letterEl.innerText = letter;
            }, interval * index);
          });
        }
      }
    }

    let gameState = localStorage.getItem("gameState");
    if (gameState) {
      gameState = JSON.parse(gameState);
      savetiles();
      EnemyGuess();
    } else {
      gameState = {
        guessedWords: [[]],
        availableSpace: 1,
        guessedWordCount: 0,
        Enemyword: [],
        Enemycount: 0,
      };
    }

    function saveGameState() {
      localStorage.setItem("gameState", JSON.stringify(gameState));
    }
    window.addEventListener("beforeunload", saveGameState);

    const resetGameState = () => {
      gameState = {
        guessedWords: [[]],
        availableSpace: 1,
        guessedWordCount: 0,
      };
      saveGameState();
    };

    sock.on("reload-page", function () {
      if(resettiles()){
      resetGameState();
      localStorage.removeItem("gameState");}
    });

    const keys = document.querySelectorAll(".keyboard-row button");
    function getCurrentWordArr() {
      const noOfGuessedWords = gameState.guessedWords.length;
      return gameState.guessedWords[noOfGuessedWords - 1];
    }

    function updateGuessedWords(letter) {
      const CurrentWordArr = getCurrentWordArr();
      if (CurrentWordArr && CurrentWordArr.length < 5) {
        CurrentWordArr.push(letter);
        const availableSpaceEl = document.getElementById(
          String(gameState.availableSpace)
        );
        gameState.availableSpace = gameState.availableSpace + 1;
        availableSpaceEl.textContent = letter;
      }
    }

    //------------Delete----------------------------
    function handleDeleteLetter() {
      const currentWordArr = getCurrentWordArr();
      const removedLetter = currentWordArr.pop();

      gameState.guessedWords[gameState.guessedWords.length - 1] =
        currentWordArr;

      const lastLetterEl = document.getElementById(
        String(gameState.availableSpace - 1)
      );
      if (lastLetterEl.getAttribute("data-empty") === "true") {
        lastLetterEl.textContent = "";
        gameState.availableSpace = gameState.availableSpace - 1;
      }
    }
    //-----------------------------------------------

    //------------enter------------------------------
    function handleSubmitWord() {
      const currentWordArr = getCurrentWordArr();
      if (currentWordArr.length !== 5) {
        Notify({
          title: "Not enough letters",
          type: "warning",
          position: "top center",
          duration: 2000,
        });
      }

      const currentWord = currentWordArr.join("");

      if (currentWord === word && gameState.guessedWords.length !== 6) {
        Notify({
          title: "Congratulations",
          position: "top center",
          duration: 2000,
        });
        setTimeout(() => {
          sock.emit("winner");
          sock.emit("loser", word);
        }, 1000);
      }
      if (gameState.guessedWords.length === 6) {
        if (currentWord === word) {
          Notify({
            title: "Congratulations",
            position: "top center",
            duration: 2000,
          });
          setTimeout(() => {
            sock.emit("winner");
            sock.emit("loser", word);
          }, 1000);
        } else {
          if (words.includes(currentWord)) {
            Notify({
              title: `You have no more guesses! The word was ${word}`,
              type: "danger",
              position: "top center",
              duration: 6000,
            });
          } else {
            Notify({
              title: "Enter a new word",
              type: "warning",
              position: "top center",
              duration: 2000,
            });
          }
        }
      }

      if (currentWord.length === 5) {
        if (words.includes(currentWord)) {
          sock.emit("currentWordArr", currentWordArr);
          //--------------animations----------------------
          const firstLetterId = gameState.guessedWordCount * 5 + 1;
          const interval = 200;
          currentWordArr.forEach((letter, index) => {
            setTimeout(() => {
              const tileColor = getTileColor(letter, index);
              const letterId = firstLetterId + index;
              const letterEl = document.getElementById(letterId);
              letterEl.classList.add("animate__flipInX");
              letterEl.setAttribute("data-empty", false);
              letterEl.style = `background-color:${tileColor};border-color:${tileColor}`;
            }, interval * index);
          });
          //-----------------------------------------------
          gameState.guessedWordCount += 1;
          if(gameState.guessedWordCount <= 5){
            gameState.guessedWords.push([]);
            saveGameState()
          }
          sock.emit("correct", gameState.guessedWordCount);
        } else {
          if (gameState.guessedWords.length !== 6) {
            Notify({
              title: "Enter a new word",
              type: "warning",
              position: "top center",
              duration: 2000,
            });
          }
        }
      }
    }

    for (let i = 0; i < keys.length; i++) {
      keys[i].onclick = ({ target }) => {
        const letter = target.getAttribute("data-key");
        if (letter === "enter") {
          handleSubmitWord();
          return;
        }

        if (letter === "del") {
          handleDeleteLetter();
          return;
        }

        updateGuessedWords(letter);
      };
    }
  });
});
