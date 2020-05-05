
$(document).ready(function(){

  //Initialise Google Charts  
  google.charts.load('current', {packages: ['corechart']});
  function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } 
}

  getSummary()
  getNews()
  var bingKey = `ArL7AHBx0Kg7wgSFzCpA58SuW4YBn0d5cDpDPhk98YI1xp9rn6XZcOwDPzkQrKcZ`
  var covidMap = L.map('mapid').setView([33, 65], 0);
  L.tileLayer.bing(bingKey).addTo(covidMap);
  getMap()


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
        var circle=L.circle([countryLat, countryLong], {
          color: 'red',
          fillColor: '#f03',
          fillOpacity: 0.5,
          radius: countryCases,
        }).addTo(covidMap)
        circle.bindPopup(`${countryName}: ${countryCases.toLocaleString()} Cases`).addTo(covidMap);
        
        circle.on('mouseover', function () {
            this.openPopup();
        });
        circle.on('mouseout', function () {
            this.closePopup();
        });
      }
      
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

      //Global Summary HTML input
      $('#globalConfirmed').text(result['confirmed'].toLocaleString());
      $('#globalActive').text(result['active'].toLocaleString());
      $('#globalCritical').text(result['critical'].toLocaleString());
      $('#globalRecovered').text(result['recovered'].toLocaleString());
      $('#globalDeaths').text(result['deaths'].toLocaleString());
      })

      .then(data=>{

      //Pie Chart input
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

      //Change Map View to selected country
      covidMap.flyTo([countryData['lat'], countryData['long']], 6);

      var marker=L.marker([countryData['lat'], countryData['long']]).addTo(covidMap)

      //Add marker to selected country on map
      marker.bindPopup(`${countryData['country']}: ${countryData['confirmed'].toLocaleString()} Cases`)

      //Marker display no. of cases popup
      marker.on('mouseover', function () {
        this.openPopup();
      });
      marker.on('mouseout', function () {
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
    

    //Fetch historical data of selected country for last 90 days
    fetch(`https://disease.sh/v2/historical/${country}?lastdays=90`)
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
      for (let i=0;i<90;i++){
        let date=Object.keys(countryData['confirmedArray'])[i]
        let cases=countryData['confirmedArray'][Object.keys(countryData['confirmedArray'])[i]]
        let deaths=countryData['deathsArray'][Object.keys(countryData['deathsArray'])[i]]
        let recovered=countryData['recoveredArray'][Object.keys(countryData['recoveredArray'])[i]]
        confirmedDataArray[i+1]=[new Date(date),parseInt(cases),parseInt(recovered),parseInt(deaths)]
      }

      var dataConfirmed = google.visualization.arrayToDataTable(confirmedDataArray);

      var optionsConfirmed = {
        title: 'Total Cases',
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
          fontSize: 14
        },
      };

      var chartConfirmed = new google.visualization.LineChart(document.getElementById('confirmedChart'));
      google.charts.setOnLoadCallback(chartConfirmed.draw(dataConfirmed, optionsConfirmed));

      

  

      //New Cases trend line Graph Display
      var newDataArray = [['Day', 'Total','Recovered','Deaths']]
      for (let i=1;i<90;i++){
        let date=Object.keys(countryData['confirmedArray'])[i]
        let cases=countryData['confirmedArray'][Object.keys(countryData['confirmedArray'])[i]]-countryData['confirmedArray'][Object.keys(countryData['confirmedArray'])[i-1]]
        let deaths=countryData['deathsArray'][Object.keys(countryData['deathsArray'])[i]]-countryData['deathsArray'][Object.keys(countryData['deathsArray'])[i-1]]
        let recovered=countryData['recoveredArray'][Object.keys(countryData['recoveredArray'])[i]]-countryData['recoveredArray'][Object.keys(countryData['recoveredArray'])[i-1]]
        newDataArray[i]=[new Date(date),parseInt(cases),parseInt(deaths),parseInt(recovered)]
      }
    
      var dataNew = google.visualization.arrayToDataTable(newDataArray);
      var optionsNew = {
        title: 'New Cases',
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
          fontSize: 14
        },
      }
      var chartNew = new google.visualization.LineChart(document.getElementById('newChart'));
      google.charts.setOnLoadCallback(chartNew.draw(dataNew, optionsNew));

    })
  }
  


  //News Carousel
  function getNews(){
    fetch('https://newsapi.org/v2/top-headlines?q=covid-19&language=en&sortBy=popularity&apiKey=5a45e2dfd22f412fbdbc3139ce8d3b37')
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      
      let newsNo=0;
      let artcNo=0
      while (newsNo<3){
        if (data.articles[artcNo+1].title==data.articles[artcNo].title){
          artNo+=1;
        }else{
          $(`#img${artcNo}`).attr('src',data.articles[artcNo].urlToImage);
          $(`#caption${artcNo}`).text(data.articles[artcNo].source.name);
          $(`#description${artcNo}`).text(data.articles[artcNo].title);
          $(`#img${artcNo}Link`).attr('href',data.articles[artcNo].url);
          $(`#newsImage${artcNo}`).attr('src',data.articles[artcNo].urlToImage);
          $(`#newsHead${artcNo}`).text(data.articles[artcNo].source.name);
          $(`#newsContent${artcNo}`).text(data.articles[artcNo].title);
          $(`#newsLink${artcNo}`).attr('href',data.articles[artcNo].url);
          artcNo+=1
          newsNo+=1;
        }
        

        

      }
    })
  }
});

