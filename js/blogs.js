// ServiceNow API configuration
const CONFIG = {
    instance: 'YOUR_INSTANCE.service-now.com',
    table: 'x_your_blog_posts',
    // You'll need to add your credentials later
    credentials: {
        username: 'YOUR_USERNAME',
        password: 'YOUR_PASSWORD'
    }
};

// Function to create Basic Auth header
function getAuthHeader() {
    const base64Credentials = btoa(`${CONFIG.credentials.username}:${CONFIG.credentials.password}`);
    return `Basic ${base64Credentials}`;
}

// Function to create a blog post card
function createBlogCard(blog) {
    return `
        <div class="bg-white rounded-xl shadow-sm p-6 card-hover">
            <h3 class="text-xl font-semibold text-gray-900 mb-2">${blog.title}</h3>
            <p class="text-gray-600 mb-4">${blog.summary}</p>
            <div class="flex justify-between items-center">
                <span class="text-sm text-gray-500">${new Date(blog.sys_created_on).toLocaleDateString()}</span>
                <a href="${blog.link}" target="_blank" class="text-blue-500 hover:text-blue-600 transition-colors">Read More →</a>
            </div>
        </div>
    `;
}

// Function to fetch blog posts from ServiceNow
async function fetchBlogPosts() {
    try {
        const response = await fetch(`https://${CONFIG.instance}/api/now/table/${CONFIG.table}`, {
            method: 'GET',
            headers: {
                'Authorization': getAuthHeader(),
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.result;
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        return [];
    }
}

// Function to update the UI with blog posts
async function updateBlogPosts() {
    const blogPostsContainer = document.getElementById('blogPosts');
    
    try {
        const posts = await fetchBlogPosts();
        
        if (posts.length === 0) {
            blogPostsContainer.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <p class="text-gray-500">No blog posts found.</p>
                </div>
            `;
            return;
        }

        blogPostsContainer.innerHTML = posts.map(post => createBlogCard(post)).join('');
    } catch (error) {
        blogPostsContainer.innerHTML = `
            <div class="col-span-full text-center py-12">
                <p class="text-red-500">Error loading blog posts. Please try again later.</p>
            </div>
        `;
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initial load
    updateBlogPosts();

    // Refresh button click handler
    const refreshButton = document.getElementById('refreshButton');
    refreshButton.addEventListener('click', () => {
        refreshButton.disabled = true;
        refreshButton.classList.add('opacity-50');
        
        updateBlogPosts().finally(() => {
            refreshButton.disabled = false;
            refreshButton.classList.remove('opacity-50');
        });
    });
}); 