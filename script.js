//This JavaScript uses several APIs to fetch the latest COVID-19 data and news. The data and news is then presented in tables and charts for ease-of-viewing. 

//Initialise Google Charts  
google.charts.load('current', {packages: ['corechart']});
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } 
}

var bingKey = `ArL7AHBx0Kg7wgSFzCpA58SuW4YBn0d5cDpDPhk98YI1xp9rn6XZcOwDPzkQrKcZ`;
var covidMap = L.map('mapid').setView([30, -10], 0);
L.tileLayer.bing(bingKey).addTo(covidMap);
var countryMarker=L.marker;

$(document).ready(function(){

  getSummary();
  getNews();
  getMap();

  $('#searchBtn').on('click',function(){
    let selectedCountry=$('#countrySelect').val();
    if(selectedCountry==null){
      alert('Please select a country!')
    }else{
      $('#newChart').empty();
      $('#confirmedChart').empty();
      $('#countryStats').css("display","block");
      getCountryData(selectedCountry);
    }
  })

//Populate map with Bing maps layer and fetch api data for country circles
  function getMap(){
    fetch(`https://disease.sh/v2/countries`)
    .then (response=>{
      return response.json();
    })
    .then(data=>{
      let dataLength = Object.keys(data).length;
      for (let i =0;i<dataLength;i++){
        let countryName=data[i].country
        let countryLat=data[i].countryInfo.lat
        let countryLong=data[i].countryInfo.long
        let countryCases=data[i].cases
        let circleRadius = countryCases/20
        var circle=L.circle([countryLat, countryLong], {
          color: 'red',
          fillColor: '#f03',
          fillOpacity: 0.5,
          radius: circleRadius,
        }).addTo(covidMap)

        circle.bindPopup(`<u>${countryName}:</u><br>
        <b>${data[i].cases.toLocaleString()
        } Total Cases</b><br>
        ${data[i].active.toLocaleString()
        } Active Cases<br>
        ${data[i].recovered.toLocaleString()
        } Recovered<br>
        ${data[i].deaths.toLocaleString()
        } Deaths`).addTo(covidMap);
        
        circle.on('mouseover', function () {
            this.openPopup();
        });
        circle.on('mouseout', function () {
            this.closePopup();
        });
      }
    })
    .catch(error=>{
      alert("Map API Error! Please refresh or wait for a few minutes before loading.")
    })
  }


  //Fetch global statistics from api
  function getSummary(){
    fetch("https://disease.sh/v2/all")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      result={};
      result['confirmed']=data.cases;
      result['recovered']=data.recovered;
      result['critical']=data.critical;
      result['deaths']=data.deaths;
      result['active']=data.active;

      //Get Global Summary
      $('#globalConfirmed').text(result['confirmed'].toLocaleString());
      $('#globalActive').text(result['active'].toLocaleString());
      $('#globalCritical').text(result['critical'].toLocaleString());
      $('#globalRecovered').text(result['recovered'].toLocaleString());
      $('#globalDeaths').text(result['deaths'].toLocaleString());
      })

    .then(data=>{

      //Pie Chart of global summary data
      var dataPieGlobal = new google.visualization.DataTable();
      dataPieGlobal.addColumn('string', 'Cases');
      dataPieGlobal.addColumn('number', 'Number of Cases');
      dataPieGlobal.addRows([
        ['Active', result['active']],
        ['Critical', result['critical']],
        ['Deaths', result['deaths']],
        ['Recovered', result['recovered']],
      ]);
      var optionsPieGlobal = {
        title:'Global Infected Cases',
        is3D:true,
        width:320,
        backgroundColor:{fill:'none'},
        chartArea:{left:5,top:0,width:'75%',height:'100%'},
        legendTextStyle:{fontSize: 12},
        slices: [{color: '#4285F4'}, {color: '#FBBC05'}, {color: '#EA4335'}, {color: '#34A853'}],
      };
      var chartPieGlobal = new google.visualization.PieChart(document.getElementById('globalPieChart'));
      google.charts.setOnLoadCallback(chartPieGlobal.draw(dataPieGlobal, optionsPieGlobal));
      })
    .catch(error=>{
      alert("COVID API Error! Please refresh or wait for a few minutes before loading.")
    });
  }


  //Fetch api data by country
  function getCountryData(country){
    fetch(`https://disease.sh/v2/countries/${country}`)
    .then(response => {
      return response.json()
    })
    .then(data=>{
      countryData={}
      countryData['country']=data.country
      countryData['flag']=data.countryInfo.flag
      countryData['lat']=data.countryInfo.lat
      countryData['long']=data.countryInfo.long
      countryData['confirmed']=data.cases
      countryData['deaths']=data.deaths
      countryData['recovered']=data.recovered
      countryData['active']=data.active
      countryData['critical']=data.critical

      //Change Map View to selected country and add marker
      if(countryMarker != undefined) {
        covidMap.removeLayer(countryMarker);
      };
      covidMap.flyTo([countryData['lat'], countryData['long']], 6);
      countryMarker=L.marker([countryData['lat'], countryData['long']]).addTo(covidMap)

      //Add marker to selected country on map
      countryMarker.bindPopup(`<u>${countryData['country']}:</u><br>
      <b>${countryData['confirmed'].toLocaleString()} Total Cases</b><br>
      ${countryData['active'].toLocaleString()} Active Cases<br>
      ${countryData['critical'].toLocaleString()} Critical Cases<br>
      ${countryData['recovered'].toLocaleString()} Recovered<br>
      ${countryData['deaths'].toLocaleString()} Deaths
      `)

      //Marker display no. of cases popup
      countryMarker.on('mouseover', function () {
        this.openPopup();
      });
      countryMarker.on('mouseout', function () {
        this.closePopup();
      });
        //Statistics Display
      $('#countryNameDisplay').text(countryData['country']);
      $('#countryConfirmed').text(countryData['confirmed'].toLocaleString());
      $('#countryActive').text(countryData['active'].toLocaleString());
      $('#countryCritical').text(countryData['critical'].toLocaleString());
      $('#countryRecovered').text(countryData['recovered'].toLocaleString());
      $('#countryDeaths').text(countryData['deaths'].toLocaleString());
      $('#countryFlag').attr('src',`${countryData['flag']}`)

      // Pie Chart Display of summary
      var dataPieCountry = new google.visualization.DataTable();
      dataPieCountry.addColumn('string', 'Cases');
      dataPieCountry.addColumn('number', 'Number of Cases');
      dataPieCountry.addRows([
        ['Active', countryData['active']],
        ['Critical', countryData['critical']],
        ['Deaths', countryData['deaths']],
        ['Recovered', countryData['recovered']],
      ]);
      var optionsPieCountry = {
        title:`Cases in ${countryData['country']} `,
        is3D:true,
        width:360,
        backgroundColor:{fill:'none'},
        chartArea:{left:5,top:0,width:'75%',height:'100%'},
        legendTextStyle:{fontSize: 12},
        slices: [{color: '#4285F4'}, {color: '#FBBC05'}, {color: '#EA4335'}, {color: '#34A853'}]
      };
      var chartPieCountry = new google.visualization.PieChart(document.getElementById('countryPieChart'));
      google.charts.setOnLoadCallback(chartPieCountry.draw(dataPieCountry, optionsPieCountry));
      //Scroll HTML to Map element
      $('html,body').animate({
      scrollTop: $("#mapid").offset().top-90
      },'fast');
    })
    .catch(error=>{
      alert("COVID API Error! Please refresh or wait for a few minutes before loading.")
    })
    

    //Fetch historical data of selected country for last 90 days
    fetch(`https://disease.sh/v2/historical/${country}?lastdays=180`)
    .then(response => {
      return response.json()
    })
    .then(data=>{
      countryData={}
      countryData['confirmedArray']=data.timeline.cases
      countryData['deathsArray']=data.timeline.deaths
      countryData['recoveredArray']=data.timeline.recovered

      //Confirmed Cases trend Line Graph Display
      var confirmedDataArray =[['Day', 'Total','Recovered','Deaths']]
      for (let i=0;i<180;i++){
        let date=Object.keys(countryData['confirmedArray'])[i]
        let cases=countryData['confirmedArray'][Object.keys(countryData['confirmedArray'])[i]]
        let deaths=countryData['deathsArray'][Object.keys(countryData['deathsArray'])[i]]
        let recovered=countryData['recoveredArray'][Object.keys(countryData['recoveredArray'])[i]]
        confirmedDataArray[i+1]=[new Date(date),parseInt(cases),parseInt(recovered),parseInt(deaths)]
      }
      var dataConfirmed = google.visualization.arrayToDataTable(confirmedDataArray);
      var optionsConfirmed = {
        title: 'TOTAL Cases',
        legend: {position: 'bottom'},
        backgroundColor:{fill:'none'},
        chartArea:{width:'62%'},
        fontSize:10,
        series: {
          0: { color: 'darkblue' },
          1: { color: '#34A853' },
          2: { color: '#EA4335' },
        },
        titleTextStyle: {
          fontSize: 16
        },
      };
      var chartConfirmed = new google.visualization.LineChart(document.getElementById('confirmedChart'));
      google.charts.setOnLoadCallback(chartConfirmed.draw(dataConfirmed, optionsConfirmed));


      //New Cases trend line Graph Display
      var newDataArray = [['Day', 'Total','Recovered','Deaths']]
      for (let i=1;i<180;i++){
        let date=Object.keys(countryData['confirmedArray'])[i]
        let cases=countryData['confirmedArray'][Object.keys(countryData['confirmedArray'])[i]]-countryData['confirmedArray'][Object.keys(countryData['confirmedArray'])[i-1]]
        let deaths=countryData['deathsArray'][Object.keys(countryData['deathsArray'])[i]]-countryData['deathsArray'][Object.keys(countryData['deathsArray'])[i-1]]
        let recovered=countryData['recoveredArray'][Object.keys(countryData['recoveredArray'])[i]]-countryData['recoveredArray'][Object.keys(countryData['recoveredArray'])[i-1]]
        newDataArray[i]=[new Date(date),parseInt(cases),parseInt(recovered),parseInt(deaths)]
      }
      var dataNew = google.visualization.arrayToDataTable(newDataArray);
      var optionsNew = {
        title: 'NEW Cases',
        legend: { position: 'bottom' },
        backgroundColor:{fill:'none'},
        chartArea:{width:'62%'},
        fontSize:10,
        series: {
          0: { color: 'darkblue' },
          1: { color: '#34A853' },
          2: { color: '#EA4335' },
        },
        titleTextStyle: {
          fontSize: 16,
        },
      }
      var chartNew = new google.visualization.LineChart(document.getElementById('newChart'));
      google.charts.setOnLoadCallback(chartNew.draw(dataNew, optionsNew));
    })
    .catch(error=>{
      alert("COVID API Error! Please refresh or wait for a few minutes before loading.")
    })
  }



  //Get News Carousel & News Snippet
  function getNews(){
    fetch('https://zmnews.cognitiveservices.azure.com/bing/v7.0/news/search?setLang=en&count=10&originalImg=true&q=covid-19',{
      headers: {
        "Ocp-Apim-Subscription-Key": "5476858e0a8c47138a09dd9a0bb1d4dc"
      }
    })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      let n=0;
        for(let n=0;n<3;n++){
          console.log(data.value[n])
          $(`#img${n}`).attr('src',data.value[n].image.contentUrl);
          $(`#caption${n}`).text(data.value[n].provider[0].name);
          $(`#description${n}`).text(data.value[n].name);
          $(`#img${n}Link`).attr('href',data.value[n].image.contentUrl);
          $(`#news${n}Link`).attr('href',data.value[n].url);
          $(`#newsImage${n}`).attr('src',data.value[n].image.contentUrl);
          $(`#newsHead${n}`).text(data.value[n].provider[0].name);
          $(`#newsContent${n}`).text(data.value[n].name);
          $(`#newsLink${n}`).attr('href',data.value[n].url);
        }
    })
    .catch(error=>{
      alert("News API Error! Please refresh or wait for a few minutes before loading.")
    })
  }
});

