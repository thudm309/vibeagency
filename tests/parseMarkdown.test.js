const { parseMarkdown } = require('../blog');

describe('parseMarkdown', () => {
  test('parses front matter correctly', () => {
    const md = `---
    title: Test Post
    date: 2024-06-05
    featured_image: https://example.com/image.jpg
    tags: tag1, tag2
    draft: false
    ---

    This is the body of the post.`;

    const post = parseMarkdown(md, 'test.md');

    expect(post).toEqual({
      slug: 'test',
      title: 'Test Post',
      date: '2024-06-05',
      featured_image: 'https://example.com/image.jpg',
      tags: ['tag1', 'tag2'],
      draft: false,
      body: 'This is the body of the post.',
      excerpt: 'This is the body of the post....'
    });
  });
});
