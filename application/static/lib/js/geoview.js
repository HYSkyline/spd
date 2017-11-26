// 更改底图
function changeBaseMap() {
    if (document.getElementById('OpenStreetMap').checked) {
        premap.removeFrom(map);
        premap = streetMap;
        map.addLayer(streetMap);
    }
    else if (document.getElementById('GoogleMap').checked) {
        premap.removeFrom(map);
        map.addLayer(googleMap);
        premap = googleMap;
    }
    else if (document.getElementById('EsriMap').checked) {
        premap.removeFrom(map);
        map.addLayer(esriMap);
        premap = esriMap;
    }
    else {
        premap.removeFrom(map);
        map.addLayer(blankMap);
        premap = blankMap;
    }
}
// 取回一级目录中的二级目录列表
function catalogList(catalogArg) {
    var catalogList = document.getElementById(catalogArg);
    if (catalogList.innerHTML === '') {
        $.ajax({
            type: "GET",
            url: "http://127.0.0.1:5000/api/geocatalog/",
            data: {
                catalog: catalogArg.slice(4,-4)
            },
            contentType: "application/json",
            dataType: "json",
            success: function (data) {
                for (var i = 0; i < data.catalog.length; i++) {
                    var catalogName = document.createElement('li');
                    catalogName.innerHTML = data.catalog[i];
                    catalogList.appendChild(catalogName);
                    catalogName.setAttribute('onclick', "geodataList(this.parentElement.previousElementSibling, this.innerHTML)");
                    catalogList.appendChild(catalogName);
                }
            }
        })
    }
}
// 根据二级目录取回数据名称列表
function geodataList(menuDom, menuValue) {
    menuDom.innerHTML = menuValue + '<span class="caret"></span>';
    var typefilter = document.getElementById('dropdownMenuType').innerHTML.replace(/\s+/g,"").slice(0,-26);
    if (typefilter === '资料类型') {typefilter = ''};
    var rangefilter = document.getElementById('dropdownMenuRange').innerHTML.replace(/\s+/g,"").slice(0,-26);
    if (rangefilter === '空间范围') {rangefilter = ''};
    $.ajax({
        type: "GET",
        url: "http://127.0.0.1:5000/api/geodataList/",
        data: {
            type: typefilter,
            range: rangefilter
        },
        contentType: "application/json",
        dataType: "json",
        success: function (data) {
            viewList = [];
            var geomdataList = document.getElementById('geomdataList');
            geomdataList.innerHTML = '';
            for (var i = 0; i < data.geomlist.length; i++) {
                var geomdataName = document.createElement('li');
                geomdataName.innerHTML = data.geomlist[i][0];
                geomdataList.appendChild(geomdataName);
                geomdataName.setAttribute('onclick', 'getGeomdata("' + data.geomlist[i][0] + '","' + data.geomlist[i][1] + '")');
                geomdataList.appendChild(geomdataName);
            }
        }
    })
}
// 根据数据名称取回数据矢量表
function getGeomdata(filename, geomname) {
    var gridLoading = document.getElementById('gridLoading');
    gridLoading.style.visibility = 'visible';
    if (GeomlistCheck(filename, geomname)) {
        $.ajax({
            type: "GET",
            url: "http://127.0.0.1:5000/api/geomview/",
            data: {
                geomref: geomname
            },
            contentType: "application/json",
            dataType: "json",
            success: function (data) {
                geoData = {};
                geojson = JSON.parse(data.geom);
                selectFieldList(geojson.features[0], filename, geomname);
            }
        })
    }
}

function GeomlistCheck(filename, geomname) {
    for (var i = 0; i < viewList.length; i++) {
        if (viewList[i]===geomname) {
            var geomNote = document.getElementById('geomviewListNote');
            var geomNoteDiv = document.createElement('div');
            geomNoteDiv.setAttribute('class', 'alert alert-warning alert-dismissible');
            geomNoteDiv.setAttribute('role', 'alert');
            geomNoteDiv.setAttribute('id', 'geomviewListDiv');
            var geomNoteButton = document.createElement('button');
            geomNoteButton.setAttribute('type', 'button');
            geomNoteButton.setAttribute('class', 'close');
            geomNoteButton.setAttribute('data-dismiss', 'alert');
            geomNoteButton.setAttribute('aria-label', 'Close');
            var geomNoteSpan = document.createElement('span');
            geomNoteSpan.setAttribute('aria-hidden', 'true');
            geomNoteSpan.innerHTML = '&times;'
            geomNoteButton.appendChild(geomNoteSpan);
            geomNoteDiv.innerHTML += '本图层已添加';
            geomNoteDiv.appendChild(geomNoteButton);
            geomNote.appendChild(geomNoteDiv);

            var gridLoading = document.getElementById('gridLoading');
            gridLoading.style.visibility = 'hidden';
            return false;
        }
    }
    return true
}

function addGeom(filename, geomname, layer) {
    viewList.push(geomname);
    var geomviewList = document.getElementById('geomviewList');
    var geomfileNameDiv = document.createElement('div');
    var geomfileNameLabel = document.createElement('label');
    var geomfileNameInput = document.createElement('input');
    geomfileNameInput.setAttribute('type', 'checkbox');
    geomfileNameInput.setAttribute('name', 'viewList');
    geomfileNameInput.setAttribute('id', 'viewListInput' + geomname);
    geomfileNameLabel.appendChild(geomfileNameInput);
    geomfileNameLabel.innerHTML += filename;
    geomfileNameDiv.appendChild(geomfileNameLabel);
    geomfileNameDiv.setAttribute('id', 'viewListDiv' + geomname);
    geomviewList.appendChild(geomfileNameDiv);
    var geomfileNameInput = document.getElementById('viewListInput' + geomname);
    geomfileNameInput.checked = true;
    geomfileNameInput.addEventListener("click", function () {
        var geomfileNameInput = document.getElementById('viewListInput' + geomname);
        var geoSymbolFeature = document.getElementById('legend-' + geomname);
        if (geomfileNameInput.checked) {
            layer.addTo(map);
            geoSymbolFeature.style.display = 'inline';
        } else {
            layer.removeFrom(map);
            geoSymbolFeature.style.display = 'none';
        }
    });
}
