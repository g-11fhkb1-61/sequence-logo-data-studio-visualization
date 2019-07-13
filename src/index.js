const dscc = require('@google/dscc');
const d3 = require('d3');
import { clear, onError, resetBody } from './utils.js';
import {
    parseData,
    getColumnInformationContent,
    sortResidueCounts,
    getSequenceCount,
    determineSequenceType
} from './process-data.js';
import { GAPS } from './constants.js';
import glyphs from './glyphs.json';
import colors from './colors.json';

/**
 * Chart rendering logic
 *
 * @param {object} message
 */
function draw(message) {
    clear();
    resetBody();

    const columnResidueCounts = parseData(message.tables.DEFAULT); // Residue counts for each alignment column
    const sequenceType = determineSequenceType(columnResidueCounts); // Protein or nucleic acid?
    const sequenceCount = getSequenceCount(columnResidueCounts); // Number of sequences aligned
    const columnInformationContent = getColumnInformationContent(columnResidueCounts, sequenceType, sequenceCount); // Information content of each column
    const columns = columnResidueCounts.length; // Number of columns

    let maxInformationContent = 0;
    columnInformationContent.forEach((height) => {
        maxInformationContent = Math.max(maxInformationContent, height);
    });

    const margin = { left: 50, right: 20, top: 20, bottom: 20 };
    const fullWidth = dscc.getWidth();
    const fullHeight = dscc.getHeight();
    const width = fullWidth - margin.left - margin.right;
    const height = fullHeight - margin.top - margin.bottom;

    // Parent SVG element
    const svg = d3
        .select('body')
        .append('svg')
        .attr('viewBox', `0 0 ${fullWidth} ${fullHeight}`)
        .style('width', fullWidth)
        .style('height', fullHeight)
        .style('position', 'fixed')
        .style('top', 0)
        .style('left', 0);

    const innerArea = svg
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Axes
    var xScale = d3
        .scaleBand()
        .domain(d3.range(1, columns + 1, 1))
        .range([0, width]);

    const yScale = d3
        .scaleLinear()
        .domain([0, maxInformationContent])
        .range([height, 0]);

    var xAxis = d3
        .axisBottom()
        .scale(xScale);

    const yAxis = d3
        .axisLeft()
        .scale(yScale);

    innerArea
        .append('g')
        .attr('transform', `translate(0, ${height})`)
        .style('font-size', 8)
        .call(xAxis);

    innerArea
        .append('g')
        .style('font-size', 8)
        .call(yAxis);


    const columnWidth = width / columns; // Column width

    // Letters
    columnResidueCounts.forEach((residueCounts, i) => {
        const columnHeight = columnInformationContent[i] * height / maxInformationContent;

        const columnElement = innerArea
            .append('g')
            .attr('transform', `translate(${i * columnWidth}, 0)`);

        const residueCountsAscending = sortResidueCounts(residueCounts);

        let y = height; // Starting at the bottom of the column
        residueCountsAscending.forEach(([residue, residueCount]) => {
            if (GAPS.includes(residue)) return; // Not rendering gap symbols

            const glyph = glyphs[residue] || glyphs['?']; // `?` fallback glyph
            const color = colors[sequenceType][residue] || '#cccccc'; // Gray fallback color

            const residueHeight = residueCount * columnHeight / sequenceCount;

            columnElement
                .append('g')
                .attr('transform', `translate(0, ${y})`)
                .append('g')
                .attr('transform', `scale(${columnWidth / glyph.bb.w}, ${residueHeight / glyph.bb.h})`)
                .append('path')
                .attr('d', glyph.d)
                .style('fill', color)
                .attr('transform', `scale(1, -1) translate(${-glyph.bb.x}, ${-glyph.bb.y})`);

            y -= residueHeight;
        });
    });
};

/**
 * Re-renders the chart
 *
 * @param {object} message
 */
function drawViz(message) {
    try {
        draw(message);
    } catch (err) {
        onError();
    }
};

dscc.subscribeToData(drawViz, { transform: dscc.objectTransform });
