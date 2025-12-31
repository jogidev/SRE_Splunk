// FreeMind-MMX Web Application

// -- Data Structure --
// Node: { id: string, text: string, children: Node[], folded: boolean, parent: Node|null }
// Root is a single Node.

let rootNode = null;
let selectedNode = null;
let nodeMap = {}; // id -> Node
let isEditing = false; // Flag to prevent keydown handling during edit/commit transition

// -- Initialization --
function init() {
    createLayout();

    // Bind Events
    document.getElementById('btn-new').addEventListener('click', newMap);
    document.getElementById('file-input').addEventListener('change', handleFileSelect);
    document.getElementById('btn-save').addEventListener('click', saveMap);
    document.getElementById('btn-help').addEventListener('click', showHelp);
    document.querySelector('.close').addEventListener('click', hideHelp);

    document.addEventListener('keydown', handleKeyDown);

    // Initial Map
    newMap();
}

function newMap() {
    nodeMap = {};
    rootNode = createNode("New Mindmap");
    rootNode.id = "root";
    nodeMap[rootNode.id] = rootNode;
    selectNode(rootNode);
    render();
}

function createNode(text, parent = null) {
    const id = 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const node = {
        id: id,
        text: text,
        children: [],
        folded: false,
        parent: parent
    };
    nodeMap[id] = node;
    return node;
}

// -- Rendering --
function render() {
    const container = document.getElementById('nodes-container');
    const svg = document.getElementById('connections');
    container.innerHTML = '';
    svg.innerHTML = '';

    measureNodes(rootNode);

    // Center the root node roughly in the middle of the screen
    // We can use window dimensions
    const startX = 50;
    const startY = window.innerHeight / 2;

    layoutNodes(rootNode, startX, startY);
}

function measureNodes(node) {
    if (node.folded || node.children.length === 0) {
        node._height = 30;
        node._width = measureText(node.text) + 50;
        return;
    }

    let totalHeight = 0;
    node.children.forEach(child => {
        measureNodes(child);
        totalHeight += child._height;
    });

    node._height = totalHeight;
    node._width = measureText(node.text) + 50;
}

function measureText(text) {
    // Basic estimation
    return text.length * 9 + 25;
}

function layoutNodes(node, x, y) {
    const el = document.createElement('div');
    el.className = 'node';
    if (node === rootNode) el.classList.add('root');
    if (node === selectedNode) el.classList.add('selected');
    if (node.children.length > 0 && node.folded) el.classList.add('folded-indicator');

    el.innerText = node.text;
    el.style.left = x + 'px';
    el.style.top = (y - 15) + 'px'; // Center vertically (approx half height of single node)

    el.onclick = (e) => {
        e.stopPropagation();
        selectNode(node);
    };
    el.ondblclick = (e) => {
        e.stopPropagation();
        editNode(node, el);
    };

    container = document.getElementById('nodes-container');
    container.appendChild(el);

    node._x = x;
    node._y = y;

    if (node.folded) return;

    let currentY = y - node._height / 2;

    const childX = x + node._width + 50;

    node.children.forEach(child => {
        const childY = currentY + child._height / 2;

        drawConnection(x + node._width, y, childX, childY);

        layoutNodes(child, childX, childY);
        currentY += child._height;
    });
}

function drawConnection(x1, y1, x2, y2) {
    const svg = document.getElementById('connections');
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

    const cx1 = x1 + (x2 - x1) / 2;
    const cy1 = y1;
    const cx2 = x1 + (x2 - x1) / 2;
    const cy2 = y2;

    const d = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;

    path.setAttribute("d", d);
    path.setAttribute("stroke", "#999");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("fill", "none");

    svg.appendChild(path);
}

// -- Interaction --
function selectNode(node) {
    selectedNode = node;
    render();
}

function handleKeyDown(e) {
    if (isEditing) return; // Ignore global keys while editing
    if (!selectedNode) return;
    if (document.activeElement.tagName === 'INPUT') return;

    if (e.key === 'Tab' || e.key === 'Insert') {
        e.preventDefault();
        addChild();
    } else if (e.key === 'Enter') {
        e.preventDefault();
        addSibling();
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNode !== rootNode) {
            deleteNode();
        }
    } else if (e.key === ' ') {
        e.preventDefault();
        toggleFold();
    } else if (e.key === 'ArrowUp') {
        navigate('up');
    } else if (e.key === 'ArrowDown') {
        navigate('down');
    } else if (e.key === 'ArrowLeft') {
        navigate('left');
    } else if (e.key === 'ArrowRight') {
        navigate('right');
    }
}

function addChild() {
    const child = createNode("New Node", selectedNode);
    selectedNode.children.push(child);
    selectedNode.folded = false;
    selectNode(child);
}

function addSibling() {
    if (selectedNode === rootNode) return;
    const parent = selectedNode.parent;
    const index = parent.children.indexOf(selectedNode);
    const sibling = createNode("New Node", parent);
    parent.children.splice(index + 1, 0, sibling);
    selectNode(sibling);
}

function deleteNode() {
    if (selectedNode === rootNode) return;
    const parent = selectedNode.parent;
    const index = parent.children.indexOf(selectedNode);
    parent.children.splice(index, 1);
    delete nodeMap[selectedNode.id];
    if (parent.children.length > 0) {
        selectNode(parent.children[Math.min(index, parent.children.length - 1)]);
    } else {
        selectNode(parent);
    }
}

function toggleFold() {
    if (selectedNode.children.length > 0) {
        selectedNode.folded = !selectedNode.folded;
        render();
    }
}

function editNode(node, el) {
    isEditing = true; // Set flag
    const input = document.createElement('input');
    input.value = node.text;
    input.style.width = Math.max(50, el.offsetWidth) + 'px';

    input.onclick = (e) => e.stopPropagation();
    input.ondblclick = (e) => e.stopPropagation();

    el.innerHTML = '';
    el.appendChild(input);
    input.focus();

    let committed = false;
    const commit = () => {
        if (committed) return;
        committed = true;
        node.text = input.value;
        render();
        // Delay clearing the flag slightly to ensure any bubbling events are processed or ignored
        setTimeout(() => { isEditing = false; }, 50);
    };

    input.onblur = commit;
    input.onkeydown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            commit();
        }
    };
}

function navigate(direction) {
    if (!selectedNode) return;

    if (direction === 'left') {
        if (selectedNode.parent) selectNode(selectedNode.parent);
    } else if (direction === 'right') {
        if (!selectedNode.folded && selectedNode.children.length > 0) {
            selectNode(selectedNode.children[0]);
        }
    } else if (direction === 'up') {
        if (selectedNode === rootNode) return;
        const siblings = selectedNode.parent.children;
        const index = siblings.indexOf(selectedNode);
        if (index > 0) {
            selectNode(siblings[index - 1]);
        }
    } else if (direction === 'down') {
        if (selectedNode === rootNode) return;
        const siblings = selectedNode.parent.children;
        const index = siblings.indexOf(selectedNode);
        if (index < siblings.length - 1) {
            selectNode(siblings[index + 1]);
        }
    }
}

// -- File IO (The MMX Logic) --

async function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length === 0) return;

    let mmFile = null;
    let mmxFile = null;

    for (let i = 0; i < files.length; i++) {
        if (files[i].name.endsWith('.mm')) mmFile = files[i];
        if (files[i].name.endsWith('.mmx')) mmxFile = files[i];
    }

    if (!mmFile) {
        alert("Please select at least a .mm file.");
        return;
    }

    const mmText = await readFile(mmFile);
    let mmxText = null;
    if (mmxFile) {
        mmxText = await readFile(mmxFile);
    }

    loadMap(mmText, mmxText);
}

function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

function loadMap(mmText, mmxText) {
    const parser = new DOMParser();
    const mmDoc = parser.parseFromString(mmText, "text/xml");

    let mmxDoc = null;
    if (mmxText) {
        mmxDoc = parser.parseFromString(mmxText, "text/xml");
    }

    const mapElement = mmDoc.querySelector('map');
    const rootElement = mapElement.children[0];

    nodeMap = {};

    rootNode = parseNodeElement(rootElement, null);

    if (mmxDoc) {
        applyMmxAttributes(rootNode, mmxDoc);
    }

    selectNode(rootNode);
    render();
}

function parseNodeElement(element, parent) {
    if (element.tagName !== 'node') return null;

    const text = element.getAttribute('TEXT') || "";
    let id = element.getAttribute('ID');
    if (!id) id = 'node_' + Math.random().toString(36).substr(2, 9);

    const node = {
        id: id,
        text: text,
        children: [],
        folded: false,
        parent: parent
    };
    nodeMap[id] = node;

    if (element.getAttribute('FOLDED') === 'true') {
        node.folded = true;
    }

    for (let i = 0; i < element.children.length; i++) {
        const childEl = element.children[i];
        if (childEl.tagName === 'node') {
            const childNode = parseNodeElement(childEl, node);
            if (childNode) node.children.push(childNode);
        }
    }

    return node;
}

function applyMmxAttributes(node, mmxDoc) {
    const mmxNodeEl = mmxDoc.querySelector(`node[ID="${node.id}"]`);
    if (mmxNodeEl) {
        if (mmxNodeEl.getAttribute('FOLDED') === 'true') {
            node.folded = true;
        }
    }

    node.children.forEach(child => applyMmxAttributes(child, mmxDoc));
}

function saveMap() {
    const mmXml = generateXml(rootNode, false);
    const mmxXml = generateXml(rootNode, true);

    downloadFile("map.mm", mmXml);
    downloadFile("map.mmx", mmxXml);
}

function generateXml(node, isMmx) {
    let xml = '';
    if (node === rootNode) {
        xml += '<map version="1.0.1">\n';
        xml += serializeNode(node, isMmx, 0);
        xml += '</map>';
    } else {
        xml += serializeNode(node, isMmx, 0);
    }
    return xml;
}

function serializeNode(node, isMmx, depth) {
    const indent = '  '.repeat(depth + 1);
    let attrs = '';

    attrs += ` ID="${node.id}"`;

    if (!isMmx) {
        attrs += ` TEXT="${escapeXml(node.text)}"`;
    } else {
        if (node.folded) {
            attrs += ` FOLDED="true"`;
        }
    }

    let childXml = '';
    if (node.children.length > 0) {
        node.children.forEach(child => {
            childXml += serializeNode(child, isMmx, depth + 1);
        });
    }

    if (childXml === '') {
        return `${indent}<node${attrs}/>\n`;
    } else {
        return `${indent}<node${attrs}>\n${childXml}${indent}</node>\n`;
    }
}

function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

function downloadFile(filename, text) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/xml;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function showHelp() {
    document.getElementById('help-modal').style.display = "block";
}

function hideHelp() {
    document.getElementById('help-modal').style.display = "none";
}

init();
function createLayout() {}
