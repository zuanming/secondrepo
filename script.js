
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
    $('#newChart').empty();
    $('#confirmedChart').empty();
    $('#countryStats').css("display","block");
    getCountryData(selectedCountry);
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
      var confirmedDataArray =[['Day', 'Confirmed','Recovered','Deaths']]
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
        }
      };

      var chartConfirmed = new google.visualization.LineChart(document.getElementById('confirmedChart'));
      google.charts.setOnLoadCallback(chartConfirmed.draw(dataConfirmed, optionsConfirmed));

      

  

      //New Cases trend line Graph Display
      var newDataArray = [['Day', 'Confirmed','Recovered','Deaths']]
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
        }
      }
      var chartNew = new google.visualization.LineChart(document.getElementById('newChart'));
      google.charts.setOnLoadCallback(chartNew.draw(dataNew, optionsNew));

    })
  }
  


  //News Carousel
  function getNews(){
    fetch('https://newsapi.org/v2/top-headlines?q=covid-19&category=health&language=en&sortBy=popularity&apiKey=5a45e2dfd22f412fbdbc3139ce8d3b37')
    .then((response) => {
      return response.json();
    })
    .then((data) => {

      //News Carousel 0
      article0={}
      article0['sourceName']=data.articles[0].source.name;
      article0['author']=data.articles[0].author;
      article0['title']=data.articles[0].title;
      article0['url']=data.articles[0].url; 
      article0['image']=data.articles[0].urlToImage;
      $('#img0').attr('src',article0['image']);
      $('#caption0').text(article0['sourceName']);
      $('#description0').text(article0['title']);
      $('#img0Link').attr('href',article0['url']);
      $('#newsImage0').attr('src',article0['image']);
      $('#newsHead0').text(article0['sourceName']);
      $('#newsContent0').text(article0['title']);
      $('#newsLink0').attr('href',article0['url']);
      
      //News Carousel 1
      article1={}
      article1['sourceName']=data.articles[1].source.name;
      article1['author']=data.articles[1].author;
      article1['title']=data.articles[1].title;
      article1['url']=data.articles[1].url;
      article1['image']=data.articles[1].urlToImage;
      $('#img1').attr('src',article1['image']);
      $('#caption1').text(article1['sourceName']);
      $('#description1').text(article1['title']);
      $('#img1Link').attr('href',article1['url']);
      $('#newsImage1').attr('src',article1['image']);
      $('#newsHead1').text(article1['sourceName']);
      $('#newsContent1').text(article1['title']);
      $('#newsLink1').attr('href',article1['url']) ;

      //News Carousel 2
      article2={}
      article2['sourceName']=data.articles[2].source.name;
      article2['author']=data.articles[2].author;
      article2['title']=data.articles[2].title;
      article2['url']=data.articles[2].url;
      article2['image']=data.articles[2].urlToImage;
      $('#img2').attr('src',article2['image']);
      $('#caption2').text(article2['sourceName']);
      $('#description2').text(article2['title']);
      $('#img2Link').attr('href',article2['url']);
      $('#newsImage2').attr('src',article2['image']);
      $('#newsHead2').text(article2['sourceName']);
      $('#newsContent2').text(article2['title']);
      $('#newsLink2').attr('href',article2['url']); 
    })
  }
});

