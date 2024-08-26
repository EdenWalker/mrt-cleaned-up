async function fetchAndDisplayTrainLineData(trainLine) {
  const config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `http://datamall2.mytransport.sg/ltaodataservice/PCDRealTime?TrainLine=${trainLine}`,
    headers: { 
      'AccountKey': 'LI8D5j1CQYmo+ZwU5QdGtg=='
    }
  };

  try {
    const response = await axios.request(config);
    displayTrainLineData(response.data);
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

function getCheckedTrainLines() {
  const checkboxes = document.querySelectorAll('.train-line-checkbox:checked');
  return Array.from(checkboxes).map(checkbox => checkbox.value);
}

function updateTrainLineData() {
  const trainLines = getCheckedTrainLines();
  // Clear previous data
  document.getElementById('data-list').innerHTML = '';

  trainLines.forEach(trainLine => {
    fetchAndDisplayTrainLineData(trainLine);
  });
}

document.querySelectorAll('.train-line-checkbox').forEach(checkbox => {
  checkbox.addEventListener('change', updateTrainLineData);
});