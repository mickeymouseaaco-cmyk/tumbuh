import type { ImageSourcePropType } from 'react-native';

/**
 * Real photos for the Masalah (problems) cards.
 *
 * To add one: put the image in assets/problems/ (e.g. assets/problems/thrush.jpg),
 * then add a line below, e.g.
 *   thrush: { src: require('../../assets/problems/thrush.jpg'), credit: 'Photo: Dr A, CC BY 4.0' },
 *
 * Keys are the problem ids (lib/content.ts → problems). cyst and pearls are kept in content but not shown.
 * A card without a photo shows a soft coloured placeholder.
 */
export const problemPhotos: Partial<Record<string, { src: ImageSourcePropType; credit?: string }>> = {
  ecc: { src: require('../../assets/problems/ecc.jpg') },
  colour: { src: require('../../assets/problems/colour.jpg') },
  late: { src: require('../../assets/problems/late.jpg') },
  gaps: { src: require('../../assets/problems/gaps.jpg') },
  tie: { src: require('../../assets/problems/tie.jpg') },
  natal: { src: require('../../assets/problems/natal.jpg') },
  thrush: { src: require('../../assets/problems/thrush.jpg') },
  grind: { src: require('../../assets/problems/grind.jpg') },
  injury: { src: require('../../assets/problems/injury.jpg') },
  suck: { src: require('../../assets/problems/suck.jpg') },
  abscess: { src: require('../../assets/problems/abscess.jpg') },
  mucocele: { src: require('../../assets/problems/mucocele.jpg') },
  mih: { src: require('../../assets/problems/mih.jpg') },
  phgs: { src: require('../../assets/problems/phgs.jpg') },
};
