import {
    GAPS,
    NUCLEIC_ACID_RESIDUES,
    TYPE_PROTEIN,
    TYPE_NUCLEIC_ACID
} from './constants.js';


/**
 * Parses the table data
 *
 * @export
 * @param {Array} data Table data
 * @returns {Array} Residue counts for each column in the alignment
 */
export function parseData(data) {
    const columnResidueCounts = [];
    data.forEach((row) => {
        const position = row.dimensions[0]; // One-based alignment column index
        const residue = row.dimensions[1].toUpperCase(); // One letter residue code (uppercase or lowecase) or gap (`-` or `.`)
        const count = row.metrics[0]; // Residue count in the current column

        const i = position - 1; // Zero-based alignment column index
        if (columnResidueCounts[i]) {
            columnResidueCounts[i].push([residue, count]);
        } else {
            columnResidueCounts[i] = [[residue, count]];
        }
    });

    return columnResidueCounts;
};


/**
 * Calculates the information content for each position in the alignment
 * as described in https://en.wikipedia.org/wiki/Sequence_logo#Logo_creation
 *
 * @export
 * @param {Array} columnResidueCounts Residue counts for each column in the alignment
 * @param {string} sequenceType Protein or nucleic acid?
 * @param {number} sequenceCount Number of sequences aligned
 * @returns {Array} Information content for each column in the alignment
 */
export function getColumnInformationContent(columnResidueCounts, sequenceType, sequenceCount) {
    const s = sequenceType === TYPE_PROTEIN ? 20 : 4;
    const e_n = 1 / Math.log(2) * (s - 1) / (2 * sequenceCount); // Small-sample correction

    const columnInformationContent = columnResidueCounts.map((residueCounts) => {
        const H = residueCounts.reduce((H, [residue, residueCount]) => { // Uncertainty (Shannon entropy) of the current column
            const f = residueCount / sequenceCount; // Relative frequency of residue in the current column

            return H - f * Math.log2(f);
        }, 0);

        return Math.log2(s) - (H + e_n);
    });

    return columnInformationContent;
}


/**
 * Sorts residue counts in the ascending order
 *
 * @export
 * @param {Array} residueCounts Residue counts for an individual column
 * @returns {Array} Residue counts for an individual column, sorted
 */
export function sortResidueCounts(residueCounts) {
    const residueCountsAscending = [...residueCounts];
    residueCountsAscending.sort((a, b) => a[1] - b[1]);

    return residueCountsAscending;
}


/**
 * Calculates the number of sequences aligned
 *
 * @export
 * @param {Array} columnResidueCounts Residue counts for each column in the alignment
 * @returns {number} Number of sequences in the alignment (number of rows)
 */
export function getSequenceCount(columnResidueCounts) {
    let sequenceCount = 0;
    columnResidueCounts.forEach((residueCounts) => {
        sequenceCount = Math.max(sequenceCount, residueCounts.reduce((sum, [residue, count]) => sum + count, 0));
    });
    return sequenceCount;
}


/**
 * Infers the type of sequences aligned
 *
 * @export
 * @param {Array} columnResidueCounts Residue counts for each column in the alignment
 * @returns {string} Protein or nucleic acid?
 */
export function determineSequenceType(columnResidueCounts) {
    let acgtCount = 0;
    let nonAcgtCount = 0;

    columnResidueCounts.forEach((residueCounts) => {
        residueCounts.forEach(([residue, count]) => {
            if (!GAPS.includes(residue)) {
                if (NUCLEIC_ACID_RESIDUES.includes(residue)) {
                    acgtCount += count;
                } else {
                    nonAcgtCount += count;
                }
            }
        });
    });

    return acgtCount > nonAcgtCount ? TYPE_NUCLEIC_ACID : TYPE_PROTEIN;
}
