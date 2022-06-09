const DEFAULT_URL = "http://10.138.126.209:5000";
const submitForm = document.querySelector("#submit-form");
const submitInput = document.querySelector("#submit-input");
const SNBrowser = document.querySelector("#sn-browsers");
const fileBrowser = document.querySelector("#file-browsers");
const fileInput = document.querySelector("#file-input");
const modify_btn = document.querySelector("#modify-button");
const reset_btn = document.querySelector("#reset-button");
const plots_parent = document.querySelector("#plots-parent");
const plots = document.querySelector("#plots");
const STATUS = document.querySelector(".status");
var Data;

function handleSNSubmit(event) {
  event.preventDefault();

  if (submitInput.value != "") {
    STATUS.classList.toggle("loading");

    let xhr = new XMLHttpRequest();
    xhr.open("POST", `${DEFAULT_URL}/submit`);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = function () {
      File_List = JSON.parse(xhr.response);

      data = File_List[submitInput.value];

      Object.keys(data).forEach(function (key) {
        add(key);
        plotData(
          submitInput.value,
          key,
          data[key].Angle,
          data[key].Count,
          data[key].Peaks_Pos,
          data[key].Peaks_Height
        );
      });

      Data = data;
      STATUS.classList.toggle("loading");
      modify_btn.classList.toggle("hidden");
    };

    let data = JSON.stringify({
      SN: `${submitInput.value}`,
    });
    xhr.send(data);
  }
}

function plotData(SN, File, Angle, Count, Peaks_Pos, Peaks_Height) {
  colors = [];
  sizes = [];
  for (var i = 0; i < Angle.length; i++) {
    colors.push("C1C1C1");
  }
  let PLOT = document.getElementById(`${File}_plot`);
  let SPAN = document.getElementById(`${File}_span`);
  SPAN.innerHTML = File;
  var myPlot = PLOT,
    Angle,
    Count,
    data = [
      {
        x: Angle,
        y: Count,
        type: "scatter",
        mode: "markers",
        marker: { color: colors, size: 4 },
      },
    ];
  Plotly.newPlot(PLOT, data);
  myPlot.on("plotly_click", function (data) {
    var pn = "",
      tn = "",
      colors = [];

    for (var i = 0; i < data.points.length; i++) {
      pn = data.points[i].pointNumber;
      tn = data.points[i].curveNumber;
      colors = data.points[i].data.marker.color;
    }

    if (colors[pn] != "#FF0000") {
      colors[pn] = "#FF0000";
      Peaks_Pos.push(Angle[pn].toPrecision(4));
      Peaks_Height.push(Count[pn].toPrecision(4));
    } else {
      colors[pn] = "#C1C1C1";
      Peaks_Pos = arrayRemove(Peaks_Pos, Angle[pn].toPrecision(4).toString());
      Peaks_Height = arrayRemove(
        Peaks_Height,
        Count[pn].toPrecision(4).toString()
      );
    }

    var update = { marker: { color: colors, size: 4 } };
    Plotly.restyle(`${File}_plot`, update, [tn]);
    SPAN.innerHTML = `${File} : ${Peaks_Pos}`;
  });
}

function add(id) {
  const span = document.createElement("span");
  const div = document.createElement("div");
  span.setAttribute("id", `${id}_span`);
  div.setAttribute("id", `${id}_plot`);
  document.getElementById("plots").appendChild(span);
  document.getElementById("plots").appendChild(div);
}

function remove() {
  document.getElementById("plots").remove();
  const div = document.createElement("div");
  div.setAttribute("id", "plots");
  div.setAttribute("style", "width: 1100px; height: 2000px");
  document.getElementById("plots-parent").appendChild(div);
  submitInput.value = "";
}
function handleClick(event) {
  let current_value = document.querySelector(`#${event.path[0].id}`).value;
  if (current_value != "") {
    document.querySelector(`#${event.path[0].id}`).value = "";
  }
}

function arrayRemove(arr, value) {
  return arr.filter(function (ele) {
    return ele != value;
  });
}

function handleModify(event) {
  event.preventDefault();

  let xhr = new XMLHttpRequest();
  xhr.open("POST", `${DEFAULT_URL}/calc`);
  xhr.setRequestHeader("Accept", "application/json");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onload = function () {
    remove();
    modify_btn.classList.toggle("hidden");
    console.log(xhr.response);
  };

  Files = [];
  Peaks_Pos = [];
  Peaks_Height = [];

  Object.keys(Data).forEach(function (key) {
    Peaks_Pos.push(Data[key].Peaks_Pos);
    Peaks_Height.push(Data[key].Peaks_Height);
    Files.push(key);
  });

  let data = JSON.stringify({
    SN: submitInput.value,
    File: Files,
    Peaks_Pos: Peaks_Pos,
    Peaks_Height: Peaks_Height,
  });

  console.log(data);
  xhr.send(data);
  alert("Wait a Moment!");
}

function handleReset() {
  remove();
  modify_btn.classList.toggle("hidden");
}

submitForm.addEventListener("submit", handleSNSubmit);
modify_btn.addEventListener("click", handleModify);
reset_btn.addEventListener("click", handleReset);
submitInput.addEventListener("click", handleClick);
