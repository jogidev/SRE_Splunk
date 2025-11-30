function copyToClipboard(elementId) {
    const codeElement = document.getElementById(elementId);
    const textToCopy = codeElement.innerText;

    navigator.clipboard.writeText(textToCopy).then(() => {
        // Find the button that triggered this
        const button = codeElement.parentElement.querySelector('.copy-btn');
        const originalHTML = button.innerHTML;
        
        // Change button state
        button.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        button.style.borderColor = '#10b981';
        button.style.color = '#10b981';

        // Reset after 2 seconds
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.borderColor = '';
            button.style.color = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}
