Ext.ux.BufferedGroupingView = Ext.extend(Ext.grid.GroupingView, {

    //disable group headers collapsable option.
    interceptMouse : Ext.emptyFn,

    rowHeight: 19,
    borderHeight: 2,
    scrollDelay: 100,
    cacheSize: 20,
    cleanDelay: 500,
    groupsList:[],
    passedGroupHeadersHeight:0,
    lastSavedVisibleRowsTemp:null,

    initTemplates : function(){
        Ext.ux.BufferedGroupingView.superclass.initTemplates.call(this);
        var ts = this.templates;
        // empty div to act as a place holder for a row
        ts.rowHolder = new Ext.Template(
            '<div class="x-grid3-row {alt}" style="{tstyle}"></div>'
        );
        ts.rowHolder.disableFormats = true;
        ts.rowHolder.compile();

        ts.rowBody = new Ext.Template(
            '<table class="x-grid3-row-table" border="0" cellspacing="0" cellpadding="0" style="{tstyle}">',
            '<tbody><tr>{cells}</tr>',
            (this.enableRowBody ? '<tr class="x-grid3-row-body-tr" style="{bodyStyle}"><td colspan="{cols}" class="x-grid3-body-cell" tabIndex="0" hidefocus="on"><div class="x-grid3-row-body">{body}</div></td></tr>' : ''),
            '</tbody></table>'
        );
        ts.rowBody.disableFormats = true;
        ts.rowBody.compile();
    },

    getStyleRowHeight : function(){
        return Ext.isBorderBox ? (this.rowHeight + this.borderHeight) : this.rowHeight;
    },

    syncScroll: function(){
        Ext.ux.BufferedGroupingView.superclass.syncScroll.apply(this, arguments);
        this.update();
    },

    // a (optionally) buffered method to update contents of gridview
    update: function(){
        if (this.scrollDelay) {
            if (!this.renderTask) {
                this.renderTask = new Ext.util.DelayedTask(this.doUpdate, this);
            }
            this.renderTask.delay(this.scrollDelay);
        }else{
            this.doUpdate();
        }
    },

    doUpdate: function(){
        if (this.getVisibleRowCount() > 0) {
            var g = this.grid, cm = g.colModel, ds = g.store;
            var cs = this.getColumnData();

            var vr = this.getVisibleRows();
            for (var i = vr.first; i <= vr.last; i++) {
                // if row is NOT rendered and is visible, render it
                if(!this.isRowRendered(i)){
                    var html = this.doBufferViewRender(cs, [ds.getAt(i)], ds, i, cm.getColumnCount(), g.stripeRows, true);
                    this.getRow(i).innerHTML = html;
                }
            }
            this.clean();
        }
    },

    // a buffered method to clean rows
    clean : function(){
        if(!this.cleanTask){
            this.cleanTask = new Ext.util.DelayedTask(this.doClean, this);
        }
        this.cleanTask.delay(this.cleanDelay);
    },

    doClean: function(){
        if (this.getVisibleRowCount() > 0) {
            var vr = this.getVisibleRows();
            vr.first -= this.cacheSize;
            vr.last += this.cacheSize;

            var i = 0, rows = this.getRows();
            // if first is less than 0, all rows have been rendered
            // so lets clean the end...
            if(vr.first <= 0){
                i = vr.last + 1;
            }
            for(var len = this.ds.getCount(); i < len; i++){
                // if current row is outside of first and last and
                // has content, update the innerHTML to nothing
                if ((i < vr.first || i > vr.last) && rows[i].innerHTML) {
                    rows[i].innerHTML = '';
                }
            }
        }
    },

    layout: function(){
        Ext.ux.BufferedGroupingView.superclass.layout.call(this);
        this.update();
    },

    // private
    doRender : function(cs, rs, ds, startRow, colCount, stripe){
        if(rs.length < 1){
            return '';
        }
        var groupField = this.getGroupField(),
            colIndex = this.cm.findColumnIndex(groupField),
            g;

        this.enableGrouping = !!groupField;

        if(!this.enableGrouping || this.isUpdating){
            return this.doBufferViewRender.apply(
                    this, arguments,false);
        }

        var gstyle = 'width:'+this.getTotalWidth()+';';

        var gidPrefix = this.grid.getGridEl().id;
        var cfg = this.cm.config[colIndex];
        var groupRenderer = cfg.groupRenderer || cfg.renderer;
        var prefix = this.showGroupName ?
                     (cfg.groupName || cfg.header)+': ' : '';

        var groups = [], curGroup, i, len, gid;
        for(i = 0, len = rs.length; i < len; i++){
            var rowIndex = startRow + i,
                r = rs[i],
                gvalue = r.data[groupField];

                g = this.getGroup(gvalue, r, groupRenderer, rowIndex, colIndex, ds);
            if(!curGroup || curGroup.group != g){
                gid = gidPrefix + '-gp-' + groupField + '-' + Ext.util.Format.htmlEncode(g);
                   // if state is defined use it, however state is in terms of expanded
                // so negate it, otherwise use the default.
                var isCollapsed = typeof this.state[gid] !== 'undefined' ? !this.state[gid] : this.startCollapsed;
                var gcls = isCollapsed ? 'x-grid-group-collapsed' : '';
                curGroup = {
                    group: g,
                    gvalue: gvalue,
                    text: prefix + g,
                    groupId: gid,
                    startRow: rowIndex,
                    rs: [r],
                    cls: gcls,
                    style: gstyle
                };
                groups.push(curGroup);
            }else{
                curGroup.rs.push(r);
            }
            r._groupId = gid;
        }

        var buf = [];
        for(i = 0, len = groups.length; i < len; i++){
            // maintain groups in an array.
            this.groupsList[i] = groups[i];

            g = groups[i];
            this.doGroupStart(buf, g, cs, ds, colCount);
            buf[buf.length] = this.doBufferViewRender(
                    cs, g.rs, ds, g.startRow, colCount, stripe, false);

            this.doGroupEnd(buf, g, cs, ds, colCount);
        }
        groups = null;
        return buf.join('');
    },

    getVisisbleGroupHeadersHeight : function(visibleHeight) {
        var totalGroupHeadersHeight = 0;
        this.passedGroupHeadersHeight = 0;
        for(var i=0; i<this.groupsList.length; i++) {
            var header = Ext.get(this.groupsList[i].groupId);
            if(header != null){
                var headerOffsetY = header.getOffsetsTo(this.mainBody.dom.parentNode)[1];
                var headerHeight = header.dom.firstChild.offsetHeight;
                if(headerOffsetY < 0){
                    this.passedGroupHeadersHeight += headerHeight;
                }
                if(headerOffsetY >= 0 && headerOffsetY < visibleHeight) {
                    if((headerOffsetY+headerHeight) <= visibleHeight)
                        totalGroupHeadersHeight += headerHeight;
                    else
                        totalGroupHeadersHeight += (visibleHeight-headerOffsetY);
                }
                else if(headerOffsetY < 0 && (headerOffsetY+headerHeight) > 0)
                    totalGroupHeadersHeight += (headerOffsetY+headerHeight);
            }
        }
        return totalGroupHeadersHeight;
    },

    getCalculatedRowHeight : function(){
        return this.rowHeight + this.borderHeight;
    },

    getVisibleRowCount : function(){
        var rh = this.getCalculatedRowHeight();
        var visibleHeight = this.scroller.dom.clientHeight;
        //already used height.
        var uh = this.getVisisbleGroupHeadersHeight(visibleHeight);
         //alert(Math.ceil((visibleHeight-uh) / rh));
        return (visibleHeight < 1) ? 0 : Math.ceil((visibleHeight-uh) / rh);
    },

    getVisibleRows: function(){
        var st = this.scroller.dom.scrollTop;
        if(this.lastSavedVisibleRowsTemp != null &&
           st == this.lastSavedVisibleRowsTemp.scroll &&
           this.lastSavedVisibleRowsTemp.rows.first >= 0) {
            if(this.lastSavedVisibleRowsTemp.rows.last-this.lastSavedVisibleRowsTemp.rows.last)
            return this.lastSavedVisibleRowsTemp.rows;
        }
        var count = this.getVisibleRowCount();
        var sc = st - this.passedGroupHeadersHeight;
        this.passedGroupHeadersHeight = 0;
        // start 4 rows before to aviod empty space on top caused by random miscalculations.
        var start = (sc == 0 ? 0 : Math.floor(sc/this.getCalculatedRowHeight())-4);
        this.lastSavedVisibleRowsTemp =
        {
            scroll: st,
            rows: {
                first: Math.max(start, 0),
                last: Math.min(start + count + 3, this.ds.getCount()-1)
            }
        };
        return this.lastSavedVisibleRowsTemp.rows;
    },

    isRowRendered: function(index){
        var row = this.getRow(index);
        return row && row.childNodes.length > 0;
    },

    doBufferViewRender : function(cs, rs, ds, startRow, colCount, stripe, onlyBody){
        var ts = this.templates, ct = ts.cell, rt = ts.row, rb = ts.rowBody, last = colCount-1;
        var rh = this.getStyleRowHeight();
        var vr = this.getVisibleRows();
        var tstyle = 'width:'+this.getTotalWidth()+';height:'+rh+'px;';
        // buffers
        var buf = [], cb, c, p = {}, rp = {tstyle: tstyle}, r;
        for (var j = 0, len = rs.length; j < len; j++) {
            r = rs[j]; cb = [];
            var rowIndex = (j+startRow);
            var visible = rowIndex >= vr.first && rowIndex <= vr.last;
            if (visible) {
                for (var i = 0; i < colCount; i++) {
                    c = cs[i];
                    p.id = c.id;
                    p.css = i == 0 ? 'x-grid3-cell-first ' : (i == last ? 'x-grid3-cell-last ' : '');
                    p.attr = p.cellAttr = "";
                    p.value = c.renderer(r.data[c.name], p, r, rowIndex, i, ds);
                    p.style = c.style;
                    if (p.value == undefined || p.value === "") {
                        p.value = " ";
                    }
                    // BHM doesn't show dirty flag.
                    //if (r.dirty && typeof r.modified[c.name] !== 'undefined') {
                    //    p.css += ' x-grid3-dirty-cell';
                    //}
                    cb[cb.length] = ct.apply(p);
                }
            }
            var alt = [];
            if(stripe && ((rowIndex+1) % 2 == 0)){
                alt[0] = "x-grid3-row-alt";
            }
            if(r.dirty){
                alt[1] = " x-grid3-dirty-row";
            }
            rp.cols = colCount;
            if(this.getRowClass){
                alt[2] = this.getRowClass(r, rowIndex, rp, ds);
            }
            rp.alt = alt.join(" ");
            rp.cells = cb.join("");
                buf[buf.length] =  !visible ? ts.rowHolder.apply(rp) : (onlyBody ? rb.apply(rp) : rt.apply(rp));
        }
        return buf.join('');
    },

    // this function is over-loaded to improve the performance.
    getRow : function(row){
        if(!this.enableGrouping){
            var rs = Ext.grid.GroupingView.superclass.getRows.call(this);
            return rs[row];
        }
        var g, gs = this.getGroups();
        for(var i = 0, len = gs.length; i < len; i++){
            g = gs[i].childNodes[1].childNodes;
            if(g.length <= row) {
                row -= g.length;
                continue;
            }
            else
                if(row >= 0)
                    return g[row];
        }
    },

    // private
    processRows : function(startRow, skipStripe){
        if(!this.ds || this.ds.getCount() < 1){
            return;
        }
        var rows = this.getRows();
        skipStripe = skipStripe || !this.grid.stripeRows;
        startRow = startRow || 0;
        var F=" x-grid3-row-alt ";

        Ext.each(rows, function(row, idx){
            row.rowIndex = idx;
            if(!skipStripe){
                var A=((idx + 1)%2==0);
                var G=(" "+row.className+" ").indexOf(F)!=-1;

                if(A && A!=G){
                    row.className+=" x-grid3-row-alt"
                }
                else if(A!=G){
                    row.className=row.className.replace("x-grid3-row-alt","")
                }
            }
        });
        // add first/last-row classes
        if(startRow === 0){
            Ext.fly(rows[0]).addClass(this.firstRowCls);
        }
        Ext.fly(rows[rows.length - 1]).addClass(this.lastRowCls);
    },

   /**
    * This method is re-written to support both buffering
    * and Grouping.
    */
    updateAllColumnWidths:function(){
        var D=this.getTotalWidth();
        var H=this.cm.getColumnCount();
        var F=[];
        for(var B=0;B<H;B++){
            F[B]=this.getColumnWidth(B);
        }
        this.innerHd.firstChild.firstChild.style.width=D;
        for(var B=0;B<H;B++){
            var C=this.getHeaderCell(B);
            C.style.width=F[B]
        }
        var G=this.getRows();
        for(var B=0,E=G.length;B<E;B++){
            G[B].style.width=D;

            // following condition must be verified for buffering grid.
            if(G[B].hasChildNodes()) {
                G[B].firstChild.style.width=D;
                var I=G[B].firstChild.rows[0];
                for(var A=0;A<H;A++){
                    I.childNodes[A].style.width=F[A]
                }
            }
        }
        this.onAllColumnWidthsUpdated(F,D)
    },

    onColumnWidthsUpdated : function(cols, w, tw){
        // template method
    },

    setFocusRowCell : function (focusRowCell) {
        this.focusRowCell = focusRowCell;
    },

 processEvent: function(name, e){
 Ext.grid.GroupingView.superclass.processEvent.call(this, name, e);
 var hd = e.getTarget('.x-grid-group-hd', this.mainBody);
 if(hd){
 // group value is at the end of the string
 var field = this.getGroupField(),
 prefix = this.getPrefix(field),
 groupValue = hd.id.substring(prefix.length),
 emptyRe = new RegExp('gp-' + Ext.escapeRe(field) + '--hd');

 // remove trailing '-hd'
 groupValue = groupValue.substr(0, groupValue.length - 3);

 // also need to check for empty groups
  if(groupValue || emptyRe.test(hd.id)){
  this.grid.fireEvent('group' + name, this.grid, field, groupValue, e);
  }

  if(name == 'mousedown' && e.button == 0){
  //this.toggleGroup(hd.parentNode);
  this.toggleAllGroups();
  var gel = Ext.fly(hd.parentNode);
  var headerOffsetY = gel.getOffsetsTo(this.mainBody.dom.parentNode)[1];
        var headerHeight = gel.dom.firstChild.offsetHeight;
  this.scroller.dom.scrollTop = headerOffsetY-headerHeight;
  this.doUpdate();

  }
 }
}

});