// Excel file handler
async function handleExcelFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array', cellStyles: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Extract cell colors
        cellColors = {};
        for (let cell in worksheet) {
            if (cell[0] === '!') continue;
            if (worksheet[cell].s && worksheet[cell].s.fgColor) {
                cellColors[cell] = '#' + worksheet[cell].s.fgColor.rgb;
            }
        }

        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        if (json.length === 0) {
            showStatus('Error: File is empty', 'error');
            return;
        }

        headers = json[0].map(h => h || '');
        workbookData = json.slice(1);
        history = [];
        activeFilters = {};
        columnWidths = {};
        
        renderTable();
        addChatMessage('system', `✓ Loaded ${workbookData.length} rows and ${headers.length} columns`);
        updateButtonStates();
    } catch (error) {
        showStatus(`Error loading file: ${error.message}`, 'error');
        addChatMessage('system', `❌ Error: ${error.message}`);
    }
}

// Save current state
function saveState() {
    history.push({
        headers: JSON.parse(JSON.stringify(headers)),
        data: JSON.parse(JSON.stringify(workbookData)),
        colors: JSON.parse(JSON.stringify(cellColors))
    });
    if (history.length > 20) history.shift();
    updateButtonStates();
}

// Render table
function renderTable() {
    const tableHead = document.getElementById('tableHead');
    const tableBody = document.getElementById('tableBody');
    
    if (!tableHead || !tableBody) return;
    
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    const headerRow = document.createElement('tr');
    const cornerCell = document.createElement('th');
    cornerCell.className = 'row-header';
    cornerCell.textContent = '#';
    headerRow.appendChild(cornerCell);

    headers.forEach((header, i) => {
        const th = document.createElement('th');
        th.textContent = header || `Column ${i + 1}`;
        th.style.width = columnWidths[i] || '150px';
        th.style.position = 'relative';
        
        const filterIcon = document.createElement('span');
        filterIcon.className = 'filter-icon';
        filterIcon.textContent = '▼';
        filterIcon.onclick = (e) => showFilterDropdown(e, i);
        th.appendChild(filterIcon);

        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        resizeHandle.onmousedown = (e) => startResize(e, i);
        th.appendChild(resizeHandle);

        headerRow.appendChild(th);
    });
    tableHead.appendChild(headerRow);

    const filteredData = applyFilters();
    filteredData.forEach((row) => {
        const tr = document.createElement('tr');
        
        const rowHeader = document.createElement('td');
        rowHeader.className = 'row-header';
        rowHeader.textContent = row.originalIndex + 1;
        tr.appendChild(rowHeader);

        headers.forEach((_, colIndex) => {
            const td = document.createElement('td');
            const cellRef = XLSX.utils.encode_cell({r: row.originalIndex + 1, c: colIndex});
            if (cellColors[cellRef]) {
                td.style.backgroundColor = cellColors[cellRef];
            }

            const input = document.createElement('input');
            input.type = 'text';
            input.value = row.data[colIndex] !== undefined ? row.data[colIndex] : '';
            input.addEventListener('change', (e) => {
                workbookData[row.originalIndex][colIndex] = e.target.value;
            });
            td.appendChild(input);
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });
}

// Apply filters
function applyFilters() {
    let filtered = workbookData.map((data, idx) => ({data, originalIndex: idx}));
    
    for (let colIndex in activeFilters) {
        const filterValues = activeFilters[colIndex];
        if (filterValues.size > 0) {
            filtered = filtered.filter(row => filterValues.has(String(row.data[colIndex])));
        }
    }
    
    return filtered;
}

// Show filter dropdown
function showFilterDropdown(e, colIndex) {
    e.stopPropagation();
    
    // Remove existing dropdowns
    document.querySelectorAll('.filter-dropdown').forEach(d => d.remove());

    const dropdown = document.createElement('div');
    dropdown.className = 'filter-dropdown';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search...';
    dropdown.appendChild(searchInput);

    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'filter-options';

    const uniqueValues = [...new Set(workbookData.map(row => String(row[colIndex] || '')))];
    const currentFilter = activeFilters[colIndex] || new Set();

    uniqueValues.forEach(value => {
        const option = document.createElement('div');
        option.className = 'filter-option';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = currentFilter.size === 0 || currentFilter.has(value);
        checkbox.onchange = () => {
            if (!activeFilters[colIndex]) activeFilters[colIndex] = new Set();
            if (checkbox.checked) {
                activeFilters[colIndex].delete(value);
                if (activeFilters[colIndex].size === 0) delete activeFilters[colIndex];
            } else {
                uniqueValues.forEach(v => activeFilters[colIndex].add(v));
                activeFilters[colIndex].delete(value);
            }
            renderTable();
        };
        
        option.appendChild(checkbox);
        option.appendChild(document.createTextNode(value || '(blank)'));
        optionsDiv.appendChild(option);
    });

    dropdown.appendChild(optionsDiv);
    e.target.parentElement.appendChild(dropdown);

    searchInput.oninput = () => {
        const search = searchInput.value.toLowerCase();
        optionsDiv.querySelectorAll('.filter-option').forEach(opt => {
            const text = opt.textContent.toLowerCase();
            opt.style.display = text.includes(search) ? 'block' : 'none';
        });
    };

    document.addEventListener('click', function closeDropdown(e) {
        if (!dropdown.contains(e.target)) {
            dropdown.remove();
            document.removeEventListener('click', closeDropdown);
        }
    });
}

// Start column resize
function startResize(e, colIndex) {
    e.preventDefault();
    e.stopPropagation();
    
    const th = e.target.parentElement;
    const startX = e.clientX;
    const startWidth = th.offsetWidth;

    function onMouseMove(moveEvent) {
        const newWidth = startWidth + (moveEvent.clientX - startX);
        columnWidths[colIndex] = Math.max(50, newWidth) + 'px';
        th.style.width = columnWidths[colIndex];
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.cursor = 'default';
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'col-resize';
}

// Add row
function handleAddRow() {
    saveState();
    const newRow = new Array(headers.length).fill('');
    workbookData.push(newRow);
    renderTable();
    addChatMessage('system', '✓ Added new row');
}

// Add column
function handleAddColumn() {
    const colName = prompt('Enter column name:');
    if (!colName) return;
    
    saveState();
    headers.push(colName);
    workbookData.forEach(row => row.push(''));
    renderTable();
    addChatMessage('system', `✓ Added column "${colName}"`);
}

// Download file
function handleDownload() {
    const ws = XLSX.utils.aoa_to_sheet([headers, ...workbookData]);
    
    // Reapply colors
    for (let cell in cellColors) {
        if (ws[cell]) {
            ws[cell].s = {fgColor: {rgb: cellColors[cell].slice(1)}};
        }
    }
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'modified_spreadsheet.xlsx');
    addChatMessage('system', '✓ Downloaded successfully!');
}