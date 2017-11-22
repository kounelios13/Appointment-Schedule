/**
 * @module card-utilities
 */



/**
 * Add gradient to a material card
 * @param {string} cardId The id of the card
 * @param {string} gradientClassName The classname of the gradient you want to add
 * @param {boolean} [colorizeActions] If true the gradient will be added to the whole card not just the card contents
 * @param {string[]} classesToRemove Specify which classes to remove for the gradient to take effect on the card-action div
 */
function colorizeCard(cardId, gradientClassName, colorizeActions, classesToRemove) {
    //This will be a useful function when I add the ability for a user to choose a gradient background for their cards
    //Maybe in a future release
    const card = document.getElementById(cardId);
    const cardRow = card.firstElementChild;
    const cardContents = cardRow.firstElementChild;
    if (colorizeActions) {

        if (classesToRemove && Array.isArray(classesToRemove)) {
            cardRow.classList.remove(...classesToRemove);
        }
        cardRow.classList.add(gradientClassName);
    } else {
        cardContents.classList.add(gradientClassName);
    }
}
/**
 * Creates a materialize css card
 * @param {object} options 
 * @property {string} id An id for the card
 * @property {string} [color] A text color
 */
function createCard(options, output) {
    let infoMarkup = null;
    if (options.info) {
        infoMarkup = `
            <div class='divider'></div>
            <p class='extra-info'>${options.info}</p>
        `;
    }
    let template = `
    
    <div class='col s12 m12 xl12 appointment-card' id=${options.id}>
        <div class='card blue-grey darken-1'>
            <div class='card-content white-text'>
                <div class = 'card-title'>
                    Appointment for ${options.executionDate}
                </div>
                <span class='appointment-room'>Room : ${options.room}</span>
                    ${infoMarkup || ""}
            </div>
            <div class='center-align card-action'>
                <a href='#' class='cancel-btn' click='cancelAppointment(${options.id})'>Cancel Appointment</a>
                <a href='#' class='complete-btn' click='completeAppointment(${options.id})'>Complete appointment</a>
            </div>
        </div>
    </div>
    `;
    const outputNode = document.getElementById(output);
    const fragment = document.createDocumentFragment();
    const row = document.createElement('div');
    row.classList.add('row');
    row.insertAdjacentHTML('beforeEnd', template);
    fragment.appendChild(row);
    if (outputNode) {
        outputNode.appendChild(fragment);
    } else {
        throw new Error(`Div with id ${output} couldn't be found.`);
    }

}

/**
 * Adds relevant listeners for dragging to a card
 * @param {string} id The id of the card 
 * @param {Function} callback What to do when a card is being dragged 
 */
function makeCardDraggable(id, callback) {
    //@TODO
    //Implement all drag and drop handlers 
    //@TODO
    //When dragging an element makethe element leave its original position
    //and disable the ghost image
    
}

module.exports = {
    createCard,
    colorizeCard,
    makeCardDraggable
};