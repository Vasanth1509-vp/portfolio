// ServiceNow API configuration
const CONFIG = {
    instance: 'YOUR_INSTANCE.service-now.com',
    table: 'x_your_projects',
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

// Function to create a project card
function createProjectCard(project) {
    // Parse technologies as array or use empty array if not defined
    const technologies = project.technologies ? JSON.parse(project.technologies) : [];
    
    return `
        <div class="bg-white rounded-xl shadow-sm overflow-hidden card-hover">
            <div class="h-48 bg-gray-100 flex items-center justify-center">
                <img src="${project.image_url || 'https://via.placeholder.com/400x200'}" 
                     alt="${project.name}" 
                     class="w-full h-full object-cover">
            </div>
            <div class="p-6">
                <h3 class="text-xl font-semibold text-gray-900 mb-2">${project.name}</h3>
                <p class="text-gray-600 mb-4">${project.description}</p>
                <div class="flex flex-wrap gap-2">
                    ${technologies.map(tech => `
                        <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                            ${tech}
                        </span>
                    `).join('')}
                </div>
                ${project.project_url ? `
                    <a href="${project.project_url}" 
                       target="_blank" 
                       class="mt-4 inline-block text-blue-500 hover:text-blue-600 transition-colors">
                        View Project →
                    </a>
                ` : ''}
            </div>
        </div>
    `;
}

// Function to fetch projects from ServiceNow
async function fetchProjects() {
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
        console.error('Error fetching projects:', error);
        return [];
    }
}

// Function to update the UI with projects
async function updateProjects() {
    const projectsContainer = document.getElementById('projects');
    
    try {
        const projects = await fetchProjects();
        
        if (projects.length === 0) {
            projectsContainer.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <p class="text-gray-500">No projects found.</p>
                </div>
            `;
            return;
        }

        projectsContainer.innerHTML = projects.map(project => createProjectCard(project)).join('');
    } catch (error) {
        projectsContainer.innerHTML = `
            <div class="col-span-full text-center py-12">
                <p class="text-red-500">Error loading projects. Please try again later.</p>
            </div>
        `;
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initial load
    updateProjects();

    // Refresh button click handler
    const refreshButton = document.getElementById('refreshButton');
    refreshButton.addEventListener('click', () => {
        refreshButton.disabled = true;
        refreshButton.classList.add('opacity-50');
        
        updateProjects().finally(() => {
            refreshButton.disabled = false;
            refreshButton.classList.remove('opacity-50');
        });
    });
}); 