
$(document).ready(function(){

  //Initialise Google Charts  
  google.charts.load('current', {packages: ['corechart']});


  //Get Week Array
  let week = {}
  for (let i=0;i<7;i++){
    week[i]=getDate(new Date(Date.now() - (6-i)*(1000*60*60*24)))
  }
  

  //Get Month Array
  let month = {}
  for (let i=0;i<6;i++){
    let date = new Date();
    date.setMonth(date.getMonth() - (5-i));
    month[i]=getDate(date)
  }

  //Date Formatter
  function getDate(date){
    return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`
  }


  getSummary()
  getNews()
  $('#searchBtn').on('click',function(){
    let selectedCountry=$('#countrySelect').val()
    $('#newChart').empty()
    $('#confirmedChart').empty()
    getCountryData(selectedCountry)

  })


  //Global Summary
  function getSummary(){
    fetch("https://disease.sh/v2/all")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      result={}
      result['confirmed']=data.cases;
      result['recovered']=data.recovered;
      result['critical']=data.critical;
      result['deaths']=data.deaths;
      result['active']=data.active;

    $('#globalSummary').html(`
      <ul id="globalSummaryList"><h4>${$('#globalSummary').text()}</h4>
        <li class="confirmed">Total Confirmed Cases: ${result['confirmed'].toLocaleString()}</li>
        <li class="critical">Critical Cases: ${result['critical'].toLocaleString()}</li>
        <li class="deaths">Deaths: ${result['deaths'].toLocaleString()}</li>
        <li class="recovered">Recovered Cases: ${result['recovered'].toLocaleString()}</li>
      </ul>
      `)})
      .then(data=>{
      //Pie Chart
      var dataPieGlobal = new google.visualization.DataTable();
      dataPieGlobal.addColumn('string', 'Cases');
      dataPieGlobal.addColumn('number', 'Number of Cases');
      dataPieGlobal.addRows([
        ['Active', result['active']],
        ['Critical Condition', result['critical']],
        ['Deaths', result['deaths']],
        ['Recovered', result['recovered']],
      ]);
      var optionsPieGlobal = {
        title:'Global Infected Cases', 
        width:500,
        backgroundColor:{fill:'none'},
      };
      var chartPieGlobal = new google.visualization.PieChart(document.getElementById('globalPieChart'));
      google.charts.setOnLoadCallback(chartPieGlobal.draw(dataPieGlobal, optionsPieGlobal));
    });

    
  }


  //Data Search Total by country
  function getCountryData(country){
    fetch(`https://disease.sh/v2/countries/${country}`)
    .then(response => {
      return response.json()
    })
    .then(data=>{
      countryData={}
      countryData['country']=data.country
      countryData['flag']=data.countryInfo.flag
      countryData['confirmed']=data.cases
      countryData['deaths']=data.deaths
      countryData['recovered']=data.recovered
      countryData['active']=data.active
      countryData['critical']=data.critical
         //Statistics Display
      $('#statistics').html(`
        <img src="${countryData['flag']}" style="width:50px;height:auto;display:inline;">
        <h6 style="display:inline;">${countryData['country']}</h6>
        <ul>
          <li class="confirmed">Total Confirmed Cases: ${(countryData['confirmed']).toLocaleString()}</li>
          <li class="active">Active: ${(countryData['active']).toLocaleString()}</li>
          <li class="critical">Critical: ${(countryData['critical']).toLocaleString()}</li>
          <li class="recovered">Recovered: ${(countryData['recovered']).toLocaleString()}</li>
          <li class="deaths">Deaths: ${(countryData['deaths']).toLocaleString()}</li>
        </ul>
      `)

      // Pie Chart Display
      var dataPieCountry = new google.visualization.DataTable();
      dataPieCountry.addColumn('string', 'Cases');
      dataPieCountry.addColumn('number', 'Number of Cases');
      dataPieCountry.addRows([
        ['Active', countryData['active']],
        ['Critical', countryData['critical']],
        ['Recovered', countryData['recovered']],
        ['Deaths', countryData['deaths']],
      ]);
      var optionsPieCountry = {
        title:`Cases in ${countryData['country']} `,
        width:500,
        backgroundColor:{fill:'none'},
      };
      var chartPieCountry = new google.visualization.PieChart(document.getElementById('countryPieChart'));
      google.charts.setOnLoadCallback(chartPieCountry.draw(dataPieCountry, optionsPieCountry));

    })
    
    fetch(`https://disease.sh/v2/historical?lastdays=90/${country}`)
    .then(response => {
      return response.json()
    })
    .then(data=>{
      countryData={}
      countryData['confirmedArray']=data[0].timeline.cases
      countryData['deathsArray']=data[0].timeline.deaths
      countryData['recoveredArray']=data[0].timeline.recovered

       // //Line Confirmed Cases Graph Display
      var confirmedDataArray =[['Day', 'Cases','Recovered','Deaths']]
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
      };

      var chartConfirmed = new google.visualization.LineChart(document.getElementById('confirmedChart'));
      google.charts.setOnLoadCallback(chartConfirmed.draw(dataConfirmed, optionsConfirmed));

  

      //Line New Cases Graph Display
      var newDataArray = [['Day', 'Cases','Deaths','Recovered']]
      for (let i=1;i<90;i++){
        let date=Object.keys(countryData['confirmedArray'])[i]
        let cases=countryData['confirmedArray'][Object.keys(countryData['confirmedArray'])[i]]-countryData['confirmedArray'][Object.keys(countryData['confirmedArray'])[i-1]]
        let deaths=countryData['deathsArray'][Object.keys(countryData['deathsArray'])[i]]-countryData['deathsArray'][Object.keys(countryData['deathsArray'])[i-1]]
        let recovered=countryData['recoveredArray'][Object.keys(countryData['recoveredArray'])[i]]-countryData['recoveredArray'][Object.keys(countryData['recoveredArray'])[i-1]]
        newDataArray[i]=[new Date(date),parseInt(cases),parseInt(recovered),parseInt(deaths)]
      }
    
      var dataNew = google.visualization.arrayToDataTable(newDataArray);
      var optionsNew = {
        title: 'New Cases',
        legend: { position: 'bottom' },
        backgroundColor:{fill:'none'},
      };
      var chartNew = new google.visualization.LineChart(document.getElementById('newChart'));
      google.charts.setOnLoadCallback(chartNew.draw(dataNew, optionsNew));
    })
    .catch(fail =>{
      alert('Error!')
    })
  }
  


  //News Carousel
  function getNews(){
    fetch('https://newsapi.org/v2/top-headlines?q=covid-19&language=en&sortBy=popularity&apiKey=5a45e2dfd22f412fbdbc3139ce8d3b37')
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      article0={}
      article0['sourceName']=data.articles[0].source.name;
      article0['author']=data.articles[0].author;
      article0['title']=data.articles[0].title;
      article0['url']=data.articles[0].url; 
      article0['image']=data.articles[0].urlToImage
      $('#img0').attr('src',article0['image'])
      $('#caption0').text(article0['sourceName'])
      $('#description0').text(article0['title'])
      $('#img0Link').attr('href',article0['url']) 
      
      article1={}
      article1['sourceName']=data.articles[1].source.name;
      article1['author']=data.articles[1].author;
      article1['title']=data.articles[1].title;
      article1['url']=data.articles[1].url;
      article1['image']=data.articles[1].urlToImage
      $('#img1').attr('src',article1['image'])
      $('#caption1').text(article1['sourceName'])
      $('#description1').text(article1['title'])
      $('#img1Link').attr('href',article1['url'])

      article2={}
      article2['sourceName']=data.articles[2].source.name;
      article2['author']=data.articles[2].author;
      article2['title']=data.articles[2].title;
      article2['url']=data.articles[2].url;
      article2['image']=data.articles[2].urlToImage
      $('#img2').attr('src',article2['image'])
      $('#caption2').text(article2['sourceName'])
      $('#description2').text(article2['title'])
      $('#img2Link').attr('href',article2['url'])
 
    })
  }
  var weeklyArray=[]

});
