const HORIZONTAL = 1;
const VERTICAL = 1;

class CrosswordStore {
    constructor() {
        this.data = null;
        this.loaded = false;
        this.direction = HORIZONTAL;
        this.position = {'x' : 0, 'y' : 0};
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

            console.log(this.data);

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
    }

    fillPuzzle(){
        const svgContent = this.data.body[0].SVG;

        var svgObject = this.createBoardFromJSON(svgContent, 'http://www.w3.org/2000/svg');

        // Add the SVG to the div
        
        console.log(svgObject);
        $('.xwd__board--content').append(svgObject);
        
        // Fill with context
        this.fillBoardContext();
    }

    fillBoardContext(){
            const cellsGroup = $('g[data-group="cells"]');
            const cellGroups = cellsGroup.children('g');

            cellGroups.each(function(index) {
                const $rect = $(this).find('rect').first();
                $rect.attr('id', `cell-id-${index}`);
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
                <li class="xwd__clue--li" data-direction="0" data-position="${clueID}">
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
                <li class="xwd__clue--li" data-direction="1" data-position="${clueID}">
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
            console.log("...")
            console.log($(`#cell-id-${cellID}`))
        }

        console.log(cells)

    }

    createCallbacks(){
    }

    getClue(row, col) {
        if (!this.loaded) throw new Error('Data not loaded');
        return this.data.clues[row][col];
    }

    getSolution(row, col) {
        if (!this.loaded) throw new Error('Data not loaded');
        return this.data.solutions[row][col];
    }

    isCorrect(row, col, answer) {
        return this.getSolution(row, col) === answer.trim().toUpperCase();
    }
}

(async () => {
    const crosswordStore = new CrosswordStore();
    await crosswordStore.loadData();
    await crosswordStore.initialize();
})();
