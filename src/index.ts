/*
 * Copyright 2019 Google LLC. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint-disable no-undef, @typescript-eslint/no-unused-vars, no-unused-vars */
import "./style.css";
import data from './output_dry.json';


var globaldata : google.maps.Marker[] = [];
var holidayLayer :google.maps.Data;
var displayedProps = undefined;

const top : any= document.getElementById("tophalf");
top.style.display="None"
const toptitle = top.getElementsByClassName("title")[0];
const topdesc = top.getElementsByClassName("description")[0];
const topfotos = top.getElementsByClassName("fotos")[0];
const topbutton = top.getElementsByClassName("close")[0];

const bot : any = document.getElementById("bottomhalf");
bot.style.display="None"
const bottitle = bot.getElementsByClassName("title")[0];
const botdesc = bot.getElementsByClassName("description")[0];
const botfotos = bot.getElementsByClassName("fotos")[0];
const botbutton = bot.getElementsByClassName("close")[0];
botbutton.onclick = () => bot.style.display="none";

function setMapOnAll(array : google.maps.Marker[], map: google.maps.Map | null) {
  for (let i = 0; i < array.length; i++) {
    array[i].setMap(map);
  }
}
function show_holiday(props) : void{
  console.log("show", props)
  //remove others
  setMapOnAll(globaldata, null);
  setMapOnAll(props["markers"], map)
  //activate ours
  props["data"].setMap(map);
  holidayLayer = props["data"]
  toptitle.innerHTML = props.name;
  topdesc.innerHTML = props.location +"<br>"+ props.start + " - " + props.end + "<br>Deelnemers: " + props.participants + "<br>"+props.description+"<br>";
  topfotos.innerHTML = props.fotos;
  displayedProps = props;
  top.style.display="block"
}

function show_camp(props) : void {
  console.log("camp", props)
  bottitle.innerHTML = props.name;
  botdesc.innerHTML = props.location +"<br>"+ props.start + " - " + props.end + "<br>"+props.description+"<br>";
  botfotos.innerHTML = props.fotos;
  bot.style.display="block" 
}

function hide_holiday(): void {
  const props = displayedProps;
  if (props === undefined) {return;}
  displayedProps = undefined;
  console.log("hide", props)
  setMapOnAll(props["markers"], null)
  setMapOnAll(globaldata, map);
  top.style.display="none"
  bot.style.display="none"

  if (holidayLayer){
    holidayLayer.setMap(null);
  }
}

topbutton.onclick = () =>hide_holiday();
document.onkeyup= function(e){
    e = e || window.event;
    var key = e.which || e.keyCode;
    if(key===27){
        hide_holiday();
    }
};

console.log(data);
let map: google.maps.Map;

function initMap(): void {
  map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
    // center: {lng: 51.1215031, lat: -114.0076156},
    center: { lat: 52.018, lng: 5.645 },
    zoom: 6,
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DEFAULT,
      position: google.maps.ControlPosition.TOP_RIGHT
    },
  }),
  //style applied to every object(feature) only 1?
  //use overrideStyle and revertStyle
  //zindex to order objects
  //https://developers.google.com/maps/documentation/javascript/datalayer

  map.data.setStyle((feature) => {
    return {
      title: feature.getProperty("name"),
    };
  });
  //add markers to the map for all holidays
  for (const holiday in data.features){
    const obj = data.features[holiday]
    const props = obj.properties;
    const coords = obj.geometry.coordinates;

    props["data"] = new google.maps.Data();
    props["data"].setStyle({strokeColor:"red", strokeWeight:5, strokeOpacity:0.5, clickable:false, zIndex:-1})
    props["markers"] = []
    var i =0
    props.locations.features.forEach((loc) =>{
      const c2 = loc.geometry.coordinates;
      const marker = new google.maps.Marker({
        position: new google.maps.LatLng(c2[1], c2[0]),
        // map: props["data"],
        label:{
          text:""+(++i),
          color: "#fff"
        },
        title:props.name
      })
      props["markers"].push(marker)
      marker.addListener("click", ()=>{
        show_camp(loc.properties);
      })
    })
    props["data"].addGeoJson(props.path);

    const marker = new google.maps.Marker({
      position: new google.maps.LatLng(coords[1], coords[0]),
      map,
      label:{
        text: props.start.split('/')[props.start.split('/').length-1].substring(2),
        color: "#fff",
      },
      title:props.name,
    })
    globaldata.push(marker);
    marker.addListener("click", ()=>{
      show_holiday(props);
    })
  }
  console.log(globaldata)
}

// function 
function test(){
  const side= document.getElementById("tophalf")
  //@ts-ignore
  side.innerHTML="<div>Hello, World!</div>"
}
export { initMap, hide_holiday, test};
