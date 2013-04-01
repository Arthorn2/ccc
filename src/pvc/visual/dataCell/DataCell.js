/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Initializes a DataCell instance.
 *
 * @name pvc.visual.DataCell
 * @class Describes data requirements of a plot
 *        in terms of a role, given its name, 
 *        a data part value and 
 *        an axis, given its type and index.
 * 
 * @constructor
 * @param {any} value The value of the variable.
 * @param {any} label The label of the variable.
 * @param {any} [rawValue] The raw value of the variable.
 */
def
.type('pvc.visual.DataCell')
.init(function(plot, axisType, axisIndex, roleName, dataPartValue){
    this.plot = plot;
    this.axisType = axisType;
    this.axisIndex = axisIndex;
    this.role = plot.chart.visualRoles[roleName];
    this.dataPartValue = dataPartValue;
})
.add({
    isBound: function() { return this.role && this.role.isBound(); },
    
    domainData: function() { return def.lazy(this, '_domainData', this._resolveDomainData, this); },
    
    // TODO: should this logic be specified in the role itself?
    // Not cached, because sometimes domainData items may not be available,
    // due to trends and multi-charts...
    domainItemDatas: function() {
        var domainData = this.domainData() || undefined; // def.query requires undefined to return a NullQuery
        return def.query(domainData && domainData.children());
    },
    
    // TODO: should this logic be specified in the role itself?
    // The item value function
    domainItemDataValue: function(itemData) {  return def.nullyTo(itemData.value, ''); },
    
    domainItemValues: function() {
        return this.domainItemDatas().select(this.domainItemDataValue, this).distinct();
    },
    
    _resolveDomainData: function() {
        var role = this.role;
        if(role && role.isBound()) {
            var partData = this.plot.chart.partData(this.dataPartValue);
            if(partData) { return role.flatten(partData); }
        }
        
        return null;
    }
});
