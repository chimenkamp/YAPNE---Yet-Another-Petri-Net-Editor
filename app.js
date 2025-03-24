/**
 * Petri Net Editor Example Application
 * 
 * This file contains the implementation of a web application that uses the Petri Net Editor library.
 * It demonstrates how to create, edit, simulate, and analyze Petri nets.
 */

class PetriNetApp {
  /**
   * Constructor for the PetriNetApp
   */
  constructor() {
    // Core components
    this.api = null;
    this.editor = null;
    this.canvas = null;
    
    // UI elements
    this.propertiesPanel = null;
    this.tokensDisplay = null;
    this.zoomDisplay = null;
    
    // Simulation state
    this.autoRunInterval = null;
    this.autoRunDelay = 1000; // ms
    this.gridEnabled = true;
    
    // Initialize the canvas
    this.canvas = document.getElementById('petri-canvas');
    if (!this.canvas) {
      throw new Error('Canvas element not found');
    }
    
    // Initialize the properties panel
    this.propertiesPanel = document.getElementById('properties-content');
    if (!this.propertiesPanel) {
      throw new Error('Properties panel element not found');
    }
    
    // Initialize the tokens display
    this.tokensDisplay = document.getElementById('tokens-display');
    if (!this.tokensDisplay) {
      throw new Error('Tokens display element not found');
    }
    
    // Initialize the zoom display
    this.zoomDisplay = document.getElementById('zoom-display');
    
    // Create the Petri net and editor
    this.api = new PetriNetAPI();
    this.editor = this.api.attachEditor(this.canvas);
    
    // Set up editor callbacks
    this.editor.setOnSelectCallback(this.handleElementSelected.bind(this));
    this.editor.setOnChangeCallback(this.handleNetworkChanged.bind(this));
    
    // Initialize UI event handlers
    this.initEventHandlers();
    
    // Initial render
    this.editor.render();
    this.updateTokensDisplay();
    this.updateZoomDisplay();
  }
  
  /**
   * Initialize all UI event handlers
   */
  initEventHandlers() {
    // Editor mode buttons
    const btnSelect = document.getElementById('btn-select');
    if (btnSelect) {
      btnSelect.addEventListener('click', () => {
        this.editor.setMode('select');
        this.updateActiveButton('btn-select');
      });
    }
    
    const btnAddPlace = document.getElementById('btn-add-place');
    if (btnAddPlace) {
      btnAddPlace.addEventListener('click', () => {
        this.editor.setMode('addPlace');
        this.updateActiveButton('btn-add-place');
      });
    }
    
    const btnAddTransition = document.getElementById('btn-add-transition');
    if (btnAddTransition) {
      btnAddTransition.addEventListener('click', () => {
        this.editor.setMode('addTransition');
        this.updateActiveButton('btn-add-transition');
      });
    }
    
    const btnAddArc = document.getElementById('btn-add-arc');
    if (btnAddArc) {
      btnAddArc.addEventListener('click', () => {
        this.editor.setMode('addArc');
        this.updateActiveButton('btn-add-arc');
      });
    }
    
    // Delete and clear buttons
    const btnDelete = document.getElementById('btn-delete');
    if (btnDelete) {
      btnDelete.addEventListener('click', () => {
        this.editor.deleteSelected();
      });
    }
    
    const btnClear = document.getElementById('btn-clear');
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the entire Petri net?')) {
          this.resetPetriNet();
        }
      });
    }
    
    // Grid button
    const btnGrid = document.getElementById('btn-grid');
    if (btnGrid) {
      btnGrid.addEventListener('click', () => {
        this.gridEnabled = !this.gridEnabled;
        this.editor.setSnapToGrid(this.gridEnabled);
        btnGrid.classList.toggle('active', this.gridEnabled);
      });
    }

    // Auto-Layout button
    const btnAuto = document.getElementById('btn-auto-layout');
    if (btnAuto) {
        btnAuto.addEventListener('click', () => {
            this.api.autoLayout();
      });
    }
    
    // Pan and zoom buttons
    const btnZoomIn = document.getElementById('btn-zoom-in');
    if (btnZoomIn) {
      btnZoomIn.addEventListener('click', () => {
        // Get center of canvas for zooming
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        this.editor.renderer.adjustZoom(1.2, centerX, centerY);
        this.editor.render();
        this.updateZoomDisplay();
      });
    }
    
    const btnZoomOut = document.getElementById('btn-zoom-out');
    if (btnZoomOut) {
      btnZoomOut.addEventListener('click', () => {
        // Get center of canvas for zooming
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        this.editor.renderer.adjustZoom(0.8, centerX, centerY);
        this.editor.render();
        this.updateZoomDisplay();
      });
    }
    
    const btnResetView = document.getElementById('btn-reset-view');
    if (btnResetView) {
      btnResetView.addEventListener('click', () => {
        this.editor.resetView();
        this.updateZoomDisplay();
      });
    }
    
    // Template select
    const templateSelect = document.getElementById('template-select');
    if (templateSelect) {
      templateSelect.addEventListener('change', (e) => {
        const template = e.target.value;
        if (template) {
          this.loadTemplate(template);
        }
      });
    }
    
    // Simulation buttons
    const btnStep = document.getElementById('btn-step');
    if (btnStep) {
      btnStep.addEventListener('click', () => {
        this.stepSimulation();
      });
    }
    
    const btnAutoRun = document.getElementById('btn-auto-run');
    if (btnAutoRun) {
      btnAutoRun.addEventListener('click', () => {
        if (this.autoRunInterval) {
          this.stopAutoRun();
          btnAutoRun.textContent = 'Auto Run';
        } else {
          this.startAutoRun();
          btnAutoRun.textContent = 'Stop';
        }
      });
    }
    
    const btnReset = document.getElementById('btn-reset');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        this.resetSimulation();
      });
    }
    
    // File operation buttons
    const btnSave = document.getElementById('btn-save');
    if (btnSave) {
      btnSave.addEventListener('click', () => {
        this.saveToFile();
      });
    }
    
    const btnLoad = document.getElementById('btn-load');
    if (btnLoad) {
      btnLoad.addEventListener('click', () => {
        document.getElementById('file-input')?.click();
      });
    }
    
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      fileInput.addEventListener('change', (event) => {
        const input = event.target;
        if (input.files && input.files.length > 0) {
          console.log(input.files[0]);
          this.loadFromFile(input.files[0]);
        }
      });
    }
    
    const btnExportPnml = document.getElementById('btn-export-pnml');
    if (btnExportPnml) {
      btnExportPnml.addEventListener('click', () => {
        this.exportToPNML();
      });
    }
  }
  
  /**
   * Updates the active state of toolbar buttons
   */
  updateActiveButton(activeId) {
    const buttons = [
      'btn-select',
      'btn-add-place',
      'btn-add-transition',
      'btn-add-arc'
    ];
    
    buttons.forEach(id => {
      const button = document.getElementById(id);
      if (button) {
        button.classList.toggle('active', id === activeId);
      }
    });
  }
  
  /**
   * Updates the zoom display
   */
  updateZoomDisplay() {
    if (this.zoomDisplay) {
      const zoomPercent = Math.round(this.editor.renderer.zoomFactor * 100);
      this.zoomDisplay.textContent = `${zoomPercent}%`;
    }
  }
  
  /**
   * Handles when an element is selected in the editor
   */
  handleElementSelected(id, type) {
    if (!id || !type) {
      this.propertiesPanel.innerHTML = '<p>No element selected.</p>';
      return;
    }
    
    if (type === 'place') {
      this.showPlaceProperties(id);
    } else if (type === 'transition') {
      this.showTransitionProperties(id);
    } else if (type === 'arc') {
      this.showArcProperties(id);
    }
  }
  
  /**
   * Displays properties for a selected place
   */
  showPlaceProperties(id) {
    const place = this.api.petriNet.places.get(id);
    if (!place) return;
    
    this.propertiesPanel.innerHTML = `
      <div class="form-group">
        <label for="place-id">ID</label>
        <input type="text" id="place-id" value="${id}" disabled>
      </div>
      <div class="form-group">
        <label for="place-label">Label</label>
        <input type="text" id="place-label" value="${place.label}">
      </div>
      <div class="form-group">
        <label for="place-tokens">Tokens</label>
        <input type="number" id="place-tokens" value="${place.tokens}" min="0">
      </div>
      <div class="form-group">
        <label for="place-capacity">Capacity (0 for unlimited)</label>
        <input type="number" id="place-capacity" value="${place.capacity || 0}" min="0">
      </div>
    `;
    
    // Add event listeners to inputs
    const labelInput = document.getElementById('place-label');
    if (labelInput) {
      labelInput.addEventListener('change', (e) => {
        this.api.setLabel(id, e.target.value);
      });
    }
    
    const tokensInput = document.getElementById('place-tokens');
    if (tokensInput) {
      tokensInput.addEventListener('change', (e) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value) && value >= 0) {
          this.api.setPlaceTokens(id, value);
          this.updateTokensDisplay();
        }
      });
    }
    
    const capacityInput = document.getElementById('place-capacity');
    if (capacityInput) {
      capacityInput.addEventListener('change', (e) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value)) {
          place.capacity = value === 0 ? null : value;
          this.editor.render();
        }
      });
    }
  }
  
  /**
   * Displays properties for a selected transition
   */
  showTransitionProperties(id) {
    const transition = this.api.petriNet.transitions.get(id);
    if (!transition) return;
    
    const isEnabled = this.api.petriNet.isTransitionEnabled(id);
    
    this.propertiesPanel.innerHTML = `
      <div class="form-group">
        <label for="transition-id">ID</label>
        <input type="text" id="transition-id" value="${id}" disabled>
      </div>
      <div class="form-group">
        <label for="transition-label">Label</label>
        <input type="text" id="transition-label" value="${transition.label}">
      </div>
      <div class="form-group">
        <label for="transition-priority">Priority</label>
        <input type="number" id="transition-priority" value="${transition.priority}" min="1">
      </div>
      <div class="form-group">
        <label for="transition-delay">Delay (ms)</label>
        <input type="number" id="transition-delay" value="${transition.delay}" min="0">
      </div>
      <div class="form-group">
        <label>Status</label>
        <div style="padding: 8px; background-color: ${isEnabled ? '#d5f5e3' : '#f5e3e6'}; border-radius: 4px;">
          ${isEnabled ? '✅ Enabled' : '❌ Disabled'}
        </div>
      </div>
      <div class="form-group">
        <button id="btn-fire-transition" ${!isEnabled ? 'disabled' : ''}>Fire Transition</button>
      </div>
    `;
    
    // Add event listeners to inputs
    const labelInput = document.getElementById('transition-label');
    if (labelInput) {
      labelInput.addEventListener('change', (e) => {
        this.api.setLabel(id, e.target.value);
      });
    }
    
    const priorityInput = document.getElementById('transition-priority');
    if (priorityInput) {
      priorityInput.addEventListener('change', (e) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value) && value >= 1) {
          transition.priority = value;
          this.editor.render();
        }
      });
    }
    
    const delayInput = document.getElementById('transition-delay');
    if (delayInput) {
      delayInput.addEventListener('change', (e) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value) && value >= 0) {
          transition.delay = value;
          this.editor.render();
        }
      });
    }
    
    const fireButton = document.getElementById('btn-fire-transition');
    if (fireButton) {
      fireButton.addEventListener('click', () => {
        if (this.api.fireTransition(id)) {
          this.updateTokensDisplay();
          // Update the status display since firing might change enablement
          this.showTransitionProperties(id);
        }
      });
    }
  }
  
  /**
   * Displays properties for a selected arc
   */
  showArcProperties(id) {
    const arc = this.api.petriNet.arcs.get(id);
    if (!arc) return;
    
    // Determine source and target elements for better display
    const sourcePlace = this.api.petriNet.places.get(arc.source);
    const sourceTransition = this.api.petriNet.transitions.get(arc.source);
    const targetPlace = this.api.petriNet.places.get(arc.target);
    const targetTransition = this.api.petriNet.transitions.get(arc.target);
    
    const sourceName = sourcePlace ? 
      `Place: ${sourcePlace.label}` : 
      `Transition: ${sourceTransition?.label}`;
    
    const targetName = targetPlace ? 
      `Place: ${targetPlace.label}` : 
      `Transition: ${targetTransition?.label}`;
    
    this.propertiesPanel.innerHTML = `
      <div class="form-group">
        <label for="arc-id">ID</label>
        <input type="text" id="arc-id" value="${id}" disabled>
      </div>
      <div class="form-group">
        <label for="arc-source">Source</label>
        <input type="text" id="arc-source" value="${sourceName}" disabled>
      </div>
      <div class="form-group">
        <label for="arc-target">Target</label>
        <input type="text" id="arc-target" value="${targetName}" disabled>
      </div>
      <div class="form-group">
        <label for="arc-weight">Weight</label>
        <input type="number" id="arc-weight" value="${arc.weight}" min="1">
      </div>
      <div class="form-group">
        <label for="arc-type">Type</label>
        <select id="arc-type">
          <option value="regular" ${arc.type === 'regular' ? 'selected' : ''}>Regular</option>
          <option value="inhibitor" ${arc.type === 'inhibitor' ? 'selected' : ''}>Inhibitor</option>
          <option value="reset" ${arc.type === 'reset' ? 'selected' : ''}>Reset</option>
          <option value="read" ${arc.type === 'read' ? 'selected' : ''}>Read</option>
        </select>
      </div>
      <div class="form-group">
        <label for="arc-label">Label (leave empty to use weight)</label>
        <input type="text" id="arc-label" value="${arc.label !== arc.weight.toString() ? arc.label : ''}">
      </div>
    `;
    
    // Add event listeners to inputs
    const weightInput = document.getElementById('arc-weight');
    if (weightInput) {
      weightInput.addEventListener('change', (e) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value) && value >= 1) {
          this.api.setArcWeight(id, value);
          
          // Also update the label if it was the default (just the weight)
          const labelInput = document.getElementById('arc-label');
          if (labelInput && !labelInput.value) {
            arc.label = value.toString();
          }
        }
      });
    }
    
    const typeSelect = document.getElementById('arc-type');
    if (typeSelect) {
      typeSelect.addEventListener('change', (e) => {
        this.api.setArcType(id, e.target.value);
      });
    }
    
    const labelInput = document.getElementById('arc-label');
    if (labelInput) {
      labelInput.addEventListener('change', (e) => {
        const label = e.target.value || arc.weight.toString();
        arc.label = label;
        this.editor.render();
      });
    }
  }
  
  /**
   * Handles when the Petri net changes
   */
  handleNetworkChanged() {
    // Update the tokens display
    this.updateTokensDisplay();
    
    // If an element is selected, refresh its properties
    if (this.editor.selectedElement) {
      this.handleElementSelected(
        this.editor.selectedElement.id,
        this.editor.selectedElement.type
      );
    }
  }
  
  /**
   * Updates the tokens display in the sidebar
   */
  updateTokensDisplay() {
    // Clear the current display
    this.tokensDisplay.innerHTML = '';
    
    // If there are no places, show a message
    if (this.api.petriNet.places.size === 0) {
      this.tokensDisplay.innerHTML = '<p>No places in the Petri net.</p>';
      return;
    }
    
    // Create a header
    const header = document.createElement('div');
    header.innerHTML = '<strong>Place Tokens:</strong>';
    this.tokensDisplay.appendChild(header);
    
    // Show the tokens for each place
    for (const [id, place] of this.api.petriNet.places) {
      const placeDiv = document.createElement('div');
      placeDiv.textContent = `${place.label}: ${place.tokens}`;
      this.tokensDisplay.appendChild(placeDiv);
    }
  }
  
  /**
   * Steps the simulation by firing one enabled transition
   */
  stepSimulation() {
    const enabledTransitions = this.api.getEnabledTransitions();
    
    if (enabledTransitions.length === 0) {
      alert('No enabled transitions.');
      return;
    }
    
    // Sort by priority (highest first)
    enabledTransitions.sort((a, b) => {
      const transA = this.api.petriNet.transitions.get(a);
      const transB = this.api.petriNet.transitions.get(b);
      return (transB?.priority || 0) - (transA?.priority || 0);
    });
    
    // Fire the highest priority transition
    this.api.fireTransition(enabledTransitions[0]);
  }
  
  /**
   * Starts auto-running the simulation
   */
  startAutoRun() {
    // Stop any existing interval
    this.stopAutoRun();
    
    // Start a new interval
    this.autoRunInterval = window.setInterval(() => {
      const enabledTransitions = this.api.getEnabledTransitions();
      if (enabledTransitions.length === 0) {
        this.stopAutoRun();
        alert('Auto-run stopped: no more enabled transitions.');
        const autoRunButton = document.getElementById('btn-auto-run');
        if (autoRunButton) {
          autoRunButton.textContent = 'Auto Run';
        }
        return;
      }
      
      this.stepSimulation();
    }, this.autoRunDelay);
  }
  
  /**
   * Stops auto-running the simulation
   */
  stopAutoRun() {
    if (this.autoRunInterval !== null) {
      clearInterval(this.autoRunInterval);
      this.autoRunInterval = null;
    }
  }
  
  /**
   * Resets the simulation to initial state
   */
  resetSimulation() {
    // This is a simplified reset that just reloads the current net
    // In a real implementation, you'd want to store initial tokens and restore them
    this.stopAutoRun();
    
    // For now, just reload the current net
    const json = this.api.exportAsJSON();
    this.api = PetriNetAPI.importFromJSON(json);
    this.editor = this.api.attachEditor(this.canvas);
    
    // Reset UI state
    this.editor.setOnSelectCallback(this.handleElementSelected.bind(this));
    this.editor.setOnChangeCallback(this.handleNetworkChanged.bind(this));
    this.editor.setSnapToGrid(this.gridEnabled);
    this.editor.setMode('select');
    this.updateActiveButton('btn-select');
    
    // Render the network
    this.editor.render();
    this.updateTokensDisplay();
    this.updateZoomDisplay();
    this.propertiesPanel.innerHTML = '<p>No element selected.</p>';
  }
  
  /**
   * Resets the Petri net completely
   */
  resetPetriNet() {
    this.stopAutoRun();
    
    // Create a new Petri net
    this.api = new PetriNetAPI();
    this.editor = this.api.attachEditor(this.canvas);
    
    // Reset UI state
    this.editor.setOnSelectCallback(this.handleElementSelected.bind(this));
    this.editor.setOnChangeCallback(this.handleNetworkChanged.bind(this));
    this.editor.setSnapToGrid(this.gridEnabled);
    this.editor.setMode('select');
    this.updateActiveButton('btn-select');
    
    // Render the network
    this.editor.render();
    this.updateTokensDisplay();
    this.updateZoomDisplay();
    this.propertiesPanel.innerHTML = '<p>No element selected.</p>';
  }

  /**
   * Creates a File object from JSON data
   */
  createFileFromJSON(jsonData, fileName = "data.json") {
    console.log(jsonData);
    const jsonString = typeof jsonData === 'object' ? 
      JSON.stringify(jsonData, null, 2) : 
      jsonData;

    const blob = new Blob([jsonString], { type: "application/json" });
    const file = new File([blob], fileName, { type: "application/json" });
    return file;
  }
  
  
  /**
   * Loads a template Petri net
   */
  loadTemplate(template_path) {
    this.stopAutoRun();
    fetch(template_path)
      .then((response) => {
          if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(jsonData => {
          const file = this.createFileFromJSON(jsonData);
        return this.loadFromFile(file);
      })
      .catch(error => {
          console.error("Error loading template:", error);
      });
    }

  
  /**
   * Saves the current Petri net to a JSON file
   */
  saveToFile() {
    const json = this.api.exportAsJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'petri-net.json';
    a.click();
    
    URL.revokeObjectURL(url);
  }
  
  /**
   * Loads a Petri net from a JSON file
   */
  loadFromFile(file) {
   
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result;
        console.log(json);
        this.api = PetriNetAPI.importFromJSON(json);
        this.editor = this.api.attachEditor(this.canvas);
        
        // Reset UI state
        this.editor.setOnSelectCallback(this.handleElementSelected.bind(this));
        this.editor.setOnChangeCallback(this.handleNetworkChanged.bind(this));
        this.editor.setSnapToGrid(this.gridEnabled);
        this.editor.setMode('select');
        this.updateActiveButton('btn-select');
        
        // Render the network
        this.editor.render();
        this.updateTokensDisplay();
        this.updateZoomDisplay();
        this.propertiesPanel.innerHTML = '<p>No element selected.</p>';
      } catch (error) {
        alert('Error loading file: ' + error);
      }
    };
    reader.readAsText(file);
  }

  loadTemplateFile(file) {
    return fetch(file).then(response => response.json());
  }
  
  /**
   * Exports the current Petri net to PNML format
   */
  exportToPNML() {
    const pnml = this.api.exportAsPNML();
    const blob = new Blob([pnml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'petri-net.pnml';
    a.click();
    
    URL.revokeObjectURL(url);
  }
}

window.PetriNetApp = PetriNetApp;