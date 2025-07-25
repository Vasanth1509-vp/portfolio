// ServiceNow API configuration
const CONFIG = {
    instance: 'dev281875.service-now.com',
    table: 'x_941497_git_repo_servicenow_mainline',
    credentials: {
        username: 'vasanth',
        password: 'Stark@15'
    }
};

// Function to create Basic Auth header
function getAuthHeader() {
    const base64Credentials = btoa(`${CONFIG.credentials.username}:${CONFIG.credentials.password}`);
    return `Basic ${base64Credentials}`;
}

// Function to create a certification card
function createCertificationCard(cert) {
    // Ensure we have default values for all fields
    const certification = {
        name: cert.name || 'Untitled Certification',
        issuing_organization: cert.issuing_organization || 'Unknown Organization',
        issue_date: cert.issue_date ? new Date(cert.issue_date) : new Date(),
        expiry_date: cert.expiry_date ? new Date(cert.expiry_date) : null,
        credential_url: cert.credential_url || null,
        badge_url: cert.badge_url || 'https://via.placeholder.com/100'
    };

    return `
        <div class="bg-white rounded-xl shadow-sm p-6 card-hover">
            <div class="flex items-center justify-center mb-4">
                <img src="${certification.badge_url}" 
                     alt="${certification.name}" 
                     class="w-24 h-24 object-contain"
                     onerror="this.src='https://via.placeholder.com/100'">
            </div>
            <div class="text-center">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">${certification.name}</h3>
                <p class="text-gray-600 mb-2">${certification.issuing_organization}</p>
                <p class="text-sm text-gray-500">
                    Issued: ${certification.issue_date.toLocaleDateString()}
                    ${certification.expiry_date ? `<br>Expires: ${certification.expiry_date.toLocaleDateString()}` : ''}
                </p>
                ${certification.credential_url ? `
                    <a href="${certification.credential_url}" 
                       target="_blank" 
                       class="mt-3 inline-block text-blue-500 hover:text-blue-600 transition-colors">
                        Verify →
                    </a>
                ` : ''}
            </div>
        </div>
    `;
}

// Function to fetch certifications from ServiceNow
async function fetchCertifications() {
    const url = '/api/certifications';
    console.log('Fetching certifications from:', url);
    
    try {
        const response = await fetch(url);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
        }

        const data = await response.json();
        console.log('Received data:', data);
        
        if (!data || !data.result || !Array.isArray(data.result)) {
            console.error('Invalid data format:', data);
            throw new Error('Invalid response format from server');
        }
        
        return data.result;
    } catch (error) {
        console.error('Detailed error while fetching certifications:', error);
        throw new Error(`Failed to fetch certifications: ${error.message}`);
    }
}

// Function to update the UI with certifications
async function updateCertifications() {
    const certificationsContainer = document.getElementById('certifications');
    const loadingHtml = `
        <div class="col-span-full text-center py-12">
            <p class="text-gray-500">Loading certifications...</p>
        </div>
    `;
    
    try {
        certificationsContainer.innerHTML = loadingHtml;
        console.log('Starting to fetch certifications...');
        const certifications = await fetchCertifications();
        console.log('Received certifications:', certifications);
        
        if (!certifications || certifications.length === 0) {
            console.log('No certifications found in the response');
            certificationsContainer.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <p class="text-gray-500">No certifications found. Please check the ServiceNow configuration.</p>
                </div>
            `;
            return;
        }

        certificationsContainer.innerHTML = certifications
            .map(cert => createCertificationCard(cert))
            .join('');
        console.log('Successfully updated UI with certifications');
    } catch (error) {
        console.error('Error in updateCertifications:', error);
        certificationsContainer.innerHTML = `
            <div class="col-span-full text-center py-12">
                <p class="text-red-500">Error loading certifications: ${error.message}</p>
                <p class="text-sm text-gray-500 mt-2">Please check the browser console for more details.</p>
            </div>
        `;
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initial load
    updateCertifications();

    // Refresh button click handler
    const refreshButton = document.getElementById('refreshButton');
    if (refreshButton) {
        refreshButton.addEventListener('click', () => {
            refreshButton.disabled = true;
            refreshButton.classList.add('opacity-50');
            
            updateCertifications().finally(() => {
                refreshButton.disabled = false;
                refreshButton.classList.remove('opacity-50');
            });
        });
    }
}); 