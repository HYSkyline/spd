function selectFieldList(feature, filename, geomname) {
    // 准备着色字段选择框
    var modalBody = document.getElementById('fieldModalBody');
    modalBody.innerHTML = '';
    var modalintr = document.createElement('p');
    modalintr.innerHTML = '选择要着色的字段';
    modalBody.appendChild(modalintr);
    var modalfileName = document.createElement('p');
    modalfileName.setAttribute('id', 'modalfilename');
    modalfileName.setAttribute('class', 'modalinfo');
    modalfileName.innerHTML = filename;
    modalBody.appendChild(modalfileName);
    var modalgeomName = document.createElement('p');
    modalgeomName.setAttribute('id', 'modalgeomname');
    modalgeomName.setAttribute('class', 'modalinfo');
    modalgeomName.innerHTML = geomname;
    modalBody.appendChild(modalgeomName);
    // 生成数据中的所有字段
    for (var i = 0; i < Object.keys(feature.properties).length; i++) {
        var fieldDiv = document.createElement('div');
        fieldDiv.setAttribute('class', 'radio');
        var fieldLabel = document.createElement('label');
        var fieldInput = document.createElement('input');
        fieldInput.setAttribute('type', 'radio');
        fieldInput.setAttribute('name', 'fieldSelectList');
        fieldLabel.appendChild(fieldInput);
        fieldLabel.innerHTML += Object.keys(feature.properties)[i];
        fieldDiv.appendChild(fieldLabel);
        modalBody.appendChild(fieldDiv);
    }
    // 隐藏加载页面
    var gridLoading = document.getElementById('gridLoading');
    gridLoading.style.visibility = 'hidden';
    // 弹出着色字段选择框
    $('#fieldModal').modal('show');
}
// 选择字段并渲染文件
function selectField() {
    $('#fieldModal').modal('hide');
    // 确定用于渲染的字段
    var fieldRadios = document.getElementsByName('fieldSelectList');
    var i;
    for (var i = 0; i < fieldRadios.length; i++) {
        if (fieldRadios[i].checked) {
            fieldSymbol = fieldRadios[i].parentNode.innerHTML.replace(/\s+/g,"").slice(41,fieldRadios[i].parentNode.innerHTML.replace(/\s+/g,"").length);
            break;
        }
    }
    // 传入选择用以可视化的字段，返回属性值的划分方案，通过全局变量传入setGeoJsonStyle函数
    if (i === fieldRadios.length) {
        fieldSymbol = null;
        fieldStyle = null;
    } else {
        fieldStyle = symbolDivideList(fieldSymbol);
    }
    // 以setGeoJsonStyle方案生成可视化
    geomJson = L.geoJSON(geojson, {
        style: setGeoJsonStyle,
        onEachFeature: geomOutline
    });
    // 写入左上方图层表
    var filename = document.getElementById('modalfilename').innerHTML;
    var geomname = document.getElementById('modalgeomname').innerHTML;
    var geomviewListCheck = addGeom(filename, geomname, geomJson);
    if (geomviewListCheck) {
        geomJson.addTo(map);
        map.fitBounds(geomJson.getBounds());
    }
}

//划定显示分级表
function symbolDivideList(args) {
    // divideNum为分类可视化的划分类数
    var values = [];
    var divideList = [];
    var divideNum = 7
    // 以values为容器，通过eval传入具体的属性值
    for (var i = 0; i < geojson.features.length; i++) {
        values.push(eval('geojson.features[i].properties.' + args));
    }
    // 对具体属性值进行排序
    values.sort(compareFunction);
    // 生成属性值的划分区间
    var valueDivideDistance = Math.round(values.length / divideNum);
    // 生成属性值划分表
    for (var i = 0; i < divideNum - 1; i++) {
        divideList.push(values[valueDivideDistance * (i + 1)]);
    }
    divideList.push(values[values.length - 1]);
    return divideList;
}
// 设置可视化效果
function setGeoJsonStyle(feature) {
    return {
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.4,
        fillColor: getColor(eval('feature.properties.' + fieldSymbol), fieldStyle)
    };
}
// 返回每一级的颜色
function getColor(args, divideList) {
    if (divideList) {
        return args > divideList[0] ? '#800026' :
            args > divideList[1]  ? '#BD0026' :
            args > divideList[2]  ? '#E31A1C' :
            args > divideList[3]  ? '#FC4E2A' :
            args > divideList[4]   ? '#FD8D3C' :
            args > divideList[5]   ? '#FEB24C' :
            args > divideList[6]   ? '#FED976' :
                        '#FFEDA0';
    } else {
        return '#ffffff'
    }
}
