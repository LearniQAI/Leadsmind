(function() {
    // Robust workspace ID detection and endpoint setup
    let workspaceId = null;
    let apiEndpoint = null;

    const script = document.currentScript || (function() {
        const scripts = document.getElementsByTagName('script');
        return Array.from(scripts).find(s => s.hasAttribute('data-workspace-id'));
    })();

    if (script) {
        workspaceId = script.getAttribute('data-workspace-id');
        apiEndpoint = script.src.replace('/tracker.js', '/api/v1/leads');
    }

    if (!workspaceId) {
        console.warn('[Leadsmind] Tracker script active but missing data-workspace-id attribute.');
        return;
    }

    console.log('[Leadsmind] Smart Tracker initialized for:', workspaceId);

    // Monitoring all form submissions on the page
    document.addEventListener('submit', async function(event) {
        const form = event.target;
        if (!form || form.tagName !== 'FORM') return;

        // Prevent double tracking of the same form submission
        if (form.getAttribute('data-lm-tracked')) return;
        form.setAttribute('data-lm-tracked', 'true');

        const formData = new FormData(form);
        const data = {
            workspaceId,
            source_type: 'browser_tracker',
            url: window.location.href,
            formId: form.id || form.getAttribute('name') || 'Unnamed Form'
        };
        
        // Intelligent data mapping for common field names
        formData.forEach((value, key) => {
            const k = key.toLowerCase();
            if (k.includes('email')) data.email = value;
            else if (k.includes('name') && !k.includes('first') && !k.includes('last')) data.firstName = value;
            else if (k.includes('first')) data.firstName = value;
            else if (k.includes('last')) data.lastName = value;
            else if (k.includes('phone') || k.includes('tel')) data.phone = value;
            else data[key] = value;
        });

        // Minimum requirement: Email or Phone to create a valid lead
        if (!data.email && !data.phone) return;

        try {
            await fetch(apiEndpoint, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            console.log('[Leadsmind] Lead captured successfully.');
        } catch (e) {
            console.error('[Leadsmind] Lead capture failed:', e);
        }
    });

    // Provide a global window object for manual capture and programmatic control
    window.Leadsmind = {
        capture: async function(customData) {
            return fetch(apiEndpoint, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...customData, workspaceId, source_type: 'manual' })
            });
        }
    };
})();
