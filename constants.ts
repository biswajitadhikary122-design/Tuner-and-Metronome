import React from 'react';
import type { IconProps } from './components/Icons';
import { 
    SubdivisionQuarter, SubdivisionTwoEighths, SubdivisionTriplet, SubdivisionSixteenths,
    SubdivisionEighthTwoSixteenths, SubdivisionTwoSixteenthsEighth, SubdivisionDottedEighthSixteenth, 
    SubdivisionEighthRestEighth, SubdivisionShuffle, SubdivisionSixteenthEighthSixteenth,
    SubdivisionQuintuplet, SubdivisionSextuplet, SubdivisionSeptuplet, SubdivisionThirtySecond
} from './components/Icons';
// Re-export all pure data from the new file
export * from './services/data';


export const SUBDIVISIONS_DATA: { id: string; Icon: React.FC<IconProps>; name: string }[] = [
    { id: 'quarter', Icon: SubdivisionQuarter, name: 'Quarter Note' },
    { id: 'eighth', Icon: SubdivisionTwoEighths, name: 'Eighth Notes' },
    { id: 'triplet', Icon: SubdivisionTriplet, name: 'Triplets' },
    { id: 'sixteenth', Icon: SubdivisionSixteenths, name: 'Sixteenth Notes' },
    { id: 'thirty-second', Icon: SubdivisionThirtySecond, name: '32nd Notes' },
    { id: 'quintuplet', Icon: SubdivisionQuintuplet, name: 'Quintuplets' },
    { id: 'sextuplet', Icon: SubdivisionSextuplet, name: 'Sextuplets' },
    { id: 'septuplet', Icon: SubdivisionSeptuplet, name: 'Septuplets' },
    { id: 'shuffle', Icon: SubdivisionShuffle, name: 'Shuffle' },
    { id: 'dotted-eighth-sixteenth', Icon: SubdivisionDottedEighthSixteenth, name: 'Dotted 8th & 16th' },
    { id: 'eighth-two-sixteenths', Icon: SubdivisionEighthTwoSixteenths, name: 'Eighth & 2 Sixteenths' },
    { id: 'two-sixteenths-eighth', Icon: SubdivisionTwoSixteenthsEighth, name: '2 Sixteenths & Eighth' },
    { id: 'sixteenth-eighth-sixteenth', Icon: SubdivisionSixteenthEighthSixteenth, name: 'Syncopated 16ths' },
    { id: 'eighth-rest-eighth', Icon: SubdivisionEighthRestEighth, name: 'Eighth Rest & Eighth' },
];