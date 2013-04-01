/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

def
.type('pvc.visual.TreemapColorDataCell', pvc.visual.DataCell)
.init(function(){
    
    this.base.apply(this, arguments);
    
    var g = this.role.grouping;
    this._valueProp = (!g || g.isSingleDimension) ? 'value' : 'absKey';
})
.add({
    // Select all items that will have colors assigned
    domainItemDatas: function() {
        var domainData = this.domainData();
        var candidates = def.query((domainData || undefined) && domainData.nodes());
        
        if(this.plot.option('ColorMode') === 'byparent') {
            return candidates
                .where(function(itemData) {
                    // The hoverable effect needs colors assigned to parents,
                    // in the middle of the hierarchy,
                    // whose color possibly does not show in normal mode,
                    // cause they have no leaf child (or degenerate child)
                    
                    // the root or a non-degenerate child
                    return (!itemData.parent || itemData.value != null) &&
                        
                        // has at least one 
                        itemData
                        .children()
                        .any(function(child) {
                            // non-degenerate leaf-child
                            return child.value != null && 
                                   child.children().prop('value').all(def.nully);
                        });
                 });
        }
        
        return candidates.where(function(itemData) {
            // Is the single node (root and leaf) Or
            // Is a non-degenerate leaf node Or 
            // Is the last non-degenerate node, from the root, along a branch
            
            // Leaf node
            if(!itemData.childCount()) {
                // Single (root) || non-degenerate
                return !itemData.parent || itemData.value != null;
            }
            
            return itemData.value != null && 
                   !itemData.children().prop('value').any(def.notNully);
        });
    },
    
    domainItemDataValue: function(itemData) { return def.nullyTo(itemData[this._valueProp], ''); },
    
    _resolveDomainData: function() {
        var role = this.role;
        if(role && role.isBound()) {
            var partData = this.plot.chart.partData(this.dataPartValue);
            if(partData){
                return role.select(partData);
            }
        }
        
        return null;
    }
});
