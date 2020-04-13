class Space
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
        this.id = `col-${x}-row-${y}`;
        this.hasMine = false;
        this.rightClicks = 0;
        this.status = null;
    }
}
