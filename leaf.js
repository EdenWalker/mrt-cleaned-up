let map = L.map('map').setView([1.3521, 103.8198], 11);


// let map = L.map('map').setView([1.3521, 103.8198], 11);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
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
    html: `<div class="custom-cluster-icon"><div class="cluster-icon-title">${stationName}</div><div class="cluster-icon-number">${childCount}</div></div>`,
    className: 'custom-cluster',
    iconSize: [40, 40]
  });
}

// Function to extract attributes from description
function extractAttributes(description) {
  const stationNameMatch = description.match(/<th>STATION_NA<\/th>\s*<td>([^<]+)<\/td>/);
  const stationName = stationNameMatch ? stationNameMatch[1].replace(/ MRT STATION$/, '') : "No Name";
  const exitCodeMatch = description.match(/<th>EXIT_CODE<\/th>\s*<td>(Exit [A-Z0-9]+)<\/td>/);
  const exitCode = exitCodeMatch ? exitCodeMatch[1] : "No Exit Code";
  return { stationName, exitCode };
}

// Fetch and display GeoJSON data for MRT stations
// function fetchAndDisplayMarkers(selectedLine) {
//   axios.get('mrt/LTAMRTStationExit.geoJSON')
//     .then(response => {
//       const geojsonData = response.data;
//       const stationClusters = {};

//       // Clear existing markers and clusters
//       map.eachLayer(layer => {
//         if (layer instanceof L.MarkerClusterGroup) {
//           map.removeLayer(layer);
//         }
//       });

//       L.geoJSON(geojsonData, {
//         onEachFeature: function (feature, layer) {
//           if (feature.properties) {
//             const description = feature.properties.Description || "No Description";
//             const { stationName, exitCode } = extractAttributes(description);
//             const popupContent = `<b>${stationName}</b><br>${exitCode}`;
//             layer.bindPopup(popupContent);

//             if (!stationClusters[stationName]) {
//               stationClusters[stationName] = L.markerClusterGroup({
//                 maxClusterRadius: 60,
//                 disableClusteringAtZoom: 16,
//                 iconCreateFunction: createClusterIcon
//               });
//               map.addLayer(stationClusters[stationName]);
//             }

//             const icon = createCustomIcon(exitCode);
//             const marker = L.marker(layer.getLatLng(), { icon });
//             marker.bindPopup(popupContent);
//             stationClusters[stationName].addLayer(marker);

//             if (selectedLine === 'ALL' || feature.properties.lineName === selectedLine) {
//               if (!lineLayers[selectedLine]) {
//                 lineLayers[selectedLine] = L.layerGroup().addTo(map);
//               }
//               lineLayers[selectedLine].addLayer(marker);
//             }
//           }
//         }
//       });
//     })
//     .catch(error => console.error('Error loading GeoJSON data:', error));
//}

// Fetch initial markers for the default selected line
// document.getElementById('train-line-select').addEventListener('change', (event) => {
//   fetchAndDisplayMarkers(event.target.value);
// });
// fetchAndDisplayMarkers(document.getElementById('train-line-select').value);

// // Function to fetch and display train line data
const apiUrl = 'https://datamall2.mytransport.sg/ltaodataservice/TrainLines';
async function fetchTrainLineData(trainLine) {
  try {
    const response = await fetch(`${apiUrl}?TrainLine=${trainLine}`, {
      headers: {
        'AccountKey': 'LI8D5j1CQYmo+ZwU5QdGtg==',
        'Accept': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    displayTrainLineData(data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function displayTrainLineData(data) {
  const list = document.getElementById('data-list');
  list.innerHTML = '';
  data.value.forEach(item => {
    const listItem = document.createElement('li');
    listItem.textContent = `Station: ${item.Station}, CrowdLevel: ${item.CrowdLevel}`;
    list.appendChild(listItem);
  });
}

// document.getElementById('train-line-select').addEventListener('change', (event) => {
//   fetchTrainLineData(event.target.value);
// });
// fetchTrainLineData(document.getElementById('train-line-select').value);

// Fetch and display MRT stations with a custom icon
const MrtIcon2 = L.icon({
  iconUrl: 'img/MRT.png',
  iconSize: [20, 20],
  iconAnchor: [10, 20],
  popupAnchor: [0, -20]
});

axios.get('mrt/MRTStation.geoJSON')
  .then(response => {
    const MRTStation = response.data;
    L.geoJSON(MRTStation, {
      onEachFeature: function (feature, layer) {
        if (feature.properties && feature.properties.Description) {
          layer.bindPopup(feature.properties.Name);
        }
      },
      pointToLayer: function (feature, latlng) {
        return L.marker(latlng, { icon: MrtIcon2 });
      }
    }).addTo(map);
  })
  // axios.get('mrt/ProcessedGeoJSON.geoJSON')
  // .then(response => {
  //   // console.log(response.data); // Debug: Check the structure of the GeoJSON data
  //   var mrtpolygon = response.data;
  //   L.geoJSON(mrtpolygon, {
  //     onEachFeature: function (feature, layer) {
  //       // console.log(feature.properties); // Debug: Check the properties of each feature
  //       if (feature.properties && feature.properties.STN_NAM_DE) {
  //         layer.bindPopup(feature.properties.STN_NAM_DE);
  //       }
  //     },
  //     style: function (feature) {
  //       return {
  //         fillColor: "#ff0000",
  //         color: "#ff0000",
  //         weight: 2,
  //         opacity: 1
  //       };
  //     }
  //   }).addTo(map);
  // })
  axios.get('mrt/mrtbyline.js')
  .then(response => {
    const mrtLines = response.data;

    // Create a dictionary of stations by their lowercase names for easy lookup
    const stationsByName = {};
    let operator = '';

    mrtLines.forEach(line => {
      if (line.stations) {
        // Handle MRT lines and standard stations
        line.stations.forEach(station => {
          const lowerCaseName = station.name.toLowerCase().trim();
          if (stationsByName[lowerCaseName]) {
            // Append new code if it already exists
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
        // Handle LRT lines with nested loops
        Object.values(line.loops).forEach(loopStations => {
          loopStations.forEach(station => {
            const lowerCaseName = station.name.toLowerCase().trim();
            if (stationsByName[lowerCaseName]) {
              // Append new code if it already exists
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

      // Update the operator if not already set
      if (!operator && line.operator) {
        operator = line.operator;
      }
    });

    // Fetch GeoJSON data
    axios.get('mrt/RapidTransitSystemStation.geojson').then(response => {
      const mrtpolygon = response.data;

      L.geoJSON(mrtpolygon, {
        onEachFeature: function (feature, layer) {
          if (feature.properties && feature.properties.STN_NAM_DE) {
            // Normalize station names by removing extra descriptors
            const rawName = feature.properties.STN_NAM_DE.toLowerCase().trim();
            const stationName = rawName
              .replace(/ mrt station$/, '')
              .replace(/ lrt station$/, '')
             
              .replace(/ facility building$/, '')
              .replace(/ sub station$/, '')
              .replace(/^\s+|\s+$/g, ''); // Remove leading/trailing spaces

            // Log the raw and normalized station names
       
            const station = stationsByName[stationName];

            if (station) {
              const popupContent = `
                Station: ${station.displayName}<br>
                Code: ${station.code}<br>
                Operator: ${station.operator || operator}
              `;
              layer.bindPopup(popupContent);
            } else {
              // Optionally log if station info is not available for debugging
              console.log(`Station information not available for: ${stationName}`);
            }
          }
        },
        style: function (feature) {
          return {
            fillColor: "#ff0000",
            color: "#ff0000",
            weight: 2,
            opacity: 1
          };
        }
      }).addTo(map);
    });
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });

// Helper function to capitalize the first letter of each word
function capitalizeWords(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}



//   axios.get('mrt/mrtbyline.js')
//   .then(response => {
//     const mrtLines = response.data;

//     // Create a dictionary of stations by their lowercase names for easy lookup
//     const stationsByName = {};
//     let operator = '';

//     mrtLines.forEach(line => {
//       if (line.stations) {
//         // Handle MRT lines and standard stations
//         line.stations.forEach(station => {
//           const lowerCaseName = station.name.toLowerCase().trim();
//           if (stationsByName[lowerCaseName]) {
//             // Append new code if it already exists
//             stationsByName[lowerCaseName].code += ` ${station.code}`;
//           } else {
//             stationsByName[lowerCaseName] = {
//               code: station.code,
//               operator: line.operator,
//               displayName: capitalizeWords(station.name)
//             };
//           }
//         });
//       } else if (line.loops) {
//         // Handle LRT lines with nested loops
//         Object.values(line.loops).forEach(loopStations => {
//           loopStations.forEach(station => {
//             const lowerCaseName = station.name.toLowerCase().trim();
//             if (stationsByName[lowerCaseName]) {
//               // Append new code if it already exists
//               stationsByName[lowerCaseName].code += ` ${station.code}`;
//             } else {
//               stationsByName[lowerCaseName] = {
//                 code: station.code,
//                 operator: line.operator,
//                 displayName: capitalizeWords(station.name)
//               };
//             }
//           });
//         });
//       }

//       // Update the operator if not already set
//       if (!operator && line.operator) {
//         operator = line.operator;
//       }
//     });

//     // Fetch GeoJSON data
//     axios.get('mrt/ProcessedGeoJSON.geoJSON').then(response => {
//       const mrtpolygon = response.data;

//       L.geoJSON(mrtpolygon, {
//         onEachFeature: function (feature, layer) {
//           if (feature.properties && feature.properties.STN_NAM_DE) {
//             const stationNameMatch = feature.properties.STN_NAM_DE.match(/^(.*?)( MRT STATION)?$/);
//             const stationName = stationNameMatch ? stationNameMatch[1].toLowerCase().trim() : "No Name";

//             const station = stationsByName[stationName];

//             if (station) {
//               const popupContent = `
//                 Station: ${station.displayName}<br>
//                 Code: ${station.code}<br>
//                 Operator: ${station.operator || operator}
//               `;
//               layer.bindPopup(popupContent);
//             }
//             // No fallback or logging for stations with no information
//           }
//         },
//         style: function (feature) {
//           return {
//             fillColor: "#ff0000",
//             color: "#ff0000",
//             weight: 2,
//             opacity: 1
//           };
//         }
//       }).addTo(map);
//     });
//   })
//   .catch(error => {
//     // Remove or handle errors if needed
//   });

// // Helper function to capitalize the first letter of each word
// function capitalizeWords(str) {
//   return str.replace(/\b\w/g, char => char.toUpperCase());
// }

  // axios.get('mrt/mrtbyline.js')
  // .then(response => {
  //   // Assuming mrtbyline.js exports data in a format like { stations: [], operator: 'XYZ' }
  //   const mrtData = response.data;

  //   // Fetch the GeoJSON data
  //   return axios.get('mrt/ProcessedGeoJSON.geoJSON').then(response => {
  //     const mrtpolygon = response.data;

  //     // Add the GeoJSON layer to the map
  //     L.geoJSON(mrtpolygon, {
  //       onEachFeature: function (feature, layer) {
  //         if (feature.properties && feature.properties.STN_NAM_DE) {
  //           // Extract the station name and remove the " MRT STATION" suffix
  //           const stationNameMatch = feature.properties.STN_NAM_DE.match(/^(.*?)( MRT STATION)?$/);
  //           const stationName = stationNameMatch ? stationNameMatch[1] : "No Name";

  //           // Find the station data from mrtData
  //           const station = mrtData.stations.find(st => st.name === stationName);

  //           if (station) {
  //             const popupContent = `
  //               Station: ${station.name}<br>
  //               Code: ${station.code}<br>
  //               Operator: ${mrtData.operator}
  //             `;
  //             layer.bindPopup(popupContent);
  //           } else {
  //             layer.bindPopup("Station information not available.");
  //           }
  //         }
  //       },
  //       style: function (feature) {
  //         return {
  //           fillColor: "#ff0000",
  //           color: "#ff0000",
  //           weight: 2,
  //           opacity: 1
  //         };
  //       }
  //     }).addTo(map);
  //   });
  // })
  // .catch(error => {
  //   console.error('Error fetching data:', error);
  // });
// // Create a dictionary to hold marker clusters by station
// let stationClusters = {};

// // Function to create custom icons
// function createCustomIcon(exitCode) {
//   const images = iconMapping[exitCode];
  
//   const div = document.createElement('div');
//   div.className = 'custom-icon';
  
//   if (Array.isArray(images)) {
//     images.forEach((src, index) => {
//       const img = document.createElement('img');
//       img.src = src;
//       img.style.position = 'absolute';
//       img.style.top = '0';
//       img.style.left = `${index * 20}px`;
//       div.appendChild(img);
//     });
//   } else {
//     const img = document.createElement('img');
//     img.src = images;
//     div.appendChild(img);
//   }
  
//   return L.divIcon({
//     className: '',
//     html: div.outerHTML,
//     iconSize: [25, 25],
//     iconAnchor: [12, 24],
//     popupAnchor: [0, -24]
//   });
// }
// function createClusterIcon(cluster) {
//   const childCount = cluster.getChildCount();
//   const stationName = cluster.getAllChildMarkers()[0].options.stationName; // Get station name from the first marker

//   return L.divIcon({
//     html: `
//       <div class="custom-cluster-icon">
//         <div class="cluster-icon-title">${stationName}</div>
//         <div class="cluster-icon-number">${childCount}</div>
//       </div>`,
//     className: 'custom-cluster',
//     iconSize: [40, 40]
//   });
// }

