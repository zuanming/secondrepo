$(document).ready(function(){

  //Initialise Google Charts  
  google.charts.load('current', {packages: ['corechart']});



  //Get Week Array
  let week = {}
  for (let i=0;i<7;i++){
    week[i]=getDate(new Date(Date.now() - (6-i)*(1000*60*60*24)))
  }
  console.log(week)

  //Get Month Array
  let month = {}
  for (let i=0;i<6;i++){
    let date = new Date();
    date.setMonth(date.getMonth() - (5-i));
    month[i]=getDate(date)
  }
  console.log(month)

  //Date Formatter
  function getDate(date){
    return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`
  }




  getSummary()
  getNews()
  $('#searchBtn').on('click',function(){
    let selectedCountry=$('#countrySelect').val().toLowerCase()
    getCountryData(selectedCountry)

  })

  //Data Search Total by country
  function getCountryData(country){

    //Get Country COVID Stats
    fetch(`https://covid-19-data.p.rapidapi.com/country?format=json&name=${country}`, {
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
      country={}
      country['country']=data[0].country
      country['confirmed']=data[0].confirmed
      country['recovered']=data[0].recovered
      country['critical']=data[0].critical
      country['deaths']=data[0].deaths
      console.log(country)
      $('#statistics').html(`
        <ul><h6>${country['country']}</h6>
          <li>Confirmed: ${country['confirmed']}</li>
          <li>Recovered: ${country['recovered']}</li>
          <li>Critical: ${country['critical']}</li>
          <li>Deaths: ${country['deaths']}</li>
        </ul>
        <ul style="list-style-type:none;">
          <li>% Critical: ${(country['critical']/country['confirmed']*100).toFixed(2)}%</li>
          <li>% Death: ${(country['deaths']/country['confirmed']*100).toFixed(2)}%</li>
          <li>% Recovered: ${(country['recovered']/result['confirmed']*100).toFixed(2)}%</li>
        </ul>
      `)
      var optionsWeek = {
        title: 'Weekly Data',
        // curveType: 'function',
        legend: { position: 'bottom' }
      };

      var weeklyChart = new google.visualization.LineChart(document.getElementById('weeklyChart'));

      google.charts.setOnLoadCallback(weeklyChart.draw(dataWeek, optionsWeek));

      var dataMonth = google.visualization.arrayToDataTable([
        ['Month', 'Confirmed', 'Dead'],
        ['2004',  1000,      400],
        ['2005',  1170,      460],
        ['2006',  660,       1120],
        ['2007',  1030,      540]
      ]);

      var optionsMonth = {
        title: 'Monthly Data',
        // curveType: 'function',
        legend: { position: 'bottom' }
      };

      var monthlyChart = new google.visualization.LineChart(document.getElementById('monthlyChart'));



      google.charts.setOnLoadCallback(monthlyChart.draw(dataMonth, optionsMonth));
    })

    //Get Country Population Stats
    // fetch("https://countries-cities.p.rapidapi.com/location/country/GB?format=json", {
    //   "method": "GET",
    //   "headers": {
    //     "x-rapidapi-host": "countries-cities.p.rapidapi.com",
    //     "x-rapidapi-key": "6f139a6db5msh514ccc0a5ccfc61p170643jsn7837b3895756"
    //   }
    // })
    // .then(response => {
    //   return response.json();
    // })
    // .then(data => {
    //   population={}

    // })
  }



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
      result['active']=result['confirmed']-(result['recovered']+result['critical']+result['deaths'])

    $('#globalSummary').html(`
      <ul id="globalSummaryList"><h4>${$('#globalSummary').text()}</h4>
        <li>Confirmed Cases: ${result['confirmed'].toLocaleString()}</li>
        <li>Critical Cases: ${result['critical'].toLocaleString()}</li>
        <li>Deaths: ${result['deaths'].toLocaleString()}</li>
        <li>Recovered Cases: ${result['recovered'].toLocaleString()}</li>
        
      </ul>
      <ul style="list-style-type:none;">
        <li>% Critical: ${(result['critical']/result['confirmed']*100).toFixed(2)}%</li>
        <li>% Death: ${(result['deaths']/result['confirmed']*100).toFixed(2)}%</li>
        <li>% Recovered: ${(result['recovered']/result['confirmed']*100).toFixed(2)}%</li>
      </ul>
      `)})
      .then(data=>{

      //Pie Chart
      var data = new google.visualization.DataTable();
        data.addColumn('string', 'Cases');
        data.addColumn('number', 'Number of Cases');
        data.addRows([
          ['Infected', result['active']],
          ['Critical Condition', result['critical']],
          ['Deaths', result['deaths']],
          ['Recovered', result['recovered']],
        ]);


        var options = {title:'Confirmed Cases', width:300};
        var chart = new google.visualization.PieChart(document.getElementById('globalPieChart'));
        google.charts.setOnLoadCallback(chart.draw(data, options));
    });

    
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

      var dataWeek = google.visualization.arrayToDataTable([
        ['Day', 'Confirmed', 'Dead'],
        ['2004',  1000,      400],
        ['2005',  1170,      460],
        ['2006',  660,       1120],
        ['2007',  1030,      540]
      ]);

      

    })
  }

});

