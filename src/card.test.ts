import {describe, expect, test} from '@jest/globals';
import { backAsHtml, determineFrontFromHeadings, inlineImages, getAllHeadings, replaceMath, extractCardInfo } from './card';


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

  test('backAsHtml', () => {
      const text = `# Heading
some text
![[./image/path.png]]

$$ x^2 $$
      
inline math $x^2$
      `
      const result = backAsHtml(text)
      expect(result).toBe(`<h1 id=\"heading\">Heading</h1>
<p>some text
![[./image/path.png]]</p>
<p>$$ x^2 $$</p>
<p>inline math $x^2$</p>`)
  });

  test("Extract images", () => {


      const imageToBase64 = (path: string): string => {
        if (path === "./image/path.png") {
          return "image_1_base_64"
        }
        if (path === "./image/path_2.jpg") {
          return "image_2_base_64"
        }
        return "error"
      }

      const text = `# Heading
some text
![[./image/path.png]]
another text
![[./image/path_2.jpg]]
      `

      const result = inlineImages(text, imageToBase64);

      expect(result).toBe(`# Heading
some text
<img src="data:image/png;base64, image_1_base_64"/>
another text
<img src="data:image/jpg;base64, image_2_base_64"/>
      `)
  });

  test('replaceChain', () => {
      const text = `# Heading
some text
![[./image/path.png]]

$$ x^2 $$
      
inline math $x^2$
      `
      const imageToBase64 = (path: string): string => {
        if (path === "./image/path.png") {
          return "image_1_base_64"
        }
        if (path === "./image/path_2.jpg") {
          return "image_2_base_64"
        }
        return "error"
      }

      var result = inlineImages(text, imageToBase64)
      result = backAsHtml(result);
      expect(result).toBe(`<h1 id=\"heading\">Heading</h1>
<p>some text
<img src="data:image/png;base64, image_1_base_64"/></p>
<p>$$ x^2 $$</p>
<p>inline math $x^2$</p>`)
  });

  test("extractCardInfo", () => {
    const card = `# Idea #Card 
%% {"cardId": "1649852863426", "front": "Graph Convolution -> Idea", "deck": "Data Science"} %%
- rely on [[Neural Message Passing]], by which vertices exchange information with the neighbors and send messages to each other
- this is similar to Convolution in [[Convolutional Neural Networks]] but on a neighborhood of a graph
  `
  const info = extractCardInfo(card);

  expect(info.cardId).toBe(1649852863426);

  });
});

  test('replaceMath', () => {
      const text = `# Heading
some text
![[./image/path.png]]
$$ x^2 $$
inline math $x^2$`
      const result = replaceMath(text)
      expect(result.trim()).toBe(`# Heading
some text
![[./image/path.png]]
[$$] x^2 [/$$]
inline math [$]x^2[/$]`.trim())
  });
