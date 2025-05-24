// blog.js - Dynamic blog loading for Vibe Agency
async function loadBlogPosts() {
    try {
        console.log('Loading blog posts...');
        const response = await fetch('https://api.github.com/repos/thudm309/vibeagency/contents/content/blog');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const files = await response.json();
        console.log('Files found:', files.length);
        
        const blogPosts = [];
        
        // Process each markdown file
        for (const file of files.filter(f => f.name.endsWith('.md'))) {
            try {
                const contentResponse = await fetch(file.download_url);
                const content = await contentResponse.text();
                
                const post = parseMarkdown(content, file.name);
                if (post && !post.draft) {
                    blogPosts.push(post);
                    console.log('Loaded post:', post.title);
                }
            } catch (error) {
                console.error(`Error loading ${file.name}:`, error);
            }
        }
        
        // Sort by date (newest first)
        blogPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        console.log('Total posts loaded:', blogPosts.length);
        
        // Render blog posts
        if (blogPosts.length > 0) {
            renderBlogPosts(blogPosts);
        } else {
            console.log('No blog posts found, keeping static content');
        }
        
    } catch (error) {
        console.error('Error loading blog posts:', error);
        console.log('Using fallback static content');
    }
}

function parseMarkdown(content, filename) {
    const frontmatterRegex = /^---\s*\n(.*?)\n---\s*\n(.*)/s;
    const match = content.match(frontmatterRegex);
    
    if (!match) {
        console.warn(`No frontmatter found in ${filename}`);
        return null;
    }
    
    const frontmatter = match[1];
    const body = match[2];
    
    const data = {};
    frontmatter.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
            const key = line.substring(0, colonIndex).trim();
            const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
            data[key] = value;
        }
    });
    
    return {
        slug: filename.replace('.md', ''),
        title: data.title || 'Untitled',
        date: data.date || new Date().toISOString(),
        featured_image: data.featured_image,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
        draft: data.draft === 'true',
        body: body.trim(),
        excerpt: body.trim().substring(0, 150) + '...'
    };
}

function renderBlogPosts(posts) {
    const blogGrid = document.querySelector('.blog-grid');
    if (!blogGrid) {
        console.error('Blog grid not found');
        return;
    }
    
    // Show latest 3 posts on homepage
    const latestPosts = posts.slice(0, 3);
    
    blogGrid.innerHTML = latestPosts.map(post => `
        <div class="blog-card">
            ${post.featured_image ? `
                <img src="${post.featured_image}" alt="${post.title}" class="blog-image">
            ` : `
                <img src="https://images.unsplash.com/photo-1677442135184-d849f54a7930?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="${post.title}" class="blog-image">
            `}
            <div class="blog-content">
                <div class="blog-date">${formatDate(post.date)}</div>
                <h3>${post.title}</h3>
                <p>${post.excerpt}</p>
                <a href="/blog/${post.slug}" class="read-more">Đọc tiếp →</a>
            </div>
        </div>
    `).join('');
    
    console.log('Blog posts rendered successfully');
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    } catch (error) {
        console.error('Error formatting date:', dateString);
        return dateString;
    }
}

// Load blog posts when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, initializing blog...');
    loadBlogPosts();
});