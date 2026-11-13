import type { ImageSourcePropType } from 'react-native';

/**
 * Real photos for the Masalah (problems) cards.
 *
 * To add one: put the image in assets/problems/ (e.g. assets/problems/thrush.jpg),
 * then add a line below, e.g.
 *   thrush: { src: require('../../assets/problems/thrush.jpg'), credit: 'Photo: Dr A, CC BY 4.0' },
 *
 * Keys are the problem ids: ecc, colour, late, gaps, natal, pearls, tie, thrush, cyst, injury, suck, grind.
 * A card without a photo shows a soft coloured placeholder.
 */
export const problemPhotos: Partial<Record<string, { src: ImageSourcePropType; credit?: string }>> = {
  ecc: { src: require('../../assets/problems/ecc.jpg') },
  colour: { src: require('../../assets/problems/colour.jpg') },
  late: { src: require('../../assets/problems/late.jpg') },
};
