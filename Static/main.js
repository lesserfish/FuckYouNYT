const ACROSS = 0;
const DOWN = 1;

class CrosswordStore {
    constructor() {
        this.data = null;
        this.loaded = false;
        this.direction = ACROSS;
        this.currentCell = -1;
        this.clueCells = [];
    }

    async loadData() {
        try {
            const response = await fetch("./mini.json", {
                headers: {
                    // Some APIs require specific headers
                    'Accept': 'application/json',
                }
            });
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            this.data = await response.json();
            this.loaded = true;

        } catch (error) {
            console.error('Failed to load crossword data:', error);
            throw error;
        }
    }
    
    async initialize(){
        this.fillHTML()
        this.createCallbacks();
    }

    fillHTML() {
        this.fillMetadata();
        this.fillPuzzle();
        this.fillHints();
    }

    fillMetadata() {
        // Fills date
        $('.xwd__details--date').text(new Date(this.data.publicationDate+ 'T00:00:00').toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'}).replace(/(\d+)/, (_, day) => day + (['th','st','nd','rd'][parseInt(day)%10] || 'th')));
        // Fills constructor
        $('.xwd__details--byline span').text(this.data.constructors[0]);

        // Menu buttons
        const $toolbar = $(".xwd__toolbar--expandedMenu");

        // Button click (toggle its own menu)
        $toolbar.on("click", ".xwd__tool--button > button", function (e) {
          e.stopPropagation();

          const $menu = $(this).siblings(".xwd__menu--container");
          const isVisible = $menu.css("visibility") === "visible";

          // Hide all menus first
          $(".xwd__menu--container").css("visibility", "hidden");

          // Toggle: if not visible, show it
          if (!isVisible) {
            $menu.css("visibility", "visible");
          }
        });

        // Click outside: close everything
        $(document).on("click", function (e) {
          if (!$(e.target).closest(".xwd__tool--button").length) {
            $(".xwd__menu--container").css("visibility", "hidden");
          }
        });
    }

    fillPuzzle(){
        const svgContent = this.data.body[0].SVG;

        var svgObject = this.createBoardFromJSON(svgContent, 'http://www.w3.org/2000/svg');

        // Add the SVG to the div
        
        $('.xwd__board--content').append(svgObject);
        
        // Fill with context
        this.fillBoardContext();
    }

    fillBoardContext(){
            const classInstance = this;
            const cellsGroup = $('g[data-group="cells"]');
            const cellGroups = cellsGroup.children('g');

            cellGroups.each(function(index) {
                const $rect = $(this).find('rect').first();
                var cellID = index;

                // add id to the rect.
                $rect.attr('id', `cell-id-${cellID}`);

                // Add click functionality
                $(this).attr('g_cell_id', cellID);
                $(this).css('pointer-events', 'all');
                $(this).on('click', function() {
                    var target = $(event.currentTarget);
                    classInstance.handleRectClick(target);
                });
            });
    }

    createBoardFromJSON(jsonObj, namespace) {
        const isSVG = ['svg', 'g', 'defs', 'line', 'polygon', 'circle', 'rect', 'path', 'text'].includes(jsonObj.name);
        const elementNS = isSVG ? 'http://www.w3.org/2000/svg' : namespace;
        
        let $element;
        if (elementNS) {
            // Create element with namespace
            $element = $(document.createElementNS(elementNS, jsonObj.name));
        } else {
            $element = $('<' + jsonObj.name + '>');
        }
        
        // Add attributes
        if (jsonObj.attributes) {
            jsonObj.attributes.forEach(attr => {
                $element.attr(attr.name, attr.value);
            });
        }
        
        // Add styles
        if (jsonObj.styles) {
            const styles = {};
            jsonObj.styles.forEach(style => {
                styles[style.name] = style.value;
            });
            $element.css(styles);
        }
        
        // Add content
        if (jsonObj.content) {
            $element.text(jsonObj.content);
        }
        
        // Recursively process children
        if (jsonObj.children) {
            jsonObj.children.forEach(child => {
                const $childElement = this.createBoardFromJSON(child, elementNS);
                $element.append($childElement);
            });
        }
        
        return $element;
    }

    fillHints(){
        // Fill Across Hints

        var hintCount = this.data.body[0].clueLists[0].clues.length;
        for(var index = 0; index < hintCount; index++){
            var clueID = this.data.body[0].clueLists[0].clues[index];
            var clue = this.data.body[0].clues[clueID];

            const listItem = $(`
                <li class="xwd__clue--li" data-direction="0" data-position="${clueID}" id="clue-id-${clueID}">
                  <span class="xwd__clue--label">${clue.label}</span>
                  <span class="xwd__clue--text xwd__clue-format">${clue.text[0].plain}</span>
                </li>
                `);
                
            // Use arrow function or bind to preserve context
            listItem.on('click', (event) => {
                    var target = $(event.currentTarget);
                    this.handleHintClick(target)
                });
            
            // Append the list item to the ordered list
            $('.xwd__clue-list--list.xwd__clue-list--obscured').eq(0).append(listItem);

            // TODO: ADD CLICK FUNCTIONALITY TO THIS ENTRY.
        }

        // Fill Down hints
        var hintCount = this.data.body[0].clueLists[1].clues.length;
        for(var index = 0; index < hintCount; index++){
            var clueID = this.data.body[0].clueLists[1].clues[index];
            var clue = this.data.body[0].clues[clueID];

            const listItem = $(`
                <li class="xwd__clue--li" data-direction="1" data-position="${clueID}" id="clue-id-${clueID}">
                  <span class="xwd__clue--label">${clue.label}</span>
                  <span class="xwd__clue--text xwd__clue-format">${clue.text[0].plain}</span>
                </li>
                `);
                
            // Use arrow function or bind to preserve context
            listItem.on('click', (event) => {
                    var target = $(event.currentTarget);
                    this.handleHintClick(target)
                });
            
            // Append the list item to the ordered list
            $('.xwd__clue-list--list.xwd__clue-list--obscured').eq(1).append(listItem);
            
            // TODO: ADD CLICK FUNCTIONALITY TO THIS ENTRY.
        }

        // Make all hints visible

        $('.xwd__clue-list--list.xwd__clue-list--obscured').removeClass('xwd__clue-list--obscured');
    }

    handleHintClick(target) {
        var direction = target.data("direction");
        var clueID = target.data("position");

        // Select the current hint
        $('ol.xwd__clue-list--list li').removeClass('xwd__clue--selected');
        $(target).addClass('xwd__clue--selected')

        // Highlight the associated squares.
        $('[id^="cell-id-"]').removeClass('xwd__cell--highlighted');

        var clue = this.data.body[0].clues[clueID];
        var cells = clue.cells;

        for(var i = 0; i < cells.length; i++){
            var cellID = cells[i];
            $(`#cell-id-${cellID}`).addClass('xwd__cell--highlighted');
        }

        // Select the first square of the hint
        var currentCell = cells[0];
        this.currentCell = currentCell;
        $('[id^="cell-id-"]').removeClass('xwd__cell--selected');
        $(`#cell-id-${currentCell}`).addClass('xwd__cell--selected');

        this.clueCells = cells;

        this.direction = direction;
    }

    handleRectClick(target){
        var target = target;
        var cellID = $(target).attr("g_cell_id");
        const rect = $(target).find('rect').first();

        var cellInfo = this.data.body[0].cells[cellID];

        if(Object.keys(cellInfo).length != 0){

            if(this.currentCell == cellID) {
                if(this.direction == ACROSS){
                    this.direction = DOWN;
                } else {
                    this.direction = ACROSS;
                }
            }

            this.currentCell = cellID;
            this.highlightCell(cellID);
        }
    }

    getCellText(cellID){
        var target = $(`g[g_cell_id="${cellID}"]`);
        const textElements = target.find('text');

        
        let targetTextElement;
        if (textElements.length == 0){
            console.error("Failed to find cell")
            return "";
        }

        if (textElements.length >= 2) {
            targetTextElement = textElements.eq(1); // Get the second text element
        } else if (textElements.length === 1) {
            targetTextElement = textElements.eq(0); // Get the first (and only) text element
        } 

        return targetTextElement.text();

    }

    setCellText(cellID, char){
        var target = $(`g[g_cell_id="${cellID}"]`);
        const textElements = target.find('text');

        
        let targetTextElement;
        if (textElements.length == 0){
            console.error("Failed to find cell")
            return;
        }

        if (textElements.length >= 2) {
            targetTextElement = textElements.eq(1); // Get the second text element
        } else if (textElements.length === 1) {
            targetTextElement = textElements.eq(0); // Get the first (and only) text element
        } 

        targetTextElement.text(char);

        $(`#cell-id-${cellID}`).removeClass('xwd__assistance--wrong');
        $(`#cell-id-${cellID}`).removeClass('xwd__assistance--confirmed');
    }

    handleKeyDown(event){
        if(this.currentCell > -1){
            var char = event.key.toUpperCase();
            this.setCellText(this.currentCell, char);
            this.nextCell();

            this.checkGameOver();
        }
    }

    handleBackspace(){
        if(this.currentCell > -1){
            this.setCellText(this.currentCell, "");
            this.previousCell();
        }
    }

    nextCell(){
        const mod = (a, b) => ((a % b) + b) % b;
        var dimensions = this.data.body[0].dimensions;
        if(this.clueCells.length > 0){
            var currentIndex = this.clueCells.findIndex(cell => cell == this.currentCell);
            var nextIndex = mod((currentIndex + 1), this.clueCells.length)
            var nextCellID = this.clueCells[nextIndex];
            
            this.currentCell = nextCellID;
            this.highlightCell(nextCellID);
        }
    }

    previousCell(){
        const mod = (a, b) => ((a % b) + b) % b;
        var dimensions = this.data.body[0].dimensions;
        if(this.clueCells.length > 0){
            var currentIndex = this.clueCells.findIndex(cell => cell == this.currentCell);
            var nextIndex = mod((currentIndex - 1), this.clueCells.length)
            console.log(nextIndex);
            var nextCellID = this.clueCells[nextIndex];
            
            this.currentCell = nextCellID;
            this.highlightCell(nextCellID);
        }
    }

    highlightCell(cellID){
        var rect = $(`#cell-id-${cellID}`);
        var cellInfo = this.data.body[0].cells[cellID];

        // Highlight selected cell
        $('[id^="cell-id-"]').removeClass('xwd__cell--selected');
        $(rect).addClass('xwd__cell--selected');

        // Highlight clues
        const cellClue = cellInfo.clues[this.direction];

        $('ol.xwd__clue-list--list li').removeClass('xwd__clue--selected');
        $(`#clue-id-${cellClue}`).addClass('xwd__clue--selected');

        // Highlight clue cells
        var clueCells = this.data.body[0].clues[cellClue].cells;
        this.clueCells = clueCells;

        $('[id^="cell-id-"]').removeClass('xwd__cell--highlighted');

        for(var i = 0; i < clueCells.length; i++){
            var clueCellID = clueCells[i];
            $(`#cell-id-${clueCellID}`).addClass('xwd__cell--highlighted');
        }
    }

    createCallbacks(){
        var classInstance = this;
        $(document).on('keydown', function(e) {
            if (e.key.length === 1) {
                classInstance.handleKeyDown(e);
            }
            if (e.key === 'Backspace') {
                classInstance.handleBackspace(); // Allow backspace to work normally
            }
        })   
        $('#check-square').on('click', function() { 
            classInstance.assistCheckCurrentSquare();
        });
        $('#check-word').on('click', function() {
            classInstance.assistCheckCurrentWord();
        });
        $('#check-puzzle').on('click', function() {
            classInstance.assistCheckPuzzle();
        });


        $('#reveal-square').on('click', function() { 
            classInstance.assistRevealCurrentSquare();
        });
        $('#reveal-word').on('click', function() { 
            classInstance.assistRevealCurrentWord();
        });
        $('#reveal-puzzle').on('click', function() { 
            classInstance.assistRevealPuzzle();
        });
    }

    assistRevealCurrentSquare() {
        if (this.currentCell > -1){
            this.assistRevealSquare( this.currentCell );
        }
    }
    assistRevealCurrentWord() {
        for(var i = 0; i < this.clueCells.length; i++) {
            this.assistRevealSquare(this.clueCells[i]);
        }
    }

    assistRevealSquare(cellID) {
        var cellInfo = this.data.body[0].cells[cellID];
        var correctText = cellInfo.answer;
        this.setCellText(cellID, correctText);
        this.assistCheckSquare(cellID);

        this.checkGameOver();
    }

    assistRevealPuzzle() {
        var allCells = this.data.body[0].cells;
        for(var i = 0; i < allCells.length; i++) {
            var cellInfo = allCells[i];
            if(Object.keys(cellInfo).length != 0){
                this.assistRevealSquare(i);
            }
        }
    }

    assistCheckSquare(cellID) {
        if( this.checkSquare(cellID) ) {
            $(`#cell-id-${cellID}`).addClass('xwd__assistance--confirmed');
            $(`#cell-id-${cellID}`).removeClass('xwd__assistance--wrong');
        } else {
            $(`#cell-id-${cellID}`).addClass('xwd__assistance--wrong');
            $(`#cell-id-${cellID}`).removeClass('xwd__assistance--confirmed');
        }
        
    }

    assistCheckPuzzle() {
        var allCells = this.data.body[0].cells;
        for(var i = 0; i < allCells.length; i++) {
            var cellInfo = allCells[i];
            if(Object.keys(cellInfo).length != 0){
                this.assistCheckSquare(i);
            }
        }
    }
    assistCheckCurrentWord() {
        for(var i = 0; i < this.clueCells.length; i++) {
            this.assistCheckSquare(this.clueCells[i]);
        }
    }

    checkSquare(cellID) {
        var cellInfo = this.data.body[0].cells[cellID];
        var cellText = this.getCellText(cellID);
        var correctText = cellInfo.answer;

        return (cellText == correctText) 
    }

    assistCheckCurrentSquare() {
        if(this.currentCell > -1){
            this.assistCheckSquare(this.currentCell)
        }
    }

    isPuzzleDone(){
        var allCells = this.data.body[0].cells;
        for(var i = 0; i < allCells.length; i++) {
            var cellInfo = allCells[i];
            if(Object.keys(cellInfo).length != 0){
                if( ! this.checkSquare(i) ){
                    return false;
                }
            }
        }
        return true;
    }

    checkGameOver(){
        if( this.isPuzzleDone() ){
            alert("Game Over!")
        }
    }
}

(async () => {
    const crosswordStore = new CrosswordStore();
    await crosswordStore.loadData();
    await crosswordStore.initialize();
})();
