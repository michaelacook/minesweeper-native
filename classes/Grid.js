class Grid
{

    constructor(rows, cols, mines)
    {
        this.rows = rows;
        this.columns = cols;
        this.spaces = this.createSpaces(this.columns, this.rows);
        this.mines = null;
        this.drawGrid();
        this.addMines(mines);
        this.addBorderingSpacesProperty();
        this.addHasBorderingMinesProperty();
    }


    /**
     * Generate Space objects for grid
     */
    createSpaces(cols, rows)
    {
        const spaces = new Array();
        for (let i = 0; i < rows; i++) {
            const row = new Array();
            for (let j = 0; j < cols; j++) {
                row.push(new Space(j, i));
            }
            spaces.push(row);
        }
        return spaces;
    }


    /**
     * Open all connected spaces on click of empty space
     * @param {Object} space - Space object representing clicked space on grid
     */
    openAdjoiningSpaces(space)
    {
        if (space.isEmpty) {
            let loop = true;
            var toOpen = [ ...this.getBorderingSpaces(space).filter(space => !space.hasMine)];
            while (loop) {
                const next = new Array();
                toOpen.forEach(space => {
                    if (!space.hasMine && space.status !== 'open' && space.isEmpty) {
                        const neighbouring = this.getBorderingSpaces(space);
                        next.push( ...neighbouring);
                    }
                    this.openSpace(space.id);
                });
                if (next.length > 0) {
                    toOpen = next;
                } else {
                    loop = false;
                }
            }
        }
    }


    /**
     * Called when a space is left-clicked
     * Open the space on the grid, set the Space's status property to 'open'
     * @param {String} id - DOM id for target space on grid
     */
    openSpace(id)
    {
        const space = this.getSpaceById(id);
        if (space.status === 'flagged' || space.status === 'questionmark') {
            return;
        }
        const el = document.getElementById(id);
        el.style.border = "1.63px solid #7B7B7B";
        this.drawMine(space);
        this.drawBorderingMinesCount(space);
        space.status = 'open';
    }


    /**
     * Open all spaces containing mines
     * Run on game over
     */
    openAllMines()
    {
        this.mines.forEach(mine => this.openSpace(mine.id));
    }


    /**
     * Generate and render grid html
     */
    drawGrid()
    {
        let grid = "";
        this.spaces.forEach(row => {
            row.forEach(space => grid += `<div class="cell" id=${space.id}></div>`);
            grid += "<br>";
        });
        document.getElementById('grid').innerHTML = grid;
    }


    /**
     * Query grid spaces and return the space matching the given DOM id
     * @param {String} id - DOM id for desired space
     * @return {object} space
     * @return {Bool} false on fail to find space
     */
    getSpaceById(id)
    {
        for (let space of this.flattenedSpaces) {
            if (space.id === id) {
                if (space !== undefined) {
                    return space;
                } else {
                    continue;
                }
            }
        }
        return false;
    }


    /**
     * Get an array of all bordering spaces for a target space
     * @param {Object} space - target Space object
     * @return {Array} bordering
     */
    getBorderingSpaces(space)
    {
        const bordering = new Array();
        [this.getSpaceById(`col-${space.x}-row-${space.y - 1}`),
        this.getSpaceById(`col-${space.x + 1}-row-${space.y - 1}`),
        this.getSpaceById(`col-${space.x + 1}-row-${space.y}`),
        this.getSpaceById(`col-${space.x + 1}-row-${space.y + 1}`),
        this.getSpaceById(`col-${space.x}-row-${space.y + 1}`),
        this.getSpaceById(`col-${space.x - 1}-row-${space.y + 1}`),
        this.getSpaceById(`col-${space.x - 1}-row-${space.y}`),
        this.getSpaceById(`col-${space.x - 1}-row-${space.y - 1}`)
        ].forEach(space => {
            if (space) {
                bordering.push(space);
            }
        });
        return bordering;
    }


    /**
     * Call getBorderingSpaces method on each space on the grid
     */
    addBorderingSpacesProperty()
    {
        this.flattenedSpaces.forEach(space => {
            const bordering = this.getBorderingSpaces(space);
            space.borderingSpaces = bordering;
        });
    }


    /**
     * Call getBorderingSpaces method on each space
     */
    addHasBorderingMinesProperty()
    {
        this.flattenedSpaces.forEach(space => {
            this.getBorderingMineCount(space);
        });
    }


    /**
     * Add number of mines in neighbouring spaces to a space
     * @param {Object} space - target Space object
     */
    getBorderingMineCount(space)
    {
        if (space.hasMine) {
            return;
        } else {
            let mineCount = 0;
            space.borderingSpaces.forEach(space => {
                if (space.hasMine) {
                    mineCount++;
                }
            });
            if (mineCount === 0) {
                space.isEmpty = true;
            } else {
                space.isEmpty = false;
                space.borderingMinesCount = mineCount;
            }
        }
    }


    /**
     * Render mine count for space
     * @param {Object} space - target Space object
     */
    drawBorderingMinesCount(space)
    {
        const mineCount = space.borderingMinesCount;
        if (mineCount > 0) {
            const el = document.getElementById(space.id);
            if (mineCount > 0) {
                const el = document.getElementById(space.id);
                const colors = ['#0E00FB', '#037E00', '#FD0A00', '#040280',
                                '#810202', '#00807F',  'black',  '#808080'];
                el.style.color = colors[mineCount - 1];
                el.textContent = `${mineCount}`;
            }
        }
    }


    /**
     * Render mine on target element
     * @param {Object} space - Space object representing grid space element
     */
    drawMine(space)
    {
        if (space.hasMine) {
            document.getElementById(space.id).classList.add("mine");
        }
    }


    /**
     * Add minestrike to all spaces that were flagged by mistake
     * @return {bool} true
     * Used as condition for highlighting missed mine
     */
    minestrike()
    {
        this.flattenedSpaces.forEach(space => {
            if (space.status == 'flagged' && !space.hasMine) {
                const neighbouring = this.getBorderingSpaces(space);
                const el = document.getElementById(space.id);
                el.classList.remove('flagged');
                el.style.border = "1.63px solid #7B7B7B";
                el.textContent = '';
                el.classList.add('mine-strike');
            }
        });
    }


    /**
     * Flag right-clicked space
     * @param {String} id - DOM id of clicked space
     */
    flagSpace(id)
    {
        const space = this.getSpaceById(id);
        document.getElementById(id).classList.add("flagged");
        space.status = 'flagged';
    }


    /**
     * Question-mark right-clicked space
     * @param {String} id - DOM id of clicked space
     */
    questionMarkSpace(id)
    {
        const space = this.getSpaceById(id);
        document.getElementById(id).classList.remove("flagged")
        document.getElementById(id).classList.add("questionmark");
        space.status = 'questionmark';
    }


    /**
     * Remove question mark from space element
     * @param {String} id - DOM id of target space
     */
    clearSpace(id)
    {
        const space = this.getSpaceById(id);
        document.getElementById(id).classList.remove("questionmark");
        space.status = null;
        space.rightClicks = 0;
    }


    /**
     * Select random spaces to plant mines
     * @param {Number} numberOfMines - the number of mines to plant
     * Add array of mines to mines property on the object
     */
    addMines(numberOfMines)
    {
        const copyOfSpaces = this.flattenedSpaces;
        const mines = new Array();
        for (let i = 0; i < numberOfMines; i++) {
            const randomSpace = copyOfSpaces[Math.floor(Math.random() * copyOfSpaces.length)]
            const space = this.getSpaceById(randomSpace.id);
            space.hasMine = true;
            mines.push(space);
            copyOfSpaces.splice(copyOfSpaces.indexOf(randomSpace), 1);
        }
        this.mines = mines;
    }


    /**
     * Get a one dimensional array of all spaces on the grid
     * @return {Array} flattened
     */
    get flattenedSpaces()
    {
        const flattened = new Array();
        for (let i = 0; i < this.rows; i++) {
            flattened.push(...this.spaces[i]);
        }
        return flattened;
    }
}
