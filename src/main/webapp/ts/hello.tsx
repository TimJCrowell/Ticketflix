import * as React from 'react';
import { createRoot } from 'react-dom/client';
import ManagerDashboard from './components/ManagerDashboard';

// Find the placeholder div in the HTML
const appDiv = document.getElementById('app');

// Tell React to take over that div and render your Dashboard
if (appDiv) {
    const root = createRoot(appDiv);
    root.render(<ManagerDashboard />);
}
