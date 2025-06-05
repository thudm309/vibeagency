// functions/blogs/[slug].js
export async function onRequest(context) {
  const { params, request, env } = context;
  let slug = params.slug;
  
  // Remove .html extension if present
  if (slug && slug.endsWith('.html')) {
    slug = slug.replace('.html', '');
  }
  
  console.log('Blog function called with slug:', slug);
  
  try {
    // Get the blog-post.html template
    const baseUrl = new URL(request.url).origin;
    const templateResponse = await fetch(`${baseUrl}/blog-post.html`);
    
    if (!templateResponse.ok) {
      return new Response('Template not found', { status: 404 });
    }
    
    let html = await templateResponse.text();
    
    // Inject the slug into the HTML
    const slugScript = `<script>window.BLOG_SLUG = "${slug}";</script>`;
    html = html.replace('</head>', `${slugScript}</head>`);
    
    return new Response(html, {
      headers: { 
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=300'
      }
    });
    
  } catch (error) {
    console.error('Error in blog function:', error);
    return new Response('Server error', { status: 500 });
  }
}