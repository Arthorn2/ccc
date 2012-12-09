/**
 * @name pvc.visual.legend.BulletItemSceneSelection
 * @class A selection behavior mixin for the legend bullet item scene. 
 * Represents and controls the selected state of its datums.
 * 
 * @extends pvc.visual.legend.BulletItemScene
 */
def
.type('pvc.visual.legend.BulletItemSceneSelection')
.add(/** @lends pvc.visual.legend.BulletItemSceneSelection# */{
    /**
     * Returns <c>true</c> if there are no selected datums in the owner data, 
     * or if at least one non-null datum of the scene's {@link #datums} is selected.
     * @type boolean
     */
    isOn: function(){
        var owner = (this.group || this.datum).owner;
        return !owner.selectedCount() || 
               this.datums().any(function(datum){
                   return !datum.isNull && datum.isSelected; 
               });
        
        // Cannot use #isSelected() cause it includes null datums.
        //return this.isSelected();
    },
    
    /**
     * Returns the value of the chart option "selectable". 
     * @type boolean
     */
    isClickable: function(){
        return this.chart().options.selectable;
    },
    
    /**
     * Toggles the selected state of the datums present in this scene
     * and updates the chart if necessary.
     */
    click: function(){
        var datums = this.datums().array();
        if(datums.length){
            var chart = this.chart();
            chart._updatingSelections(function(){
                datums = chart._onUserSelection(datums);
                if(datums){
                    var on = def.query(datums).any(function(datum){ return datum.isSelected; });
                    pvc.data.Data.setSelected(datums, !on);
                }
            });
        }
    }
});
