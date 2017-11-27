// 准备着色字段选择框
function selectFieldList() {
    var modalBody = document.getElementById('fieldModalBody');
    modalBody.innerHTML = '';
    // 生成数据中的所有字段
    for (var i = 0; i < Object.keys(geoData.fields.properties).length; i++) {
        var fieldDiv = document.createElement('div');
        fieldDiv.setAttribute('class', 'radio');
        var fieldLabel = document.createElement('label');
        var fieldInput = document.createElement('input');
        fieldInput.setAttribute('type', 'radio');
        fieldInput.setAttribute('name', 'fieldSelectList');
        fieldLabel.appendChild(fieldInput);
        fieldLabel.innerHTML += Object.keys(geoData.fields.properties)[i];
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
    if (geoData.Layer) {
        geoData.Layer.remove();
    }

    // 以setGeoJsonStyle方案生成可视化
    geoData.Layer = L.geoJSON(geojson, {
        style: setGeoJsonStyle,
        onEachFeature: geomOutline
    });

    // 绑定数据至Data库
    // geoData.SymbolDivideNum = 0;
    // geoData.fieldStyle = [10, 20, 30, ...] or = [filename];
    // geoData.fieldSymbol = field or = null;
    // geoData.filename = filename;
    // geoData.geomname = geomname;
    // geoData.legendColorList = ['rgba(255, 255, 255, 1)', 'rgba(255, 128, 128, 1)', 'rgba(255, 0, 0, 1)'] 或 legendColorList = ['rgba(255, 255, 255, 1)']
    Data.set(geoData.geomname, geoData);

    // 写入右上方图层表
    var geomviewListCheck = addGeom(geoData.filename, geoData.geomname, geoData.Layer);
    // 图例写入右下方样式表
    setLegend(geoData.fieldSymbol, geoData.filename, geoData.geomname, geoData.fieldStyle, geoData.SymbolDivideNum, geoData.legendColorList);
    // 要素写入底图
    geoData.Layer.addTo(map);
    map.fitBounds(geoData.Layer.getBounds());
}

// 设置可视化效果
function setGeoJsonStyle(feature) {
    // 尝试获取图例项外部DIV
    var geoLegendContent = document.getElementById('legend-' + geoData.geomname);

    // 确定渲染方式
    var typeRadios = document.getElementsByName('fieldType');
    for (var i = 0; i < typeRadios.length; i++) {
        if (typeRadios[i].checked) {
            geoData.renderType = typeRadios[i].value;
        }
    }

    // 确定用于渲染的字段, fieldSymbol为string类型
    var fieldRadios = document.getElementsByName('fieldSelectList');
    for (var i = 0; i < fieldRadios.length; i++) {
        if (fieldRadios[i].checked) {
            geoData.fieldSymbol = fieldRadios[i].parentNode.innerHTML.replace(/\s+/g,"").slice(41,fieldRadios[i].parentNode.innerHTML.replace(/\s+/g,"").length);
            break;
        }
    }

    // 传入选择用以可视化的字段，返回属性值的划分方案，通过全局变量传入setGeoJsonStyle函数
    // fieldStyle = [0, 10, 20, 30, 40] 或 ['a', 'b', 'c'] 或 fieldStyle = [filename]
    // symbolDivideNum为颜色划分的种类数量int变量
    if (i === fieldRadios.length) {
        geoData.fieldSymbol = null;
        geoData.SymbolDivideNum = 0;
    } else {
        if (geoData.renderType === 'numType') {
            geoData.SymbolDivideNum = document.getElementById('SymbolDivideNumInput').value;
            // 默认值颜色分类为4级
            if (geoData.SymbolDivideNum === "") {
                geoData.SymbolDivideNum = 4;
            }
        } else if (geoData.renderType === 'strType') {
            // 设置geoData.fieldSymbol(为文字变量)的唯一值个数
        }
    }
    geoData.fieldStyle = symbolDivideList(geoData.fieldSymbol, geoData.SymbolDivideNum);

    // 返回渲染设置
    var geoStyleOption = {
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.4,
        fillColor: getColor(eval('feature.properties.' + geoData.fieldSymbol), geoData.fieldStyle, geoData.SymbolDivideNum, [])
    };
    return geoStyleOption;
}
//划定显示分级表, args为字段名的string变量
// divideList = [0, 10, 20, 30, 40] 或 ['a', 'b', 'c'] 或者 divideList = [filename]
function symbolDivideList(args, SymbolDivideNum) {
    // 分彩色渲染、素色渲染、唯一值渲染
    if (geoData.renderType === 'strType') {
        var values = [];
        for (var i = 0; i < geojson.features.length; i++) {
            values.push(eval('geojson.features[i].properties.' + args))
        }
        var uniqueValue = uniqueify(values);
        geoData.SymbolDivideNum = uniqueValue.length;
        return uniqueValue;
    } else if (geoData.renderType === 'numType') {
        if (args === null && SymbolDivideNum === 0) {
            return [geoData.filename];
        } else {
            // divideNum为分类可视化的划分类数
            var values = [];
            var divideList = [];
            // console.log('颜色分类:' + SymbolDivideNum.toString());
            // 以values为容器，通过eval传入具体的属性值
            for (var i = 0; i < geojson.features.length; i++) {
                values.push(eval('geojson.features[i].properties.' + args));
            }
            // 对具体属性值进行排序
            values.sort(compareFunction);
            // 生成属性值的划分区间
            var valueDivideDistance = Math.round(values.length / SymbolDivideNum);
            // 生成属性值划分表
            for (var i = 0; i < SymbolDivideNum - 1; i++) {
                divideList.push(values[valueDivideDistance * (i + 1)]);
            }
            divideList.push(values[values.length - 1]);
            return divideList;
        }
    }
}
// 设置分级色彩
// legendColorList = ['rgba(255, 255, 255, 1)', 'rgba(255, 128, 128, 1)', 'rgba(255, 0, 0, 1)'] 或 legendColorList = ['rgba(255, 255, 255, 1)']
function getColorLevel(SymbolDivideNum) {
    legendColorList = [];
    if (SymbolDivideNum != 0) {
        for (var i = 0; i < SymbolDivideNum; i++) {
            legendColorList.push('rgba(255, ' + Math.floor(i * 255 / SymbolDivideNum).toString() + ', ' + Math.floor(i * 255 / SymbolDivideNum).toString() +', 1)');
        }
    } else {
        legendColorList.push('rgba(255, 255, 255, 1)')
    }
    geoData.legendColorList = legendColorList;
    return legendColorList;
}
// 返回每一级的颜色, 形式如上
function getColor(args, divideList, SymbolDivideNum, legendColorList) {
    if (legendColorList.length > 0) {
        // console.log('legendColorList exist.');
        if (divideList.length > 1) {
            // console.log('开始彩渲, 检测共需循环' + SymbolDivideNum.toString() + '次');
            for (var i = 0; i < SymbolDivideNum; i++) {
                // console.log('当前i: ' + i.toString() + '  当前属性值: ' + args.toString() + '  对比标准: ' + divideList[i].toString());
                if (geoData.renderType === 'numType') {
                    if (args > divideList[i]) {
                        // console.log('返回颜色: ' + legendColorList[i]);
                        return legendColorList[i];
                    }
                    if (i === SymbolDivideNum - 1) {
                        // console.log('最终返回颜色: ' + legendColorList[i]);
                        return legendColorList[i];
                    }
                } else if (geoData.renderType === 'strType') {
                    if (args === divideList[i]) {
                        return legendColorList[i]
                    }
                }
            }
        } else {
            // console.log('开始素渲');
            return legendColorList[0];
        }
    } else {
        // 第一次渲染, 初始化legendColorList
        legendColorList = getColorLevel(SymbolDivideNum);
        if (divideList.length > 1) {
            // console.log('开始彩渲, 检测共需循环' + SymbolDivideNum.toString() + '次');
            for (var i = 0; i < SymbolDivideNum; i++) {
                // console.log('当前属性值: ' + args.toString() + '  对比标准: ' + divideList[i].toString());
                if (geoData.renderType === 'numType') {
                    if (args > divideList[i]) {
                        // console.log('返回颜色: ' + legendColorList[i]);
                        return legendColorList[i];
                    }
                    if (i === SymbolDivideNum - 1) {
                        // console.log('最终返回颜色: ' + legendColorList[i]);
                        return legendColorList[i];
                    }
                } else if (geoData.renderType === 'strType') {
                    if (args === divideList[i]) {
                        return legendColorList[i]
                    }
                }
            }
        } else {
            // console.log('开始素渲');
            return legendColorList[0];
        }
    }
}

// 图例表初始化
function setLegend(fieldSymbol, filename, geomname, fieldStyle, SymbolDivideNum, legendColorList) {
    var legendDiv = document.getElementById('legend-' + geomname);
    if (legendDiv) {
        legendDiv.parentNode.removeChild(legendDiv);
    }
    prepareLegend(fieldSymbol, filename, geomname, fieldStyle, SymbolDivideNum, legendColorList);
}
// 当 fieldStyle.length = 1 且 SymbolDivideNum = 0 时, 可以判定为素色渲染, 否则为彩色渲染
function prepareLegend(fieldSymbol, filename, geomname, fieldStyle, SymbolDivideNum, legendColorList) {
    // 获取图例框要素
    var geoSymbolContainer = document.getElementById('geoSymbolContainer');
    // legend最外围container
    var geoSymbolFeature = document.createElement('div');
    geoSymbolFeature.setAttribute('id', 'legend-' + geomname);
    // 首行显示被渲染的字段-row行
    var geoSymbolHeaderRow = document.createElement('div');
    geoSymbolHeaderRow.setAttribute('class', 'row');
    // 首行显示被渲染的字段-col列
    var geoSymbolHeading = document.createElement('div');
    geoSymbolHeading.setAttribute('class', 'col-md-12');
    geoSymbolHeading.setAttribute('id', 'geoSymbolHeader-' + geomname);
    geoSymbolHeading.setAttribute('onclick', 'selectFieldList()');
    if (fieldSymbol === null) {
        geoSymbolHeading.innerHTML = '点此选择渲染字段';
    } else {
        geoSymbolHeading.innerHTML = fieldSymbol;
    }
    
    // 被渲染字段加入图例框
    geoSymbolHeaderRow.appendChild(geoSymbolHeading);
    geoSymbolFeature.appendChild(geoSymbolHeaderRow);
    
    for (var i = 0; i < fieldStyle.length; i++) {
        // 图例内容行
        var geoSymbolRow = document.createElement('div');
        geoSymbolRow.setAttribute('class', 'row');
        // 以col-3显示图例颜色
        var geoSymbolColor = document.createElement('div');
        geoSymbolColor.setAttribute('class', 'col-md-3');
        // 以col-9显示图例标注
        var geoSymbolLabel = document.createElement('div');
        geoSymbolLabel.setAttribute('class', 'col-md-9');

        // 以div为载体生成图例颜色的具体要素
        var geoSymbolColorDiv = document.createElement('div');
        geoSymbolColorDiv.setAttribute('class', 'legendColor');
        geoSymbolColorDiv.setAttribute('legendGeomname', geomname);
        geoSymbolColorDiv.setAttribute('legendIndex', i);
        geoSymbolColorDiv.setAttribute('id', 'legendColorDiv-' + geomname + '-' + i.toString());
        geoSymbolColorDiv.setAttribute('onclick', 'selectColor("' + geomname + '", ' + i.toString() + ')');
        geoSymbolColorDiv.setAttribute('style', 'background-color: ' + legendColorList[i] + ';');
        geoSymbolColorDiv.innerHTML = '&nbsp';


        // 图例颜色列加载颜色具体要素
        geoSymbolColor.appendChild(geoSymbolColorDiv);
        // 标出图例标注的具体内容
        geoSymbolLabel.innerHTML = fieldStyle[i].toString();

        // 该图例行加载颜色与标注
        geoSymbolRow.appendChild(geoSymbolColor);
        geoSymbolRow.appendChild(geoSymbolLabel);
        // 最外围图例框加载该图例行
        geoSymbolFeature.appendChild(geoSymbolRow);
    }
    // 图例框要素加载图例DIV
    geoSymbolContainer.appendChild(geoSymbolFeature);
}
// 调用颜色选择器
function selectColor(geomname, i) {
    // 弹出图例颜色选择框
    $('#legendColorDiv-' + geomname + '-' + i).colpick({
        colorScheme: 'light',
        color: 'ffffff',
        onChange: function (hsb, hex, rgb, el) {
            // console.log('输出el: onChange');
            // console.log(el);
            var legendIndex = parseInt($(el).attr('legendIndex'));
            // console.log(legendIndex);
            var geoData = Data.get(geomname);
            geoData.legendColorList[i] = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 1)';
            // console.log(geoData.legendColorList);
            for (var layer_i = 0; layer_i < Object.keys(geoData.Layer._layers).length; layer_i++) {
                // console.log('id: ' + Object.keys(geoData.Layer._layers)[layer_i].toString());
                // console.log('prop: ' + geoData.Layer._layers[Object.keys(geoData.Layer._layers)[layer_i]].feature.properties[geoData.fieldSymbol].toString());
                // console.log(geoData.fieldStyle);
                // console.log(geoData.SymbolDivideNum.toString());
                // console.log(geoData.legendColorList);
                geoData.Layer._layers[Object.keys(geoData.Layer._layers)[layer_i].toString()].setStyle({
                    weight: 1,
                    opacity: 1,
                    color: 'white',
                    fillColor: getColor(geoData.Layer._layers[Object.keys(geoData.Layer._layers)[layer_i]].feature.properties[geoData.fieldSymbol], geoData.fieldStyle, geoData.SymbolDivideNum, geoData.legendColorList),
                    fillOpacity: 0.4
                });
            }
            Data.set(geomname, geoData);
            $(el).css('background-color', 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 1)');
        },
        onSubmit: function (hsb, hex, rgb, el) {
            console.log('输出el:');
            // console.log(el);
            // geojsonChangeColor(geomname);
            $(el).attr('slc', '354');
            $(el).colpickHide();
        }
    });
    var geoData = Data.get(geomname);
    $('#legendColorDiv-' + geomname + '-' + i).colpickSetColor(colorRGBToHex(geoData.legendColorList[i]), setCurrent=false);
    $('#legendColorDiv-' + geomname + '-' + i).colpickShow();
}
// 读取图例信息
function getLegend(geomname) {
    var featureSymbolList = [];
    var legendDiv = document.getElementById('legend-' + geomname);
    for (var i = 1; i < legendDiv.childNodes.length - 1; i++) {
        featureSymbolList.push({
            'color': legendDiv.childNodes[i].childNodes[0].childNodes[0].style.backgroundColor,
            'dataValue': legendDiv.childNodes[i].childNodes[1].childNodes[0].innerHTML
        });
    }
    return fieldSelectList;
}
// 'rgb(123, 156, 68)'' --> 'ffec0f'
function colorRGBToHex(rgb){
    var color = rgb.toString().match(/\d+/g);
    var hex = "#";
    for (var i = 0; i < 3; i++) {
        hex += ("0" + Number(color[i]).toString(16)).slice(-2);
    }
    return hex;
}
function geojsonChangeColor(geomname) {
    var geoData = Data.get(geomname);
    geoData.Layer.setStyle({
        weight: 1,
        opacity: 1,
        color: 'white',
        fillColor: getColor(eval('layer.feature.properties.' + layerData.fieldSymbol), layerData.fieldStyle, layerData.SymbolDivideNum, layerData.legendColorList),
        fillOpacity: 0.4
    });
}
function uniqueify(list) {
    var set = new Set(list);
    return Array.from(set);
}