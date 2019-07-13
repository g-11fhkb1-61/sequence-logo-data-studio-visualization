const d3 = require('d3');


/**
 * Renders error message
 *
 * @export
 */
export function onError() {
    clear();

    const readmeDiv = document.createElement('div');
    readmeDiv.innerHTML = `
        <p>
            The sequence logo diagram encountered an error.
            <ol>
                <li>Make sure that you provide the position and residue dimensions and counts metric.</li>
                <li>Consult the <a target="_new" href="https://github.com/cofactor-io/sequence-logo-data-studio-visualization">README</a>.</li>
            </ol>
        </p>
    `;
    document.body.appendChild(readmeDiv);
};


/**
 * Clears the page
 *
 * @export
 */
export function clear() {
    document.body.innerHTML = '';
}


/**
 * Removes the body padding and margin
 *
 * @export
 */
export function resetBody() {
    d3
        .select('body')
        .style('padding', 0)
        .style('margin', 0)
        .style('overflow', 'hidden');
}
