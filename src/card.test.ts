import {describe, expect, test} from '@jest/globals';
import { determineFrontFromHeadings, getAllHeadings } from './card';
import { assert } from 'console';

describe('Card', () => {
  test('determineFrontFromHeadings', () => {
    var headings = ["# Heading 1", "## Heading 2", "### Heading 3", "#### Heading 4"];
    var heading = "### Heading 3";

    var result = determineFrontFromHeadings(headings, heading);
    expect(result).toBe("Heading 1 -> Heading 2 -> Heading 3");

    var headings = ["# Heading 1", "## Heading 2.0", "## Heading 2.1" ,"### Heading 3", "#### Heading 4"];
    var result = determineFrontFromHeadings(headings, heading);
    expect(result).toBe("Heading 1 -> Heading 2.1 -> Heading 3");
  });

  test('getAllHeadings', () => {
    const text = `# Heading 1
## Heading 2.0
## Heading 2.1
### Heading 3
# Heading 1.1
### Heading 3.1 `

    var result = getAllHeadings(text);
    expect(result).toEqual(["# Heading 1", "## Heading 2.0", "## Heading 2.1" ,"### Heading 3", "# Heading 1.1", "### Heading 3.1" ])
  });
});