
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
    //let selectedCountry=$('SG#countrySelect').val().toLowerCase()
    let selectedCountry='SG'
    getCountryData(selectedCountry)

  })


  //Global Summary
  function getSummary(){
    fetch("https://covid-19-data.p.rapidapi.com/totals?format=json", {
      "method": "GET",
      "headers": {
        "x-rapidapi-host": "covid-19-data.p.rapidapi.com",
        "x-rapidapi-key": "6f139a6db5msh514ccc0a5ccfc61p170643jsn7837b3895756"
    	}
    })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      result={}
      result['confirmed']=data[0].confirmed;
      result['recovered']=data[0].recovered;
      result['critical']=data[0].critical;
      result['deaths']=data[0].deaths;
      result['infected']=result['confirmed']-(result['recovered']+result['critical']+result['deaths'])

    $('#globalSummary').html(`
      <ul id="globalSummaryList"><h4>${$('#globalSummary').text()}</h4>
        <li class="confirmed">Total Confirmed Cases: ${result['confirmed'].toLocaleString()}</li>
        <li class="critical">Critical Cases: ${result['critical'].toLocaleString()}</li>
        <li class="deaths">Deaths: ${result['deaths'].toLocaleString()}</li>
        <li class="recovered">Recovered Cases: ${result['recovered'].toLocaleString()}</li>
      </ul>
      <ul style="list-style-type:none;">
        <li class="infected">% Infected: ${(result['infected']/result['confirmed']*100).toFixed(2)}%</li>
        <li class="critical">% Critical: ${(result['critical']/result['confirmed']*100).toFixed(2)}%</li>
        <li class="deaths">% Death: ${(result['deaths']/result['confirmed']*100).toFixed(2)}%</li>
        <li class="recovered">% Recovered: ${(result['recovered']/result['confirmed']*100).toFixed(2)}%</li>
      </ul>
      `)})
      .then(data=>{
      //Pie Chart
      var dataPieGlobal = new google.visualization.DataTable();
      dataPieGlobal.addColumn('string', 'Cases');
      dataPieGlobal.addColumn('number', 'Number of Cases');
      dataPieGlobal.addRows([
        ['Infected', result['infected']],
        ['Critical Condition', result['critical']],
        ['Deaths', result['deaths']],
        ['Recovered', result['recovered']],
      ]);
      var optionsPieGlobal = {title:'Global Infected Cases', width:300};
      var chartPieGlobal = new google.visualization.PieChart(document.getElementById('globalPieChart'));
      google.charts.setOnLoadCallback(chartPieGlobal.draw(dataPieGlobal, optionsPieGlobal));
    });

    
  }


  //Data Search Total by country
  function getCountryData(country){
    $.ajax({
      type: "GET",
      url: "https://api.smartable.ai/coronavirus/stats/SG",
      beforeSend: function(xhrObj) {
        xhrObj.setRequestHeader("Cache-Control", "no-cache");
        xhrObj.setRequestHeader("Subscription-Key", "476d6785feb94ac1a64d793b3f8fa35b");
      },
    })
    .done(function (data) {
      countryData={}
      countryData['country']=data.location.countryOrRegion
      countryData['confirmed']=data.stats.totalConfirmedCases
      countryData['deaths']=data.stats.totalDeaths
      countryData['recovered']=data.stats.totalRecoveredCases
      countryData['infected']=countryData['confirmed']-countryData['deaths']-countryData['recovered']
      let totalDays=data.stats.history.length
      countryData['history'] = []
      for (let i =0;i<60;i++){
        countryData['history'][i]=data.stats.history[totalDays-(60-i)]
      }
      console.log(countryData['history'][0].date)

      //Statistics Display
      $('#statistics').html(`
        <ul><h6>${countryData['country']}</h6>
          <li class="confirmed">Total Confirmed Cases: ${(countryData['confirmed']).toLocaleString()}</li>
          <li class="infected">Infected: ${(countryData['infected']).toLocaleString()}</li>
          <li class="recovered">Recovered: ${(countryData['recovered']).toLocaleString()}</li>
          <li class="deaths">Deaths: ${(countryData['deaths']).toLocaleString()}</li>
        </ul>
        <ul style="list-style-type:none;">
          <li>% Infected: ${(countryData['infected']/countryData['confirmed']*100).toFixed(2)}%</li>
          <li>% Death: ${(countryData['deaths']/countryData['confirmed']*100).toFixed(2)}%</li>
          <li>% Recovered: ${(countryData['recovered']/countryData['confirmed']*100).toFixed(2)}%</li>
        </ul>
      `)

      //Pie Chart Display
      var dataPieCountry = new google.visualization.DataTable();
      dataPieCountry.addColumn('string', 'Cases');
      dataPieCountry.addColumn('number', 'Number of Cases');
      dataPieCountry.addRows([
        ['Infected', countryData['infected']],
        ['Deaths', countryData['deaths']],
        ['Recovered', countryData['recovered']],
      ]);
      var optionsPieCountry = {title:`Infected Cases in ${countryData['country']} `, width:300};
      var chartPieCountry = new google.visualization.PieChart(document.getElementById('countryPieChart'));
      google.charts.setOnLoadCallback(chartPieCountry.draw(dataPieCountry, optionsPieCountry));


      //Line Weekly Graph Display
      var confirmedDataArray =[['Day', 'Confirmed Cases']]
      for (let i=0;i<60;i++){
        let day = countryData['history'][i].date
        let confirmedCase = countryData['history'][i].confirmed
        confirmedDataArray[i+1]=[new Date(day),parseInt(confirmedCase)]
      }
      var dataConfirmed = google.visualization.arrayToDataTable(confirmedDataArray);

      var optionsConfirmed = {
        title: 'Confirmed Cases Trend',
        legend: {position: 'bottom'},
        width:300
      };

      var chartConfirmed = new google.visualization.LineChart(document.getElementById('confirmedChart'));
      google.charts.setOnLoadCallback(chartConfirmed.draw(dataConfirmed, optionsConfirmed));


      //Line Monthly Graph Display
      var newDataArray = [['Day', 'New Cases']]
      for (let i=1;i<60;i++){
        let day = countryData['history'][i].date
        let dayCase = countryData['history'][i].confirmed
        let ytdCase = countryData['history'][i-1].confirmed
        newDataArray[i]=[new Date(day),parseInt(dayCase-ytdCase)]
      }
      console.log(newDataArray)
      var dataNew = google.visualization.arrayToDataTable(newDataArray);
      var optionsNew = {
        title: 'New Cases Trend',
        legend: { position: 'bottom' },
        width:300
      };
      var chartNew = new google.visualization.LineChart(document.getElementById('newChart'));
      google.charts.setOnLoadCallback(chartNew.draw(dataNew, optionsNew));

    })
    .fail(function () {
        alert("error");
    });

    //   
      



     

      

        



   

  }


  //News Carousel
  function getNews(){
    fetch('https://newsapi.org/v2/top-headlines?q=covid-19&language=en&sortBy=popularity&apiKey=5a45e2dfd22f412fbdbc3139ce8d3b37')
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      // console.log(data)
      article0={}
      article0['sourceName']=data.articles[0].source.name;
      article0['author']=data.articles[0].author;
      article0['title']=data.articles[0].title;
      article0['image']=data.articles[0].urlToImage
      $('#img0').attr('src',article0['image'])
      $('#caption0 h5').text(article0['sourceName'])
      $('#caption0 p').text(article0['title'])
      
      article1={}
      article1['sourceName']=data.articles[1].source.name;
      article1['author']=data.articles[1].author;
      article1['title']=data.articles[1].title;
      article1['image']=data.articles[1].urlToImage
      $('#img1').attr('src',article1['image'])
      $('#caption1 h5').text(article1['sourceName'])
      $('#caption1 p').text(article1['title'])

      article2={}
      article2['sourceName']=data.articles[2].source.name;
      article2['author']=data.articles[2].author;
      article2['title']=data.articles[2].title;
      article2['image']=data.articles[2].urlToImage
      $('#img2').attr('src',article2['image'])
      $('#caption2 h5').text(article2['sourceName'])
      $('#caption2 p').text(article2['title'])

 
      

    })
  }
  var weeklyArray=[]

});
