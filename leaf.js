let map = L.map('map').setView([1.3521, 103.8198], 11);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Custom icons for exits
const iconMapping = {
  "Exit A": "img/A.png",
  "Exit B": "img/B.png",
  "Exit C": "img/C.png",
  "Exit D": "img/D.png",
  "Exit E": "img/E.png",
  "Exit F": "img/F.png",
  "Exit G": "img/G.png",
  "Exit H": "img/H.png",
  "Exit I": "img/I.png",
  "Exit J": "img/J.png",
  "Exit K": "img/K.png",
  "Exit L": "img/J.png",
  "Exit M": "img/M.png",
  "Exit 1": "img/1.png",
  "Exit 2": "img/2.png",
  "Exit 3": "img/3.png",
  "Exit 4": "img/4.png",
  "Exit 5": "img/5.png",
  "Exit 6": "img/6.png",
  "Exit 7": "img/7.png",
  "Exit 8": "img/8.png",
  "Exit 9": "img/9.png",
  "Exit 10": "img/10.png",
  "Exit 11": "img/11.png",
  "Exit 12": "img/12.png",
  "Exit 13": "img/13.png",
};

function createCustomIcon(exitCode) {
  const src = iconMapping[exitCode];
  return L.divIcon({
    className: 'custom-icon',
    html: `<img src="${src}" style="width: 25px; height: 25px;" />`,
    iconSize: [25, 25],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  });
}

// Function to create cluster icons
function createClusterIcon(cluster) {
  const childCount = cluster.getChildCount();
  const stationName = cluster.getAllChildMarkers()[0].options.stationName;
  return L.divIcon({
    html: `<div class="custom-cluster-icon">
             <div class="cluster-icon-title">${stationName}</div>
             <div class="cluster-icon-number">${childCount}</div>
           </div>`,
    className: 'custom-cluster',
    iconSize: [40, 40]
  });
}

// Function to fetch and display MRT lines
async function fetchTrainLineData(trainLine) {
  const config = {
    method: 'get',
    url: `https://datamall2.mytransport.sg/ltaodataservice/PCDRealTime?TrainLine=${trainLine}`,
    headers: {
      'AccountKey': 'LI8D5j1CQYmo+ZwU5QdGtg=='
    }
  };

  try {
    const response = await axios.request(config);
    const data = response.data;
    displayTrainLineData(data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function displayTrainLineData(data) {
  const list = document.getElementById('data-list');
  list.innerHTML = '';
  // Adjust based on actual structure of `data`
  data.value.forEach(item => {
    const listItem = document.createElement('li');
    listItem.textContent = `Station: ${item.Station}, CrowdLevel: ${item.CrowdLevel}`;
    list.appendChild(listItem);
  });
}

// Define MRT icon
const MrtIcon2 = L.icon({
  iconUrl: 'img/MRT.png',
  iconSize: [20, 20],
  iconAnchor: [10, 20],
  popupAnchor: [0, -20]
});

// Fetch and display MRT stations
// axios.get('mrt/MRTStation.geoJSON')
//   .then(response => {
//     const MRTStation = response.data;
//     L.geoJSON(MRTStation, {
//       onEachFeature: function (feature, layer) {
//         if (feature.properties && feature.properties.Description) {
//           layer.bindPopup(feature.properties.Name);
//         }
//       },
//       pointToLayer: function (feature, latlng) {
//         return L.marker(latlng, { icon: MrtIcon2 });
//       }
//     }).addTo(map);
//   })
//   .catch(error => {
//     console.error('Error fetching MRT stations:', error);
//   });

// Fetch and display MRT lines and stations
axios.get('mrt/mrtbyline.js')
  .then(response => {
    const mrtLines = response.data;
    const stationsByName = {};
    let operator = '';

    mrtLines.forEach(line => {
      if (line.stations) {
        line.stations.forEach(station => {
          const lowerCaseName = station.name.toLowerCase().trim();
          if (stationsByName[lowerCaseName]) {
            stationsByName[lowerCaseName].code += ` ${station.code}`;
          } else {
            stationsByName[lowerCaseName] = {
              code: station.code,
              operator: line.operator,
              displayName: capitalizeWords(station.name)
            };
          }
        });
      } else if (line.loops) {
        Object.values(line.loops).forEach(loopStations => {
          loopStations.forEach(station => {
            const lowerCaseName = station.name.toLowerCase().trim();
            if (stationsByName[lowerCaseName]) {
              stationsByName[lowerCaseName].code += ` ${station.code}`;
            } else {
              stationsByName[lowerCaseName] = {
                code: station.code,
                operator: line.operator,
                displayName: capitalizeWords(station.name)
              };
            }
          });
        });
      }

      if (!operator && line.operator) {
        operator = line.operator;
      }
    });

    axios.get('mrt/RapidTransitSystemStation.geojson')
      .then(response => {
        const mrtpolygon = response.data;
        L.geoJSON(mrtpolygon, {
          onEachFeature: function (feature, layer) {
            if (feature.properties && feature.properties.STN_NAM_DE) {
              const rawName = feature.properties.STN_NAM_DE.toLowerCase().trim();
              const stationName = rawName
                .replace(/ mrt station$/, '')
                .replace(/ lrt station$/, '')
                .replace(/ facility building$/, '')
                .replace(/ sub station$/, '')
                .replace(/^\s+|\s+$/g, '');

              const station = stationsByName[stationName];
              if (station) {
                const popupContent = `Station: ${station.displayName}<br>Code: ${station.code}<br>Operator: ${station.operator || operator}`;
                layer.bindPopup(popupContent);
              } else {
                console.log(`Station information not available for: ${stationName}`);
              }
            }
          },
          style: function (feature) {
            return {
              fillColor: "#ff0000",
              color: "#ff0000",
              weight: 2,
              opacity: 1,
              fillOpacity: 0.2
            };
          }
        }).addTo(map);
      });
  })
  .catch(error => {
    console.error('Error fetching MRT lines and stations:', error);
  });

// Capitalize the first letter of each word in a string
function capitalizeWords(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

// Add event listener for train line checkboxes
document.querySelectorAll('.train-line-checkbox').forEach(checkbox => {
  checkbox.addEventListener('change', function() {
    const trainLine = this.value;
    if (this.checked) {
      fetchTrainLineData(trainLine);
    } else {
      // Handle unchecking logic if needed
    }
  });
});


let config = {
  method: 'get',
  maxBodyLength: Infinity,
  url: 'https://datamall2.mytransport.sg/ltaodataservice/PCDRealTime?TrainLine=NEL',
  headers: { 
    'AccountKey': 'LI8D5j1CQYmo+ZwU5QdGtg=='
  }
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});
