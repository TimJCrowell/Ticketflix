async function fetchHello() {
    const response = await fetch('/api/hello');
    const data = await response.json();
    const appDiv = document.getElementById('app');
    if (appDiv) {
        appDiv.innerHTML = `<h1>${data.message}</h1><p>TypeScript is also active!</p>`;
    }
}

fetchHello();
