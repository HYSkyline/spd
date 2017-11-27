// 设定图层交互式效果
function geomOutline(feature, layer) {
    layer.geomname = geoData.geomname;
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    })
}
// 鼠标悬浮在要素某一部分的效果
function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({
        weight: 5,
        color: 'rgba(255,255,255,1)',
        dashArray: '',
        fillOpacity: 0.7
    });
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    infoUpdate(layer.feature.properties);
}
// 鼠标移开要素某一部分的效果
function resetHighlight(e) {
    var layer = e.target;
    // console.log(layer);
    var layerData = Data.get(layer.geomname);
    layer.setStyle({
        weight: 1,
        opacity: 1,
        color: 'white',
        fillColor: getColor(eval('layer.feature.properties.' + layerData.fieldSymbol), layerData.fieldStyle, layerData.SymbolDivideNum, layerData.legendColorList),
        fillOpacity: 0.4
    });
    infoUpdate('');
}
// 点击要素，自动缩放使要素充满视图
function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}
// 鼠标悬浮时更新显示的要素信息
function infoUpdate(infodict) {
    var geotable = document.getElementById('geoinfoTable');
    geotable.innerHTML = '';
    if (infodict !== '') {
        for (var i = 0; i < Object.keys(infodict).length; i++) {
            var geotableRow = document.createElement('tr');
            var geotableBody = document.createElement('td');
            var geotableValue = document.createElement('td');
            geotableBody.innerHTML = Object.keys(infodict)[i];
            geotableValue.innerHTML = infodict[Object.keys(infodict)[i]];
            geotableRow.appendChild(geotableBody);
            geotableRow.appendChild(geotableValue);
            geotable.appendChild(geotableRow);
        }
    }
}
