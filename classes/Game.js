class Game
{

    constructor()
    {
        this.timerStarted = false;
        this.flaggedMines = 0; // whenever a bomb is flagged
        this.flags = 0; // whenever a flag is used
        this.start(); // automatically start game on page load
    }


    /**
     * Initialize game
     * @param {Object} difficulty - object containing difficulty settings
     * Default difficulty is beginner
     */
    start(difficulty = beginner)
    {
        const {rows, columns, mines} = difficulty;
        this.grid = new Grid(rows, columns, mines);
        this.active = true;
        this.flaggedMines = 0; // whenever a bomb is flagged
        this.flags = 0; // whenever a flag is used
        this.mines = mines;
        this.updateMineCount();
    }


    /**
     * Checks game over, toggles smiley button classes
     * Highlights last clicked space red
     * @param {Object} space - last clicked space object
     */
    checkForGameOver(space)
    {
        if (space.hasMine) {
            this.stopTimer();
            this.active = false;
            this.grid.minestrike();
            this.grid.openAllMines(space);
            document.getElementById('game-status').classList.remove('smiley');
            document.getElementById('game-status').className = 'lose-smiley';
            document.getElementById(space.id).style.backgroundColor = '#FF0A00';
            return true;
        }
    }


    /**
     * Checks for a win, toggle class for smiley button
     * Win happens when all non-mine spaces have a status of "open"
     */
    checkForWin()
    {
        const openNonMines = this.grid.flattenedSpaces
            .filter(space => !space.hasMine && !space.status);
        if (openNonMines.length > 0) return;
        this.stopTimer();
        this.active = false;
        document.getElementById('game-status').classList.remove('smiley');
        document.getElementById('game-status').className = 'win-smiley';
    }


    /**
     * Assign flagged or question mark status on right click
     * Calls checkForWin method
     * @param {String} id - DOM id of clicked space
     */
    handleRightClicks(id)
    {
        const space = this.grid.getSpaceById(id);
        if (space.status === 'open') {
            return;
        } else {
            space.rightClicks++;
            if (space.rightClicks === 1) {
                this.grid.flagSpace(id);
                this.flags++;
                if (space.hasMine) {
                    this.flaggedMines++;
                }
            } else if (space.rightClicks === 2) {
                this.flags--;
                if (space.hasMine) {
                    this.flaggedMines--;
                }
                this.grid.questionMarkSpace(id);
            } else if (space.rightClicks === 3) {
                this.grid.clearSpace(id);
            }
        }
        this.updateMineCount();
    }


    /**
     * Calls appropriates methods on left and right clicks
     * @param {Object} event - browser event
     */
    handleClick(event)
    {
        if (this.active) {
            if (event.type === 'contextmenu') {
                this.handleRightClicks(event.target.id);
                this.checkForWin();
            } else if (event.type === 'click') {
               const space = this.grid.getSpaceById(event.target.id);
               if (space.status == null) {
                   this.grid.openSpace(space.id);
                   if (this.checkForGameOver(space)) {
                       return;
                   }
                   this.grid.openAdjoiningSpaces(space);
                   this.checkForWin()
                }
            }
        }
    }


    /**
     * Update mine count visual display
     */
    updateMineCount()
    {
        const count = this.mines - this.flags;
        let display;
        if (count < 0) {
            display = `-${count > -10 ? "0" : ""}${count * -1}`;
        } else {
            display = `${count > 9 ? "0" : "00"}${count}`;
        }
        document.getElementById('mineCount').innerHTML = display;
    }


    /**
     * Stop game timer
     */
    stopTimer()
    {
        this.timerStarted = false;
        clearInterval(this.timerID);
    }


    /**
     * Start game timer
     */
    startTimer() {
        let seconds = 1;
        this.timerStarted = true;
        this.timerID = setInterval(() => {
            const el = document.getElementById('timer');
            if (seconds < 10) {
                el.innerHTML = `00${seconds}`;
            } else if (seconds < 100) {
                el.innerHTML = `0${seconds}`;
            } else {
                el.innerHTML = seconds;
            }
            if (seconds === 999) {
                clearInterval(this.timerID);
            }
            seconds++;
        }, 1000);
    }
}
