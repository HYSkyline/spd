var map = L.map('map').setView([30.67127182429413, 120.01032656639109], 12);
var streetMap = L.layerGroup([L.tileLayer('http://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})]);
var googleMap = L.layerGroup([L.tileLayer('http://www.google.cn/maps/vt?lyrs=s@189&x={x}&y={y}&z={z}', {
    attribution: 'Map data &copy; 2017 <a href="https://www.google.com/permissions/geoguidelines.html">Google</a>'
})]);
var esriMap = L.layerGroup([L.esri.basemapLayer('Imagery')]);
var blankMap = L.layerGroup([L.tileLayer('')]);
var mapBase = {
    '街道地图': streetMap,
    '卫星影像': googleMap,
    'ESRI HD': esriMap,
    '空白底图': blankMap
};
map.addLayer(blankMap);
premap = blankMap;
