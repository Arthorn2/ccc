pvc.BaseChart
.add({
    _updateSelectionSuspendCount: 0,
    _lastSelectedDatums: null,
    
    /** 
     * Clears any selections and, if necessary,
     * re-renders the parts of the chart that show selected marks.
     * 
     * @type undefined
     * @virtual 
     */
    clearSelections: function(){
        if(this.data.owner.clearSelected()) {
            this.updateSelections();
        }
        
        return this;
    },
    
    _updatingSelections: function(method, context){
        this._suspendSelectionUpdate();
        try {
            method.call(context || this);
        } finally {
            this._resumeSelectionUpdate();
        }
    },
    
    _suspendSelectionUpdate: function(){
        if(this === this.root) {
            this._updateSelectionSuspendCount++;
        } else {
            this.root._suspendSelectionUpdate();
        }
    },
    
    _resumeSelectionUpdate: function(){
        if(this === this.root) {
            if(this._updateSelectionSuspendCount > 0) {
                if(!(--this._updateSelectionSuspendCount)) {
                    this.updateSelections();
                }
            }
        } else {
            this.root._resumeSelectionUpdate();
        }
    },
    
    /** 
     * Re-renders the parts of the chart that show marks.
     * 
     * @type undefined
     * @virtual 
     */
    updateSelections: function(){
        if(this === this.root) {
            if(this._inUpdateSelections) {
                return this;
            }
            
            if(this._updateSelectionSuspendCount) {
                return this;
            }
            
            var selectedChangedDatumMap = this._calcSelectedChangedDatums();
            if(!selectedChangedDatumMap){
                return;
            }
            
            pvc.removeTipsyLegends();
            
            // Reentry control
            this._inUpdateSelections = true;
            try {
                // Fire action
                var action = this.options.selectionChangedAction;
                if(action){
                    var selectedDatums = this.data.selectedDatums();
                    var selectedChangedDatums = selectedChangedDatumMap.values();
                    action.call(
                        this.basePanel._getContext(), 
                        selectedDatums, 
                        selectedChangedDatums);
                }
                
                // Rendering afterwards allows the action to change the selection in between
                this.useTextMeasureCache(function(){
                    this.basePanel.renderInteractive();
                }, this);
            } finally {
                this._inUpdateSelections = false;
            }
        } else {
            this.root.updateSelections();
        }
        
        return this;
    },
    
    _calcSelectedChangedDatums: function(){
        // Capture currently selected datums
        // Calculate the ones that changed.
        var selectedChangedDatums;
        var nowSelectedDatums  = this.data.selectedDatumMap();
        var lastSelectedDatums = this._lastSelectedDatums;
        if(!lastSelectedDatums){
            if(!nowSelectedDatums.count){
                return;
            }
            
            selectedChangedDatums = nowSelectedDatums.clone();
        } else {
            selectedChangedDatums = lastSelectedDatums.symmetricDifference(nowSelectedDatums);
            if(!selectedChangedDatums.count){
                return;
            }
        }
        
        this._lastSelectedDatums = nowSelectedDatums;
        
        return selectedChangedDatums;
    },
    
    _onUserSelection: function(datums){
        if(!datums || !datums.length){
            return datums;
        }
        
        if(this === this.root) {
            // Fire action
            var action = this.options.userSelectionAction;
            if(action){
                return action.call(null, datums) || datums;
            }
            
            return datums;
        }
        
        return this.root._onUserSelection(datums);
    }
});

