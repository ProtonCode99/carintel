const fs = require('fs');

const file = 'landingpage/index.html';
let content = fs.readFileSync(file, 'utf8');

// 1. Add CSS for mobile responsiveness
const oldCssEnd = `  </style>`;
const cssToInsert = `
    /* Mobile Card Layout for Table */
    .mobile-tabs {
      display: none;
    }
    
    @media (max-width: 768px) {
      .mobile-tabs {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
      }
      .mobile-tab {
        flex: 1;
        padding: 12px;
        background: var(--bg-darker);
        border: 1px solid var(--border-color);
        color: var(--text-muted);
        border-radius: 8px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        text-align: center;
      }
      .mobile-tab.active {
        background: var(--accent-primary);
        color: white;
        border-color: var(--accent-primary);
      }

      .table-container {
        background: transparent;
        border: none;
        box-shadow: none;
        overflow: visible;
      }
      
      .compare-table {
        display: block;
        width: 100%;
        min-width: 0;
        border-radius: 12px;
        overflow: hidden;
        background: var(--card-bg);
        border: 1px solid var(--border-color);
      }
      
      .compare-table thead, .compare-table tbody, .compare-table tr {
        display: block;
        width: 100%;
      }

      .compare-table th {
        display: block;
        width: 100% !important;
        text-align: left !important;
        padding: 16px 16px 4px 16px !important;
        border: none !important;
        background: var(--card-bg) !important;
      }
      
      .compare-table tbody th {
        color: var(--text-muted);
        font-size: 14px;
        font-weight: 600;
      }

      .compare-table td {
        display: block;
        width: 100%;
        padding: 4px 16px 16px 16px !important;
        border-bottom: 1px solid var(--border-color) !important;
        border-right: none !important;
        font-size: 16px;
      }
      
      .compare-table thead tr th:first-child {
        display: none !important;
      }
      
      .compare-table thead th:nth-child(2),
      .compare-table thead th:nth-child(3) {
        padding: 16px !important;
        border-bottom: 1px solid var(--border-color) !important;
        text-align: center !important;
        background: var(--bg-darker) !important;
      }
      
      .compare-table.show-car-1 td:nth-child(3),
      .compare-table.show-car-1 th:nth-child(3) {
        display: none !important;
      }
      .compare-table.show-car-2 td:nth-child(2),
      .compare-table.show-car-2 th:nth-child(2) {
        display: none !important;
      }
      
      .btn-sm {
        min-height: 48px;
        font-size: 15px;
      }
    }
  </style>`;

content = content.replace(oldCssEnd, cssToInsert);

// 2. Modify HTML to add mobile tabs and JS
const oldTableStart = `    <div class="table-container">
      <table class="compare-table">`;
      
const newTableStart = `    <div class="mobile-tabs">
      <div class="mobile-tab active" onclick="switchMobileTab(1)">BMW 320d</div>
      <div class="mobile-tab" onclick="switchMobileTab(2)">Audi A4</div>
    </div>
    
    <div class="table-container">
      <table id="demo-table" class="compare-table show-car-1">`;
      
content = content.replace(oldTableStart, newTableStart);

// 3. Add script tag at the end
const oldBodyEnd = `</body>`;
const scriptToInsert = `  <script>
    function switchMobileTab(carIndex) {
      document.querySelectorAll('.mobile-tab').forEach((tab, index) => {
        if (index + 1 === carIndex) {
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      });
      const table = document.getElementById('demo-table');
      table.className = 'compare-table show-car-' + carIndex;
    }
  </script>
</body>`;

content = content.replace(oldBodyEnd, scriptToInsert);

fs.writeFileSync(file, content);
console.log('landingpage/index.html updated successfully.');
