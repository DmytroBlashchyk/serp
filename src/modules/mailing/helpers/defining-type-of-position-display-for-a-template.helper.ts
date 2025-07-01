/**
 * Determines the display type for a given position in a template.
 *
 * @param {string} position - The position code to evaluate.
 * @return {string} Returns a modified position string based on the specified rules.
 */
export function definingTypeOfPositionDisplayForATemplateHelper(
  position: string,
): string {
  return position == '101' ? '> 100' : position;
}
